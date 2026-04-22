import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import connectDB from "@/lib/db";
import User from "@/models/User";
import { errorResponse, preflightResponse, successResponse } from '@/lib/cors';
import { requireAuth } from '@/lib/auth-middleware';

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export async function OPTIONS() {
  return preflightResponse();
}

export async function GET(req) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.ok) {
      return errorResponse(authResult.error, authResult.status);
    }

    await connectDB();
    const users = await User.find({}).select("-password"); // Exclude password from results
    return successResponse('Users fetched successfully', users, 200, { count: users.length });
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
    const { name, email, password, role } = body;

    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string' || password.length < 6) {
      return errorResponse('name, email and password (min 6 chars) are required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return errorResponse('Please provide a valid email', 400);
    }

    if (role && !['student', 'organizer'].includes(role)) {
      return errorResponse('Invalid role', 400);
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return errorResponse('User already exists', 409);
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

    return successResponse('User created successfully', user, 201);
  } catch (error) {
    return errorResponse('Internal Server Error', 500);
  }
}
