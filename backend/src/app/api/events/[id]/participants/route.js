import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Registration from '@/models/Registration';
import Event from '@/models/Event';
import { errorResponse, preflightResponse, successResponse } from '@/lib/cors';
import { requireAuth } from '@/lib/auth-middleware';

export async function OPTIONS() {
  return preflightResponse();
}

export async function GET(_req, { params }) {
  try {
    const authResult = await requireAuth(_req);
    if (!authResult.ok) {
      return errorResponse(authResult.error, authResult.status);
    }

    await connectDB();

    const eventId = params?.id;
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return errorResponse('Invalid event id', 400);
    }

    const event = await Event.findById(eventId).select('organizerId');
    if (!event) {
      return errorResponse('Event not found', 404);
    }

    if (String(event.organizerId) !== String(authResult.userId)) {
      return errorResponse('Forbidden', 403);
    }

    const registrations = await Registration.find({ eventId })
      .populate('userId', 'name email rollNumber department')
      .populate('members', 'name email rollNumber department')
      .sort({ createdAt: -1 });

    return successResponse('Participants fetched successfully', registrations, 200, { count: registrations.length });
  } catch (error) {
    return errorResponse('Internal Server Error', 500);
  }
}
