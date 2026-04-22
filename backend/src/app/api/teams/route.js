import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import { errorResponse, preflightResponse, successResponse } from "@/lib/cors";
import { requireAuth } from "@/lib/auth-middleware";

export async function OPTIONS() {
  return preflightResponse();
}

export async function GET(request) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.ok) {
      return errorResponse(authResult.error, authResult.status);
    }

    await connectDB();
    
    // Optionally filter by eventId if provided in query params
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (eventId && !mongoose.Types.ObjectId.isValid(eventId)) {
      return errorResponse('Invalid eventId', 400);
    }
    
    const query = eventId ? { eventId } : {};
    
    // Populate members to get user details automatically
    const teams = await Team.find(query)
      .populate('eventId', 'title') 
      .populate('members', 'name email');

    return successResponse('Teams fetched successfully', teams, 200, { count: teams.length });
  } catch (error) {
    return errorResponse('Internal Server Error', 500);
  }
}

export async function POST(request) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.ok) {
      return errorResponse(authResult.error, authResult.status);
    }

    await connectDB();
    const body = await request.json();
    
    if (!body.eventId || !body.members || body.members.length === 0) {
       return errorResponse('eventId and members are required', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(body.eventId)) {
      return errorResponse('Invalid eventId', 400);
    }

    if (!Array.isArray(body.members)) {
      return errorResponse('members must be an array', 400);
    }

    const hasInvalidMembers = body.members.some((memberId) => !mongoose.Types.ObjectId.isValid(memberId));
    if (hasInvalidMembers) {
      return errorResponse('members contains invalid user IDs', 400);
    }

    const team = await Team.create(body);
    return successResponse('Team created successfully', team, 201);
  } catch (error) {
    return errorResponse('Internal Server Error', 500);
  }
}
