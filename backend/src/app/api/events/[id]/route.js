import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import { errorResponse, preflightResponse, successResponse } from '@/lib/cors';
import { requireAuth } from '@/lib/auth-middleware';

export async function OPTIONS() {
  return preflightResponse();
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const authResult = await requireAuth(req);
    if (!authResult.ok) {
      return errorResponse(authResult.error, authResult.status);
    }

    if (authResult.userRole !== 'organizer') {
      return errorResponse('Forbidden', 403);
    }

    const event = await Event.findById(params.id);
    if (!event) {
      return errorResponse('Event not found', 404);
    }

    if (!event.organizerId || event.organizerId.toString() !== authResult.userId) {
      return errorResponse('Forbidden', 403);
    }

    await Event.findByIdAndDelete(params.id);
    return successResponse('Event deleted successfully', null, 200);
  } catch (error) {
    return errorResponse('Internal Server Error', 500);
  }
}
