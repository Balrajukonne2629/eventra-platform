import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { preflightResponse, withCors } from '@/lib/cors';

export async function OPTIONS() {
  return preflightResponse();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return withCors(NextResponse.json({ error: 'Email and password are required' }, { status: 400 }));
    }

    await dbConnect();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return withCors(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }));
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return withCors(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }));
    }

    // Generate JWT token
    const token = await signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return withCors(NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    }, { status: 200 }));

  } catch (error) {
    console.error('Login Error:', error);
    return withCors(NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }));
  }
}
