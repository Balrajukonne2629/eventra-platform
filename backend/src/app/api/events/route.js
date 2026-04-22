import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import nodemailer from "nodemailer";
import { errorResponse, preflightResponse, successResponse } from "@/lib/cors";
import { requireAuth } from "@/lib/auth-middleware";

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function OPTIONS() {
  return preflightResponse();
}

export async function GET(req) {
  try {
    await connectDB();

    const authResult = await requireAuth(req);
    if (!authResult.ok) {
      return errorResponse(authResult.error, authResult.status);
    }

    const { searchParams } = new URL(req.url);
    const organizerId = searchParams.get('organizerId');
    const search = searchParams.get('search');
    const club = searchParams.get('club');
    const category = searchParams.get('category');

    let query = {};
    if (organizerId) {
      if (!mongoose.Types.ObjectId.isValid(organizerId)) {
        return errorResponse('Invalid organizerId', 400);
      }

      if (authResult.userId !== organizerId) {
        return errorResponse('Forbidden', 403);
      }

      query = { organizerId };
    }

    if (typeof search === 'string' && search.trim()) {
      query.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    if (typeof club === 'string' && club.trim()) {
      query.club = club.trim();
    }

    if (typeof category === 'string' && category.trim()) {
      query.category = category.trim();
    }

    const events = await Event.find(query).sort({ createdAt: -1 }); // Get events, newest first
    return successResponse('Events fetched successfully', events, 200, { count: events.length });
  } catch (error) {
    return errorResponse('Internal Server Error', 500);
  }
}

export async function POST(req) {
  try {
    // 1. Extract logged-in user details
    const authResult = await requireAuth(req);
    if (!authResult.ok) {
      return errorResponse(authResult.error, authResult.status);
    }

    if (authResult.userRole !== 'organizer') {
      return errorResponse('Forbidden', 403);
    }

    // 1.5 Connect to the database
    await connectDB();

    const organizer = authResult.user;

    // 2. Parse the request body early to use its metadata
    const body = await req.json();
    const { title, description, club, category, teamSize, maxTeams, deadline, facultyEmail, externalFormLink } = body;

    const orgName = organizer.name?.trim() || "Not Provided";
    const orgEmail = organizer.email?.trim() || "Not Provided";
    const orgRoll = organizer.rollNumber?.trim() || "Not Provided";
    const orgDept = organizer.department?.trim() || "Not Provided";

    // 3. Validate required fields
    if (!isNonEmptyString(title) || !isNonEmptyString(description) || !isNonEmptyString(club) || !isNonEmptyString(category) || teamSize === undefined || maxTeams === undefined || !deadline || !isNonEmptyString(facultyEmail)) {
      return errorResponse('All fields are required, including faculty email', 400);
    }

    if (!EMAIL_REGEX.test(facultyEmail)) {
      return errorResponse('Please provide a valid faculty email', 400);
    }

    const normalizedExternalFormLink = typeof externalFormLink === 'string' ? externalFormLink.trim() : '';
    if (normalizedExternalFormLink && !isValidHttpUrl(normalizedExternalFormLink)) {
      return errorResponse('Please provide a valid external form URL', 400);
    }

    // 4. Validate specific constraints
    if (category !== "Technical" && category !== "Non-Technical") {
      return errorResponse("Category must be either 'Technical' or 'Non-Technical'", 400);
    }

    if (!Number.isFinite(Number(teamSize)) || !Number.isFinite(Number(maxTeams))) {
      return errorResponse('teamSize and maxTeams must be valid numbers', 400);
    }

    if (![1, 2, 4].includes(Number(teamSize))) {
      return errorResponse('Team size must be 1, 2, or 4', 400);
    }

    if (Number(maxTeams) <= 0) {
      return errorResponse('maxTeams must be greater than 0', 400);
    }

    if (Number.isNaN(new Date(deadline).getTime())) {
      return errorResponse('deadline must be a valid date', 400);
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
      externalFormLink: normalizedExternalFormLink || undefined,
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
    return successResponse('Event created and email notification sent', newEvent, 201);

  } catch (error) {
    // 7. Handle any errors gracefully
    console.error("Error creating event:", error);
    
    return errorResponse('Failed to create event', 500);
  }
}
