import connectDB from "@/db/Database";
import Order from "@/models/Order";
import ClothingProduct from "@/models/Product";
import User from "@/models/User";
import { NextResponse } from "next/server";
import {
  createPromoSnapshot,
  incrementPromoUsage,
  validatePromoCode,
} from "@/utils/promoValidation";
import {
  sendAdminOrderNotification,
  sendOrderConfirmationEmail,
  sendVendorOrderNotifications,
} from "@/utils/orderEmail";
import { requireAuthUser } from "@/utils/serverAuth";
import {
  enforceRateLimit,
  getClientIdentifier,
  isValidEmail,
  isValidMongoId,
  sanitizeText,
} from "@/utils/requestSecurity";

const SHIPPING_FEE = 7;

const buildOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const stamp = `${now.getMonth() + 1}${now.getDate()}${now
    .getHours()
    .toString()
    .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`;

  return `SB-${year}-${stamp}-${Math.floor(100 + Math.random() * 900)}`;
};

export const POST = async (req) => {
  await connectDB();
  const limiter = enforceRateLimit({
    key: getClientIdentifier(req, "order-create"),
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!limiter.allowed) {
    return NextResponse.json(
      {
        status: 429,
        error: "Trop de tentatives de commande. Réessayez plus tard.",
      },
      { status: 429 }
    );
  }

  try {
    const { user, error: authError } = await requireAuthUser();

    if (authError) {
      return NextResponse.json(
        {
          status: authError.status,
          error: authError.message,
        },
        { status: authError.status }
      );
    }

    const body = await req.json();
    const {
      userId,
      items,
      customer,
      shippingAddress,
      status,
      paymentMethod,
      promoCode,
    } = body;

    if (!userId || !items || !customer || !shippingAddress) {
      return NextResponse.json(
        {
        status: 400,
        error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    if (String(user._id) !== String(userId)) {
      return NextResponse.json(
        {
          status: 403,
          error: "Utilisateur non autorisé pour cette commande",
        },
        { status: 403 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          status: 400,
          error: "Le panier est vide",
        },
        { status: 400 }
      );
    }

    const fullName = sanitizeText(customer.fullName);
    const phoneNumber = sanitizeText(customer.phoneNumber);
    const safeShippingAddress = sanitizeText(shippingAddress);
    const customerEmail = sanitizeText(customer.email || user.email || "");
    const customerDescription = sanitizeText(customer.description || "");

    if (!fullName || !phoneNumber || !safeShippingAddress) {
      return NextResponse.json(
        {
          status: 400,
          error: "Informations client incomplètes",
        },
        { status: 400 }
      );
    }

    if (customerEmail && !isValidEmail(customerEmail)) {
      return NextResponse.json(
        {
          status: 400,
          error: "Adresse email client invalide",
        },
        { status: 400 }
      );
    }

    const requestedProductIds = items.map((item) => item.productId);
    if (
      requestedProductIds.some((productId) => !isValidMongoId(productId))
    ) {
      return NextResponse.json(
        {
          status: 400,
          error: "Produit invalide dans la commande",
        },
        { status: 400 }
      );
    }

    const products = await ClothingProduct.find({
      _id: { $in: requestedProductIds },
    })
      .select(
        "name price mainImage vendorId vendorName vendorSlug size"
      )
      .lean();

    const productMap = new Map(
      products.map((product) => [String(product._id), product])
    );

    if (productMap.size !== requestedProductIds.length) {
      return NextResponse.json(
        {
          status: 400,
          error: "Un ou plusieurs produits sont introuvables",
        },
        { status: 400 }
      );
    }

    const normalizedItems = items.map((item) => {
      const product = productMap.get(String(item.productId));
      const quantity = Number(item.quantity || 0);
      const requestedSize = sanitizeText(item.size);
      const allowedSizes = Array.isArray(product.size) ? product.size : [];

      if (!product || quantity <= 0 || quantity > 20) {
        throw new Error("Quantité invalide dans la commande");
      }

      if (requestedSize && allowedSizes.length && !allowedSizes.includes(requestedSize)) {
        throw new Error(`Taille invalide pour ${product.name}`);
      }

      return {
        productId: product._id,
        quantity,
        size: requestedSize || allowedSizes[0] || "Medium",
        image: product.mainImage,
        price: Number(product.price || 0),
        name: product.name,
        vendorId: product.vendorId || null,
        vendorName: product.vendorName || "SB Store",
        vendorSlug: product.vendorSlug || "sb-store",
      };
    });

    const subtotal = Number(
      normalizedItems
        .reduce((accumulator, item) => {
          return accumulator + Number(item.quantity || 0) * Number(item.price || 0);
        }, 0)
        .toFixed(2)
    );

    let discount = 0;
    let promoSnapshot = null;

    if (promoCode?.trim()) {
      const promoValidation = await validatePromoCode({
        code: promoCode,
        subtotal,
      });

      if (!promoValidation.valid) {
        return NextResponse.json(
          {
            status: 400,
            error: promoValidation.message,
          },
          { status: 400 }
        );
      }

      discount = promoValidation.discountAmount;
      promoSnapshot = createPromoSnapshot(
        promoValidation.promo,
        promoValidation.discountAmount
      );
    }

    const shippingFee = SHIPPING_FEE;
    const total = Number(Math.max(0, subtotal + shippingFee - discount).toFixed(2));
    const safePaymentMethod =
      paymentMethod === "online" ? "online" : "cash_on_delivery";
    const paymentStatus =
      safePaymentMethod === "online" ? "awaiting_payment" : "pending";

    // Transform the data to match the Order schema
    const orderData = {
      orderNumber: buildOrderNumber(),
      userId,
      items: normalizedItems,
      vendorBreakdown: Object.values(
        normalizedItems.reduce((accumulator, item) => {
          const key = item.vendorSlug || "sb-store";
          if (!accumulator[key]) {
            accumulator[key] = {
              vendorId: item.vendorId || null,
              vendorName: item.vendorName || "SB Store",
              vendorSlug: key,
              subtotal: 0,
              itemCount: 0,
              items: [],
            };
          }

          const quantity = Number(item.quantity || 0);
          const price = Number(item.price || 0);
          accumulator[key].subtotal += quantity * price;
          accumulator[key].itemCount += quantity;
          accumulator[key].items.push({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            image: item.image,
            price: item.price,
            name: item.name,
          });

          return accumulator;
        }, {})
      ),
      subtotal,
      shippingFee,
      discount,
      promo: promoSnapshot,
      total,
      customer: {
        fullName,
        email: customerEmail,
        phoneNumber,
        address: safeShippingAddress,
        description: customerDescription,
      },
      shippingAddress: safeShippingAddress,
      paymentMethod: safePaymentMethod,
      paymentStatus,
      status: status || "pending",
    };

    const order = new Order(orderData);
    await order.save();

    if (promoSnapshot?.code) {
      await incrementPromoUsage(promoSnapshot.code);
    }

    try {
      await sendOrderConfirmationEmail({
        ...order.toObject(),
        paymentMethodLabel:
          safePaymentMethod === "online"
            ? "Paiement en ligne"
            : "Paiement à la livraison",
        paymentStatusLabel:
          paymentStatus === "awaiting_payment"
            ? "En attente du paiement"
            : "Paiement à la livraison",
      });
    } catch (emailError) {
      console.error("Order email error:", emailError);
    }

    try {
      const [adminUsers, vendorUsers] = await Promise.all([
        User.find({
          $or: [{ isAdmin: true }, { role: "admin" }],
          email: { $exists: true, $ne: "" },
        })
          .select("email")
          .lean(),
        User.find({
          role: "vendor",
          vendorId: {
            $in: (order.vendorBreakdown || [])
              .map((entry) => entry.vendorId)
              .filter(Boolean),
          },
          email: { $exists: true, $ne: "" },
        })
          .select("email vendorId")
          .lean(),
      ]);

      const orderPayload = {
        ...order.toObject(),
        paymentMethodLabel:
          safePaymentMethod === "online"
            ? "Paiement en ligne"
            : "Paiement à la livraison",
      };

      await sendAdminOrderNotification(
        orderPayload,
        [
          ...new Set([
            ...adminUsers.map((user) => user.email),
            ...(process.env.ORDER_NOTIFICATION_EMAIL
              ? [process.env.ORDER_NOTIFICATION_EMAIL]
              : []),
          ]),
        ].filter(Boolean)
      );

      const vendorRecipients = (order.vendorBreakdown || [])
        .map((entry) => {
          const account = vendorUsers.find(
            (user) => String(user.vendorId) === String(entry.vendorId)
          );

          if (!account?.email) return null;

          return {
            email: account.email,
            vendorName: entry.vendorName,
          };
        })
        .filter(Boolean);

      await sendVendorOrderNotifications(orderPayload, vendorRecipients);
    } catch (notificationError) {
      console.error("Order stakeholder email error:", notificationError);
    }

    return NextResponse.json({
      status: 200,
      data: order,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    const statusCode =
      error.message?.includes("invalide") || error.message?.includes("invalid")
        ? 400
        : 500;
    return NextResponse.json(
      {
        status: statusCode,
        error: error.message || "Failed to create order",
      },
      { status: statusCode }
    );
  }
}; 
