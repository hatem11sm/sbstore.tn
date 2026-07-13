import connectDB from "@/db/Database";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { isAdminUser, requireAuthUser } from "@/utils/serverAuth";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  await connectDB();
  try {
    const { user, error } = await requireAuthUser();

    if (error) {
      return NextResponse.json(
        { status: error.status, message: error.message },
        { status: error.status }
      );
    }

    if (!isAdminUser(user)) {
      return NextResponse.json(
        { status: 403, message: "Accès réservé à l’administrateur" },
        { status: 403 }
      );
    }

    const users = await User.find({}).select("-password").populate(
      "vendorId",
      "name slug city"
    );
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
