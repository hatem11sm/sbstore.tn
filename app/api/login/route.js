import connectDB from "@/db/Database";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import {
  enforceRateLimit,
  getClientIdentifier,
  isStrongEnoughPassword,
  normalizeEmail,
} from "@/utils/requestSecurity";

export const POST = async (req) => {
  await connectDB();
  const limiter = enforceRateLimit({
    key: getClientIdentifier(req, "login"),
    limit: 6,
    windowMs: 10 * 60 * 1000,
  });

  if (!limiter.allowed) {
    return NextResponse.json(
      {
        status: 429,
        message: "Trop de tentatives de connexion. Réessayez plus tard.",
      },
      { status: 429 }
    );
  }

  const { email, password } = await req.json();
  try {
    if (!email || !password) {
      return NextResponse.json({
        message: "Veuillez remplir tous les champs",
        status: 400,
      });
    } else if (!isStrongEnoughPassword(password)) {
      return NextResponse.json(
        {
          status: 400,
          message: "Mot de passe invalide",
        },
        { status: 400 }
      );
    } else {
      const normalizedEmail = normalizeEmail(email);
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return NextResponse.json(
          {
          status: 400,
            message: "Email ou mot de passe incorrect",
          },
          { status: 400 }
        );
      } else {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return NextResponse.json(
            {
            status: 400,
              message: "Email ou mot de passe incorrect",
            },
            { status: 400 }
          );
        } else {
          const authToken = jwt.sign({ 
            id: user._id,
            isAdmin: user.isAdmin,
            role: user.role,
            vendorId: user.vendorId || null,
          }, process.env.JWT_SECRET, {
            expiresIn: "7d",
            issuer: "sbstore",
          });
          
          cookies().set("authToken", authToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
          });

          return NextResponse.json({
            status: 201,
            message: "Connexion réussie",
            data: {
              id: user._id,
              name: user.name,
              email: user.email,
              isAdmin: user.isAdmin,
              role: user.role,
              vendorId: user.vendorId || null,
            }
          });
        }
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
      status: 400,
      message: "Une erreur est survenue",
      },
      { status: 400 }
    );
  }
};
