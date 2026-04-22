import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { errorResponse, preflightResponse, successResponse } from '@/lib/cors';

export async function OPTIONS() {
  return preflightResponse();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    await dbConnect();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = await signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return successResponse(
      'Login successful',
      {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
      200
    );

  } catch (error) {
    console.error('Login Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
