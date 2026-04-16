import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import nodemailer from "nodemailer";
import { preflightResponse, withCors } from "@/lib/cors";

export async function OPTIONS() {
  return preflightResponse();
}

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find({}).sort({ createdAt: -1 }); // Get all events, newest first
    return withCors(NextResponse.json({ success: true, count: events.length, data: events }, { status: 200 }));
  } catch (error) {
    return withCors(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}

export async function POST(request) {
  try {
    // 1. Connect to the database
    await connectDB();

    // 1.5 Extract logged-in user details
    const token = request.cookies.get('eventra_token')?.value;
    if (!token) {
      return withCors(NextResponse.json({ message: "Unauthorized. Please log in first." }, { status: 401 }));
    }
    const decoded = await verifyToken(token);
    if (!decoded) {
      return withCors(NextResponse.json({ message: "Session expired or invalid. Please log in again." }, { status: 401 }));
    }
    const organizer = await User.findById(decoded.id);
    if (!organizer) {
      return withCors(NextResponse.json({ message: "User not found" }, { status: 404 }));
    }

    // 2. Parse the request body early to use its metadata
    const body = await request.json();
    const { title, description, club, category, teamSize, maxTeams, deadline, facultyEmail } = body;

    const orgName = organizer.name || "Unknown";
    const orgEmail = organizer.email || "Unknown";
    const orgRoll = body.rollNumber || organizer.rollNumber || "N/A";
    const orgDept = body.department || organizer.department || "N/A";

    // 3. Validate required fields
    if (!title || !description || !club || !category || !teamSize || !maxTeams || !deadline || !facultyEmail) {
      return withCors(NextResponse.json(
        { message: "All fields are required, including faculty email" },
        { status: 400 }
      ));
    }

    // 4. Validate specific constraints
    if (category !== "Technical" && category !== "Non-Technical") {
      return withCors(NextResponse.json(
        { message: "Category must be either 'Technical' or 'Non-Technical'" },
        { status: 400 }
      ));
    }

    if (![1, 2, 4].includes(Number(teamSize))) {
      return withCors(NextResponse.json(
        { message: "Team size must be 1, 2, or 4" },
        { status: 400 }
      ));
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
