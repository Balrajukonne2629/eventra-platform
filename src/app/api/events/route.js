import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";

export async function POST(request) {
  try {
    // 1. Connect to the database
    await connectDB();

    // 2. Parse the request body
    const body = await request.json();
    const { title, description, club, category, teamSize, maxTeams, deadline } = body;

    // 3. Validate required fields
    if (!title || !description || !club || !category || !teamSize || !maxTeams || !deadline) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // 4. Validate specific constraints
    if (category !== "Technical" && category !== "Non-Technical") {
      return NextResponse.json(
        { message: "Category must be either 'Technical' or 'Non-Technical'" },
        { status: 400 }
      );
    }

    if (![1, 2, 4].includes(Number(teamSize))) {
      return NextResponse.json(
        { message: "Team size must be 1, 2, or 4" },
        { status: 400 }
      );
    }

    // 5. Create and save the event in MongoDB
    const newEvent = await Event.create({
      title,
      description,
      club,
      category,
      teamSize: Number(teamSize),
      maxTeams: Number(maxTeams),
      deadline: new Date(deadline),
    });

    // 6. Return success response
    return NextResponse.json(
      { 
        message: "Event created successfully!", 
        event: newEvent 
      },
      { status: 201 } // 201 means "Created"
    );

  } catch (error) {
    // 7. Handle any errors gracefully
    console.error("Error creating event:", error);
    
    return NextResponse.json(
      { message: "Failed to create event", error: error.message },
      { status: 500 } // 500 means "Internal Server Error"
    );
  }
}
