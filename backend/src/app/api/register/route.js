import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Registration from '@/models/Registration';
import User from '@/models/User';
import { preflightResponse, withCors } from '@/lib/cors';
import { requireAuth } from '@/lib/auth-middleware';

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function OPTIONS() {
  return preflightResponse();
}

export async function POST(req) {
  try {
    await connectDB();

    const authResult = await requireAuth(req);
    if (!authResult.ok) {
      return withCors(NextResponse.json({ success: false, message: authResult.error }, { status: authResult.status }));
    }

    const body = await req.json();
    const { eventId, userId, teamName, members } = body;

    if (!eventId || !userId || !teamName || !Array.isArray(members) || members.length === 0) {
      return withCors(
        NextResponse.json(
          { success: false, message: 'eventId, userId, teamName and members[] are required' },
          { status: 400 }
        )
      );
    }

    if (typeof teamName !== 'string') {
      return withCors(NextResponse.json({ success: false, message: 'teamName must be a string' }, { status: 400 }));
    }

    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return withCors(
        NextResponse.json({ success: false, message: 'Invalid eventId or userId' }, { status: 400 })
      );
    }

    if (authResult.userId !== userId) {
      return withCors(NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 }));
    }

    const hasInvalidMember = members.some((memberId) => !mongoose.Types.ObjectId.isValid(memberId));
    if (hasInvalidMember) {
      return withCors(
        NextResponse.json({ success: false, message: 'members[] contains invalid user IDs' }, { status: 400 })
      );
    }

    const includesUser = members.some((memberId) => String(memberId) === String(userId));
    if (!includesUser) {
      return withCors(NextResponse.json({ success: false, message: 'members[] must include userId' }, { status: 400 }));
    }

    const [eventExists, userExists] = await Promise.all([
      Event.exists({ _id: eventId }),
      User.exists({ _id: userId }),
    ]);

    if (!eventExists || !userExists) {
      return withCors(
        NextResponse.json({ success: false, message: 'eventId or userId does not exist' }, { status: 404 })
      );
    }

    const normalizedTeamName = teamName.trim();
    if (!normalizedTeamName) {
      return withCors(
        NextResponse.json({ success: false, message: 'teamName cannot be empty' }, { status: 400 })
      );
    }

    const duplicateTeam = await Registration.findOne({
      eventId,
      teamName: { $regex: `^${escapeRegex(normalizedTeamName)}$`, $options: 'i' },
    });
    if (duplicateTeam) {
      return withCors(
        NextResponse.json({ success: false, message: 'Team name already exists for this event' }, { status: 409 })
      );
    }

    const registration = await Registration.create({
      eventId,
      userId,
      teamName: normalizedTeamName,
      members,
    });

    return withCors(NextResponse.json({ success: true, data: registration }, { status: 201 }));
  } catch (error) {
    if (error?.code === 11000) {
      return withCors(
        NextResponse.json({ success: false, message: 'Team name already exists for this event' }, { status: 409 })
      );
    }

    return withCors(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}
