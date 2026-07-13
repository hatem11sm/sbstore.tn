import connectDB from "@/db/Database";
import { NextResponse } from "next/server";
import { validatePromoCode } from "@/utils/promoValidation";
import { enforceRateLimit, getClientIdentifier } from "@/utils/requestSecurity";

export const POST = async (req) => {
  await connectDB();

  const limiter = enforceRateLimit({
    key: getClientIdentifier(req, "promo-validate"),
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });

  if (!limiter.allowed) {
    return NextResponse.json(
      {
        status: 429,
        message: "Trop de validations promo. Réessayez plus tard.",
      },
      { status: 429 }
    );
  }

  try {
    const { code, subtotal } = await req.json();
    const result = await validatePromoCode({
      code,
      subtotal: Number(subtotal || 0),
    });

    if (!result.valid) {
      return NextResponse.json(
        {
          status: 400,
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: result.message,
      data: {
        promo: result.promo,
        discountAmount: result.discountAmount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message: "Impossible de valider le code promo",
      },
      { status: 500 }
    );
  }
};
