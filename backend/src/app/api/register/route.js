import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Registration from '@/models/Registration';
import User from '@/models/User';
import { errorResponse, preflightResponse, successResponse } from '@/lib/cors';
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
      return errorResponse(authResult.error, authResult.status);
    }

    if (authResult.userRole !== 'student') {
      return errorResponse('Forbidden', 403);
    }

    const body = await req.json();
    const { eventId, userId, teamName, members } = body;

    if (!eventId || !userId || !teamName || !Array.isArray(members) || members.length === 0) {
      return errorResponse('eventId, userId, teamName and members[] are required', 400);
    }

    if (typeof teamName !== 'string') {
      return errorResponse('teamName must be a string', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return errorResponse('Invalid eventId or userId', 400);
    }

    if (authResult.userId !== userId) {
      return errorResponse('Forbidden', 403);
    }

    const hasInvalidMember = members.some((memberId) => !mongoose.Types.ObjectId.isValid(memberId));
    if (hasInvalidMember) {
      return errorResponse('members[] contains invalid user IDs', 400);
    }

    const includesUser = members.some((memberId) => String(memberId) === String(userId));
    if (!includesUser) {
      return errorResponse('members[] must include userId', 400);
    }

    const [event, userExists] = await Promise.all([
      Event.findById(eventId).select('maxTeams'),
      User.exists({ _id: userId }),
    ]);

    if (!event || !userExists) {
      return errorResponse('eventId or userId does not exist', 404);
    }

    const normalizedTeamName = teamName.trim();
    if (!normalizedTeamName) {
      return errorResponse('teamName cannot be empty', 400);
    }

    const existingRegistration = await Registration.findOne({ eventId, userId });
    if (existingRegistration) {
      return errorResponse('Already registered', 409);
    }

    const registrationCount = await Registration.countDocuments({ eventId });
    if (registrationCount >= Number(event.maxTeams)) {
      return errorResponse('Event full', 400);
    }

    const duplicateTeam = await Registration.findOne({
      eventId,
      teamName: { $regex: `^${escapeRegex(normalizedTeamName)}$`, $options: 'i' },
    });
    if (duplicateTeam) {
      return errorResponse('Team name already exists for this event', 409);
    }

    const registration = await Registration.create({
      eventId,
      userId,
      teamName: normalizedTeamName,
      members,
    });

    return successResponse('Registration created successfully', registration, 201);
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateKeys = Object.keys(error?.keyPattern || {});
      if (duplicateKeys.includes('eventId') && duplicateKeys.includes('userId')) {
        return errorResponse('Already registered', 409);
      }

      return errorResponse('Team name already exists for this event', 409);
    }

    return errorResponse('Internal Server Error', 500);
  }
}
