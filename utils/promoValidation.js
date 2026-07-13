import PromoCode from "@/models/PromoCode";

const DEFAULT_PROMOS = [
  {
    code: "BIENVENUE10",
    label: "Bienvenue 10%",
    type: "percent",
    value: 10,
    minOrderAmount: 80,
    maxDiscount: 30,
    isActive: true,
  },
  {
    code: "SB5",
    label: "Remise 5 DT",
    type: "fixed",
    value: 5,
    minOrderAmount: 60,
    isActive: true,
  },
];

const normalizeCode = (value = "") => value.trim().toUpperCase();

export const ensureDefaultPromos = async () => {
  await Promise.all(
    DEFAULT_PROMOS.map((promo) =>
      PromoCode.updateOne(
        { code: promo.code },
        {
          $setOnInsert: {
            ...promo,
            code: normalizeCode(promo.code),
          },
        },
        { upsert: true }
      ).catch(() => null)
    )
  );
};

const isPromoCurrentlyValid = (promo, now = new Date()) => {
  if (!promo?.isActive) return false;
  if (promo?.startsAt && new Date(promo.startsAt) > now) return false;
  if (promo?.endsAt && new Date(promo.endsAt) < now) return false;
  if (
    typeof promo?.usageLimit === "number" &&
    promo.usageLimit >= 0 &&
    promo.usedCount >= promo.usageLimit
  ) {
    return false;
  }
  return true;
};

const computeDiscountAmount = (promo, subtotal) => {
  if (!promo) return 0;

  let discount = 0;

  if (promo.type === "percent") {
    discount = subtotal * (Number(promo.value || 0) / 100);
  } else {
    discount = Number(promo.value || 0);
  }

  if (promo.maxDiscount) {
    discount = Math.min(discount, Number(promo.maxDiscount));
  }

  return Math.max(0, Number(discount.toFixed(2)));
};

export const findPromoByCode = async (rawCode) => {
  const code = normalizeCode(rawCode);
  if (!code) return null;

  await ensureDefaultPromos();
  const databasePromo = await PromoCode.findOne({ code }).lean().catch(() => null);
  if (databasePromo) return databasePromo;

  return DEFAULT_PROMOS.find((promo) => promo.code === code) || null;
};

export const validatePromoCode = async ({ code, subtotal }) => {
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) {
    return {
      valid: false,
      message: "Veuillez saisir un code promo",
    };
  }

  const promo = await findPromoByCode(normalizedCode);

  if (!promo || !isPromoCurrentlyValid(promo)) {
    return {
      valid: false,
      message: "Code promo invalide ou expiré",
    };
  }

  const minimum = Number(promo.minOrderAmount || 0);
  if (Number(subtotal) < minimum) {
    return {
      valid: false,
      message: `Ce code est disponible à partir de ${minimum.toFixed(2)} Dt`,
    };
  }

  const discountAmount = computeDiscountAmount(promo, Number(subtotal));
  if (discountAmount <= 0) {
    return {
      valid: false,
      message: "Ce code promo ne peut pas être appliqué à cette commande",
    };
  }

  return {
    valid: true,
    promo: {
      code: normalizedCode,
      label: promo.label,
      type: promo.type,
      value: promo.value,
      minOrderAmount: minimum,
      maxDiscount: promo.maxDiscount || null,
    },
    discountAmount,
    message: `${promo.label} appliqué`,
  };
};

export const incrementPromoUsage = async (code) => {
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) return;

  await PromoCode.updateOne(
    { code: normalizedCode },
    { $inc: { usedCount: 1 } }
  ).catch(() => null);
};

export const getAllPromos = async () => {
  await ensureDefaultPromos();
  return PromoCode.find({}).sort({ createdAt: -1 });
};

export const createPromoSnapshot = (promo, discountAmount) => {
  if (!promo) return null;

  return {
    code: normalizeCode(promo.code),
    label: promo.label,
    type: promo.type,
    value: Number(promo.value || 0),
    discountAmount: Number(discountAmount || 0),
  };
};
