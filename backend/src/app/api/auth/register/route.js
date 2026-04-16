import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { preflightResponse, withCors } from '@/lib/cors';

export async function OPTIONS() {
  return preflightResponse();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    // Validate incoming data
    if (!name || !email || !password) {
      return withCors(NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 }));
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return withCors(NextResponse.json({ error: 'User with this email already exists' }, { status: 409 }));
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student', // Fallback to 'student' if role is not provided (as defined in the Schema)
    });

    // Don't send password back in response
    return withCors(NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    }, { status: 201 }));

  } catch (error) {
    console.error('Registration Error:', error);
    return withCors(NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }));
  }
}
