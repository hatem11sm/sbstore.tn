import connectDB from "@/db/Database";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  await connectDB();
  try {
    const users = await User.find({}).select("-password");
    return NextResponse.json({
      status: 200,
      message: "success",
      data: users,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: error.message,
    });
  }
};
