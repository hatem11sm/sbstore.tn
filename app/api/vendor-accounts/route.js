import connectDB from "@/db/Database";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { isAdminUser, requireAuthUser } from "@/utils/serverAuth";

export const POST = async (req) => {
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

    const { vendorId, name, email, password } = await req.json();

    if (!vendorId || !name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        {
          status: 400,
          message: "Nom, email, mot de passe et boutique sont obligatoires",
        },
        { status: 400 }
      );
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json(
        { status: 404, message: "Boutique introuvable" },
        { status: 404 }
      );
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { status: 400, message: "Un compte existe déjà avec cet email" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const vendorUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "vendor",
      isAdmin: false,
      vendorId: vendor._id,
    });

    return NextResponse.json({
      status: 201,
      message: "Compte vendeur créé avec succès",
      data: {
        _id: vendorUser._id,
        name: vendorUser.name,
        email: vendorUser.email,
        role: vendorUser.role,
        vendorId: vendor._id,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message: "Erreur lors de la création du compte vendeur",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
