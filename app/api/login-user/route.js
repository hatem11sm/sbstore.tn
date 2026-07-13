import connectDB from "@/db/Database";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils/serverAuth";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  await connectDB();
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({
        status: 401,
        error: "Utilisateur introuvable",
      });
    } else {
      return NextResponse.json({
        status: 200,
        data: user,
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: 401,
      error: "Token invalide",
    });
  }
};
