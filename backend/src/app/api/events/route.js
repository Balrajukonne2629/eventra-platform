import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import User from "@/models/User";
import nodemailer from "nodemailer";
import { preflightResponse, withCors } from "@/lib/cors";
import { requireAuth } from "@/lib/auth-middleware";

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function OPTIONS() {
  return preflightResponse();
}

export async function GET(req) {
  try {
    await connectDB();

    const authResult = await requireAuth(req);
    if (!authResult.ok) {
      return withCors(NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status }));
    }

    const { searchParams } = new URL(req.url);
    const organizerId = searchParams.get('organizerId');

    let query = {};
    if (organizerId) {
      if (!mongoose.Types.ObjectId.isValid(organizerId)) {
        return withCors(NextResponse.json({ success: false, error: 'Invalid organizerId' }, { status: 400 }));
      }

      if (authResult.userId !== organizerId) {
        return withCors(NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }));
      }

      query = { organizerId };
    }

    const events = await Event.find(query).sort({ createdAt: -1 }); // Get events, newest first
    return withCors(NextResponse.json({ success: true, count: events.length, data: events }, { status: 200 }));
  } catch (error) {
    return withCors(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}

export async function POST(req) {
  try {
    // 1. Connect to the database
    await connectDB();

    // 1.5 Extract logged-in user details
    const authResult = await requireAuth(req);
    if (!authResult.ok) {
      return withCors(NextResponse.json({ message: authResult.error }, { status: authResult.status }));
    }
    const organizer = await User.findById(authResult.userId);
    if (!organizer) {
      return withCors(NextResponse.json({ message: "User not found" }, { status: 404 }));
    }

    // 2. Parse the request body early to use its metadata
    const body = await req.json();
    const { title, description, club, category, teamSize, maxTeams, deadline, facultyEmail } = body;

    const orgName = organizer.name?.trim() || "Not Provided";
    const orgEmail = organizer.email?.trim() || "Not Provided";
    const orgRoll = organizer.rollNumber?.trim() || "Not Provided";
    const orgDept = organizer.department?.trim() || "Not Provided";

    // 3. Validate required fields
    if (!isNonEmptyString(title) || !isNonEmptyString(description) || !isNonEmptyString(club) || !isNonEmptyString(category) || teamSize === undefined || maxTeams === undefined || !deadline || !isNonEmptyString(facultyEmail)) {
      return withCors(NextResponse.json(
        { message: "All fields are required, including faculty email" },
        { status: 400 }
      ));
    }

    if (!EMAIL_REGEX.test(facultyEmail)) {
      return withCors(NextResponse.json({ message: 'Please provide a valid faculty email' }, { status: 400 }));
    }

    // 4. Validate specific constraints
    if (category !== "Technical" && category !== "Non-Technical") {
      return withCors(NextResponse.json(
        { message: "Category must be either 'Technical' or 'Non-Technical'" },
        { status: 400 }
      ));
    }

    if (!Number.isFinite(Number(teamSize)) || !Number.isFinite(Number(maxTeams))) {
      return withCors(NextResponse.json({ message: 'teamSize and maxTeams must be valid numbers' }, { status: 400 }));
    }

    if (![1, 2, 4].includes(Number(teamSize))) {
      return withCors(NextResponse.json(
        { message: "Team size must be 1, 2, or 4" },
        { status: 400 }
      ));
    }

    if (Number(maxTeams) <= 0) {
      return withCors(NextResponse.json({ message: 'maxTeams must be greater than 0' }, { status: 400 }));
    }

    if (Number.isNaN(new Date(deadline).getTime())) {
      return withCors(NextResponse.json({ message: 'deadline must be a valid date' }, { status: 400 }));
    }

    // 5. Create and save the event in MongoDB
    const newEvent = await Event.create({
      organizerId: organizer._id,
      title,
      description,
      club,
      category,
      teamSize: Number(teamSize),
      maxTeams: Number(maxTeams),
      deadline: new Date(deadline),
      facultyEmail,
    });

    // 6. Send email notification to faculty
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: facultyEmail,
        replyTo: orgEmail,
        subject: `Event Proposal: ${title} | ${club}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <p>Respected Sir/Madam,</p>
            <p>We are writing to notify you that a student is planning to conduct a new event. Please review the details below.</p>
            
            <h4 style="margin-bottom: 5px; color: #0056b3;">Organizer Details:</h4>
            <ul style="list-style-type: none; padding-left: 0; margin-top: 5px; background: #f9f9f9; padding: 10px; border-radius: 5px;">
              <li><strong>Name:</strong> ${orgName}</li>
              <li><strong>Roll Number:</strong> ${orgRoll}</li>
              <li><strong>Department:</strong> ${orgDept}</li>
              <li><strong>Email:</strong> ${orgEmail}</li>
            </ul>
            
            <h4 style="margin-bottom: 5px; color: #0056b3;">Event Details:</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px; border: 1px solid #eee;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; background: #fdfdfd;"><strong>Title:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${title}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; background: #fdfdfd;"><strong>Description:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${description}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; background: #fdfdfd;"><strong>Club:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${club}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; background: #fdfdfd;"><strong>Category:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${category}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; background: #fdfdfd;"><strong>Team Size:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${teamSize}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; background: #fdfdfd;"><strong>Max Teams:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${maxTeams}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; background: #fdfdfd;"><strong>Deadline:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(deadline).toLocaleString()}</td></tr>
            </table>

            <p style="margin-top: 20px;">We politely request your approval or feedback on this event proposal. You can reply directly to this email to coordinate with the student organizer.</p>
            
            <p style="margin-bottom: 5px;">Best Regards,</p>
            <p style="margin-top: 0;"><strong>${orgName}</strong><br/>${orgRoll}</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Notification email sent to ${facultyEmail}`);
    } catch (emailError) {
      console.error("Error sending email to faculty:", emailError);
      // We log the error but still return success for event creation
    }

    // 7. Return success response
    return withCors(NextResponse.json(
      { 
        success: true,
        message: "Event created and email notification sent", 
        event: newEvent 
      },
      { status: 201 } // 201 means "Created"
    ));

  } catch (error) {
    // 7. Handle any errors gracefully
    console.error("Error creating event:", error);
    
    return withCors(NextResponse.json(
      { message: "Failed to create event", error: error.message },
      { status: 500 } // 500 means "Internal Server Error"
    ));
  }
}
