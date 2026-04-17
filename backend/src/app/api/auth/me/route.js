import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { preflightResponse, withCors } from '@/lib/cors';

export async function OPTIONS() {
  return preflightResponse();
}

export async function GET(req) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.split(' ')[1];
    console.log('Auth token (me route):', token);

    if (!token) {
      return withCors(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }));
    }

    // Verify token using our jose helper
    const payload = await verifyToken(token);

    if (!payload) {
      return withCors(NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 }));
    }

    // Option: fetch fresh user data from DB to ensure user still exists and role hasn't changed
    await dbConnect();
    const user = await User.findById(payload.id).select('-password'); // Exclude password field

    if (!user) {
      return withCors(NextResponse.json({ error: 'User not found' }, { status: 404 }));
    }

    return withCors(NextResponse.json({
      message: 'Authenticated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 200 }));

  } catch (error) {
    console.error('Fetch Me Error:', error);
    return withCors(NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }));
  }
}
