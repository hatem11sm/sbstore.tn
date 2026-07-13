import connectDB from "@/db/Database";
import PromoCode from "@/models/PromoCode";
import { NextResponse } from "next/server";
import { isAdminUser, requireAuthUser } from "@/utils/serverAuth";

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

const guardAdmin = async () => {
  const { user, error } = await requireAuthUser();

  if (error) {
    return {
      denied: NextResponse.json(
        { status: error.status, message: error.message },
        { status: error.status }
      ),
    };
  }

  if (!isAdminUser(user)) {
    return {
      denied: NextResponse.json(
        { status: 403, message: "Accès réservé à l’administrateur" },
        { status: 403 }
      ),
    };
  }

  return { denied: null };
};

export const PUT = async (req, { params }) => {
  try {
    await connectDB();
    const { denied } = await guardAdmin();
    if (denied) return denied;

    const body = await req.json();
    const payload = toPromoPayload(body);

    const promo = await PromoCode.findByIdAndUpdate(params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!promo) {
      return NextResponse.json(
        { status: 404, message: "Code promo introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Code promo mis à jour",
      data: promo,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 500, message: "Erreur lors de la mise à jour du code promo" },
      { status: 500 }
    );
  }
};

export const DELETE = async (_req, { params }) => {
  try {
    await connectDB();
    const { denied } = await guardAdmin();
    if (denied) return denied;

    const promo = await PromoCode.findByIdAndDelete(params.id);

    if (!promo) {
      return NextResponse.json(
        { status: 404, message: "Code promo introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Code promo supprimé",
    });
  } catch (error) {
    return NextResponse.json(
      { status: 500, message: "Erreur lors de la suppression du code promo" },
      { status: 500 }
    );
  }
};
