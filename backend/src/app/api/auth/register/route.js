import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { preflightResponse, withCors } from '@/lib/cors';

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export async function OPTIONS() {
  return preflightResponse();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    // Validate incoming data
    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string' || password.length < 6) {
      return withCors(NextResponse.json({ error: 'name, email and password (min 6 chars) are required' }, { status: 400 }));
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return withCors(NextResponse.json({ error: 'Please provide a valid email' }, { status: 400 }));
    }

    if (role && !['student', 'organizer'].includes(role)) {
      return withCors(NextResponse.json({ error: 'Invalid role' }, { status: 400 }));
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return withCors(NextResponse.json({ error: 'User with this email already exists' }, { status: 409 }));
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
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
