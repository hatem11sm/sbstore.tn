import connectDB from "@/db/Database";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const POST = async (req) => {
  await connectDB();
  const { email, password } = await req.json();
  try {
    if (!email || !password) {
      return NextResponse.json({
        message: "Please fill all the fields",
        status: 400,
      });
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({
          status: 400,
          message: "User not found",
        });
      } else {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return NextResponse.json({
            status: 400,
            message: "Invalid password",
          });
        } else {
          const authToken = jwt.sign({ 
            id: user._id,
            isAdmin: user.isAdmin 
          }, process.env.JWT_SECRET);
          
          cookies().set("authToken", authToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
          });

          return NextResponse.json({
            status: 201,
            message: "User login successfully",
            data: {
              id: user._id,
              name: user.name,
              email: user.email,
              isAdmin: user.isAdmin
            }
          });
        }
      }
    }
  } catch (error) {
    return NextResponse.json({
      status: 400,
      message: "Something went wrong",
    });
  }
};
