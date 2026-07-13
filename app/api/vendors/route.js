import connectDB from "@/db/Database";
import Vendor from "@/models/Vendor";
import { NextResponse } from "next/server";
import { isAdminUser, requireAuthUser } from "@/utils/serverAuth";
import { getVendorAccent, getVendorTemplate } from "@/utils/vendorStorefront";

const sanitizeVendorPayload = (body = {}) => ({
  name: body.name?.trim() || "",
  contactName: body.contactName?.trim() || "",
  phone: body.phone?.trim() || "",
  city: body.city?.trim() || "",
  description: body.description?.trim() || "",
  shortDescription: body.shortDescription?.trim() || "",
  tagline: body.tagline?.trim() || "",
  logo: body.logo?.trim() || "",
  banner: body.banner?.trim() || "",
  whatsapp: body.whatsapp?.trim() || "",
  instagram: body.instagram?.trim() || "",
  facebook: body.facebook?.trim() || "",
  template: getVendorTemplate(body.template).id,
  accentColor: getVendorAccent(body.accentColor),
  shippingPolicy: body.shippingPolicy?.trim() || "",
  returnPolicy: body.returnPolicy?.trim() || "",
  status: body.status === "paused" ? "paused" : "active",
});

export const GET = async () => {
  try {
    await connectDB();
    const vendors = await Vendor.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      status: 200,
      message: "Boutiques récupérées avec succès",
      data: vendors,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message: "Erreur lors du chargement des boutiques",
        error: error.message,
      },
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

    const payload = sanitizeVendorPayload(await req.json());

    if (!payload.name) {
      return NextResponse.json(
        {
          status: 400,
          message: "Le nom de la boutique est obligatoire",
        },
        { status: 400 }
      );
    }

    const vendor = await Vendor.create({
      ...payload,
    });

    return NextResponse.json({
      status: 201,
      message: "Boutique créée avec succès",
      data: vendor,
    });
  } catch (error) {
    const isDuplicate = error.code === 11000;
    return NextResponse.json(
      {
        status: isDuplicate ? 400 : 500,
        message: isDuplicate
          ? "Une boutique existe déjà avec ce nom"
          : "Erreur lors de la création de la boutique",
        error: error.message,
      },
      { status: isDuplicate ? 400 : 500 }
    );
  }
};
