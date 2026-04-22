import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import connectDB from "@/lib/db";
import User from "@/models/User";
import { preflightResponse, withCors } from '@/lib/cors';
import { requireAuth } from '@/lib/auth-middleware';

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export async function OPTIONS() {
  return preflightResponse();
}

export async function GET(req) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.ok) {
      return withCors(NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status }));
    }

    await connectDB();
    const users = await User.find({}).select("-password"); // Exclude password from results
    return withCors(NextResponse.json({ success: true, count: users.length, data: users }, { status: 200 }));
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
    const { name, email, password, role } = body;

    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string' || password.length < 6) {
      return withCors(NextResponse.json({ success: false, message: 'name, email and password (min 6 chars) are required' }, { status: 400 }));
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return withCors(NextResponse.json({ success: false, message: 'Please provide a valid email' }, { status: 400 }));
    }

    if (role && !['student', 'organizer'].includes(role)) {
      return withCors(NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 }));
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return withCors(NextResponse.json({ success: false, message: "User already exists" }, { status: 409 }));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'student',
    });
    // Remember to never return password in production API
    user.password = undefined;

    return withCors(NextResponse.json({ success: true, data: user }, { status: 201 }));
  } catch (error) {
    return withCors(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}
