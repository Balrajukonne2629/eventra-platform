import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/Team";

export async function GET(request) {
  try {
    await connectDB();
    
    // Optionally filter by eventId if provided in query params
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    const query = eventId ? { eventId } : {};
    
    // Populate members to get user details automatically
    const teams = await Team.find(query)
      .populate('eventId', 'title') 
      .populate('members', 'name email');

    return NextResponse.json({ success: true, count: teams.length, data: teams }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    if (!body.eventId || !body.members || body.members.length === 0) {
       return NextResponse.json({ success: false, message: "eventId and members are required" }, { status: 400 });
    }

    const team = await Team.create(body);
    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
