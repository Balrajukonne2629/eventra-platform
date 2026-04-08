import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}).select("-password"); // Exclude password from results
    return NextResponse.json({ success: true, count: users.length, data: users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Check if user already exists
    const userExists = await User.findOne({ email: body.email });
    if (userExists) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
    }

    const user = await User.create(body);
    // Remember to never return password in production API
    user.password = undefined;

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
