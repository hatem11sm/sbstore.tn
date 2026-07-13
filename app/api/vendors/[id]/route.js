import connectDB from "@/db/Database";
import Vendor from "@/models/Vendor";
import { NextResponse } from "next/server";
import { isAdminUser, requireAuthUser, userOwnsVendor } from "@/utils/serverAuth";
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

export const GET = async (_req, { params }) => {
  try {
    await connectDB();
    const vendor = await Vendor.findById(params.id);

    if (!vendor) {
      return NextResponse.json(
        { status: 404, message: "Boutique introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Boutique récupérée avec succès",
      data: vendor,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message: "Erreur lors du chargement de la boutique",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const PUT = async (req, { params }) => {
  try {
    await connectDB();
    const { user, error } = await requireAuthUser();

    if (error) {
      return NextResponse.json(
        { status: error.status, message: error.message },
        { status: error.status }
      );
    }

    const vendor = await Vendor.findById(params.id);

    if (!vendor) {
      return NextResponse.json(
        { status: 404, message: "Boutique introuvable" },
        { status: 404 }
      );
    }

    const isAuthorized =
      isAdminUser(user) || userOwnsVendor(user, vendor._id.toString());

    if (!isAuthorized) {
      return NextResponse.json(
        { status: 403, message: "Accès refusé pour cette boutique" },
        { status: 403 }
      );
    }

    const payload = sanitizeVendorPayload(await req.json());

    if (!payload.name) {
      return NextResponse.json(
        { status: 400, message: "Le nom de la boutique est obligatoire" },
        { status: 400 }
      );
    }

    Object.assign(vendor, payload);
    await vendor.save();

    return NextResponse.json({
      status: 200,
      message: "Boutique mise à jour avec succès",
      data: vendor,
    });
  } catch (error) {
    const isDuplicate = error.code === 11000;
    return NextResponse.json(
      {
        status: isDuplicate ? 400 : 500,
        message: isDuplicate
          ? "Une boutique existe déjà avec ce nom"
          : "Erreur lors de la mise à jour de la boutique",
        error: error.message,
      },
      { status: isDuplicate ? 400 : 500 }
    );
  }
};
