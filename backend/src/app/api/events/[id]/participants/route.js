import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Registration from '@/models/Registration';
import Event from '@/models/Event';
import { preflightResponse, withCors } from '@/lib/cors';
import { requireAuth } from '@/lib/auth-middleware';

export async function OPTIONS() {
  return preflightResponse();
}

export async function GET(_req, { params }) {
  try {
    const authResult = await requireAuth(_req);
    if (!authResult.ok) {
      return withCors(NextResponse.json({ success: false, message: authResult.error }, { status: authResult.status }));
    }

    await connectDB();

    const eventId = params?.id;
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return withCors(NextResponse.json({ success: false, message: 'Invalid event id' }, { status: 400 }));
    }

    const event = await Event.findById(eventId).select('organizerId');
    if (!event) {
      return withCors(NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 }));
    }

    if (String(event.organizerId) !== String(authResult.userId)) {
      return withCors(NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 }));
    }

    const registrations = await Registration.find({ eventId })
      .populate('userId', 'name email rollNumber department')
      .populate('members', 'name email rollNumber department')
      .sort({ createdAt: -1 });

    return withCors(
      NextResponse.json(
        { success: true, count: registrations.length, data: registrations },
        { status: 200 }
      )
    );
  } catch (error) {
    return withCors(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}
