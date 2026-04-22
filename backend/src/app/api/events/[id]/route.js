import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import User from '@/models/User';
import { preflightResponse, withCors } from '@/lib/cors';
import { requireAuth } from '@/lib/auth-middleware';

export async function OPTIONS() {
  return preflightResponse();
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const authResult = await requireAuth(req);
    if (!authResult.ok) {
      return withCors(NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status }));
    }

    const user = await User.findById(authResult.userId).select('role');
    if (!user || user.role !== 'organizer') {
      return withCors(NextResponse.json({ success: false, error: 'Only organizer can delete events' }, { status: 403 }));
    }

    const event = await Event.findById(params.id);
    if (!event) {
      return withCors(NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 }));
    }

    if (!event.organizerId || event.organizerId.toString() !== authResult.userId) {
      return withCors(NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }));
    }

    await Event.findByIdAndDelete(params.id);
    return withCors(NextResponse.json({ success: true, message: 'Event deleted successfully' }, { status: 200 }));
  } catch (error) {
    return withCors(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}
