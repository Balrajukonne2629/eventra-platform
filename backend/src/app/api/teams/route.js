import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import { preflightResponse, withCors } from "@/lib/cors";
import { requireAuth } from "@/lib/auth-middleware";

export async function OPTIONS() {
  return preflightResponse();
}

export async function GET(request) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.ok) {
      return withCors(NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status }));
    }

    await connectDB();
    
    // Optionally filter by eventId if provided in query params
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (eventId && !mongoose.Types.ObjectId.isValid(eventId)) {
      return withCors(NextResponse.json({ success: false, message: 'Invalid eventId' }, { status: 400 }));
    }
    
    const query = eventId ? { eventId } : {};
    
    // Populate members to get user details automatically
    const teams = await Team.find(query)
      .populate('eventId', 'title') 
      .populate('members', 'name email');

    return withCors(NextResponse.json({ success: true, count: teams.length, data: teams }, { status: 200 }));
  } catch (error) {
    return withCors(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}

export async function POST(request) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.ok) {
      return withCors(NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status }));
    }

    await connectDB();
    const body = await request.json();
    
    if (!body.eventId || !body.members || body.members.length === 0) {
       return withCors(NextResponse.json({ success: false, message: "eventId and members are required" }, { status: 400 }));
    }

    if (!mongoose.Types.ObjectId.isValid(body.eventId)) {
      return withCors(NextResponse.json({ success: false, message: 'Invalid eventId' }, { status: 400 }));
    }

    if (!Array.isArray(body.members)) {
      return withCors(NextResponse.json({ success: false, message: 'members must be an array' }, { status: 400 }));
    }

    const hasInvalidMembers = body.members.some((memberId) => !mongoose.Types.ObjectId.isValid(memberId));
    if (hasInvalidMembers) {
      return withCors(NextResponse.json({ success: false, message: 'members contains invalid user IDs' }, { status: 400 }));
    }

    const team = await Team.create(body);
    return withCors(NextResponse.json({ success: true, data: team }, { status: 201 }));
  } catch (error) {
    return withCors(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}
