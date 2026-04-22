import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { errorResponse, preflightResponse, successResponse } from '@/lib/cors';
import { requireAuth } from '@/lib/auth-middleware';

export async function OPTIONS() {
  return preflightResponse();
}

export async function GET(req) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.ok) {
      return errorResponse(authResult.error, authResult.status);
    }

    // Option: fetch fresh user data from DB to ensure user still exists and role hasn't changed
    await dbConnect();
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(
      'Authenticated successfully',
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        department: user.department,
      },
      200
    );

  } catch (error) {
    console.error('Fetch Me Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
