import connectDB from "@/db/Database";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import User from "@/models/User";
import {
  enforceRateLimit,
  getClientIdentifier,
  isStrongEnoughPassword,
  isValidEmail,
  normalizeEmail,
  sanitizeText,
} from "@/utils/requestSecurity";

export const POST = async (req) => {
  const limiter = enforceRateLimit({
    key: getClientIdentifier(req, "signup"),
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!limiter.allowed) {
    return NextResponse.json(
      {
        status: 429,
        message: "Trop de créations de compte. Réessayez plus tard.",
      },
      { status: 429 }
    );
  }

  const { name, email, password } = await req.json();
  await connectDB();

  try {
    if (!name || !email || !password) {
      return NextResponse.json(
        {
        message: "Veuillez remplir tous les champs",
        status: 400,
        },
        { status: 400 }
      );
    } else if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          message: "Email invalide",
          status: 400,
        },
        { status: 400 }
      );
    } else if (!isStrongEnoughPassword(password)) {
      return NextResponse.json(
        {
          message: "Le mot de passe doit contenir au moins 8 caractères",
          status: 400,
        },
        { status: 400 }
      );
    } else {
      const normalizedEmail = normalizeEmail(email);
      const cleanName = sanitizeText(name);
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return NextResponse.json(
          {
          message: "Un compte existe déjà avec cet email",
          status: 400,
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
          name: cleanName,
          email: normalizedEmail,
          password: hashedPassword,
          role: "customer",
        });
        if (user) {
          return NextResponse.json(
            {
            status: 201,
            message: "Compte créé avec succès",
            },
            { status: 201 }
          );
        }
      }
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
      status: 500,
      message: "Erreur serveur",
      },
      { status: 500 }
    );
  }
};
