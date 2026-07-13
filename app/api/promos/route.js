import connectDB from "@/db/Database";
import PromoCode from "@/models/PromoCode";
import { NextResponse } from "next/server";
import { isAdminUser, requireAuthUser } from "@/utils/serverAuth";
import { getAllPromos } from "@/utils/promoValidation";

const toPromoPayload = (body) => ({
  code: body.code?.trim().toUpperCase(),
  label: body.label?.trim(),
  type: body.type,
  value: Number(body.value || 0),
  minOrderAmount: Number(body.minOrderAmount || 0),
  maxDiscount:
    body.maxDiscount === "" || body.maxDiscount == null
      ? null
      : Number(body.maxDiscount),
  usageLimit:
    body.usageLimit === "" || body.usageLimit == null
      ? null
      : Number(body.usageLimit),
  startsAt: body.startsAt ? new Date(body.startsAt) : null,
  endsAt: body.endsAt ? new Date(body.endsAt) : null,
  isActive: Boolean(body.isActive),
});

export const GET = async () => {
  try {
    await connectDB();
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

    const promos = await getAllPromos();

    return NextResponse.json({
      status: 200,
      data: promos,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 500, message: "Erreur lors du chargement des codes promo" },
      { status: 500 }
    );
  }
};

export const POST = async (req) => {
  try {
    await connectDB();
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

    const body = await req.json();
    const payload = toPromoPayload(body);

    if (!payload.code || !payload.label || !payload.type || payload.value <= 0) {
      return NextResponse.json(
        { status: 400, message: "Code, libellé, type et valeur sont requis" },
        { status: 400 }
      );
    }

    const promo = await PromoCode.create(payload);

    return NextResponse.json({
      status: 201,
      message: "Code promo créé avec succès",
      data: promo,
    });
  } catch (error) {
    const isDuplicate = error?.code === 11000;
    return NextResponse.json(
      {
        status: isDuplicate ? 400 : 500,
        message: isDuplicate
          ? "Un code promo existe déjà avec cette valeur"
          : "Erreur lors de la création du code promo",
      },
      { status: isDuplicate ? 400 : 500 }
    );
  }
};
