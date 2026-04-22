import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { preflightResponse, withCors } from '@/lib/cors';
import { requireAuth } from '@/lib/auth-middleware';

export async function OPTIONS() {
  return preflightResponse();
}

export async function GET(req) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.ok) {
      return withCors(NextResponse.json({ error: authResult.error }, { status: authResult.status }));
    }

    // Option: fetch fresh user data from DB to ensure user still exists and role hasn't changed
    await dbConnect();
    const user = await User.findById(req.userId).select('-password'); // Exclude password field

    if (!user) {
      return withCors(NextResponse.json({ error: 'User not found' }, { status: 404 }));
    }

    return withCors(NextResponse.json({
      message: 'Authenticated successfully',
      user
    }, { status: 200 }));

  } catch (error) {
    console.error('Fetch Me Error:', error);
    return withCors(NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }));
  }
}
