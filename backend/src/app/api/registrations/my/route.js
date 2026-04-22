import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Registration from '@/models/Registration';
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

    await connectDB();

    const registrations = await Registration.find({ userId: authResult.userId })
      .populate('eventId', 'title deadline')
      .sort({ createdAt: -1 });

    return successResponse('Registrations fetched successfully', registrations, 200, { count: registrations.length });
  } catch (error) {
    return errorResponse('Internal Server Error', 500);
  }
}
