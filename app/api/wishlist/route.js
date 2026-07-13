import connectDB from "@/db/Database";
import Wishlist from "@/models/Wishlist";
import { NextResponse } from "next/server";
import { requireAuthUser } from "@/utils/serverAuth";

const populateWishlist = (query) =>
  query.populate({
    path: "items.productId",
    populate: {
      path: "vendorId",
      select: "name slug city status",
    },
  });

export const GET = async () => {
  await connectDB();

  try {
    const { user, error } = await requireAuthUser();

    if (error) {
      return NextResponse.json(
        { status: error.status, message: error.message },
        { status: error.status }
      );
    }

    const wishlist = await populateWishlist(
      Wishlist.findOne({ userId: user._id })
    );

    return NextResponse.json({
      status: 200,
      data: wishlist?.items || [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message: "Erreur lors du chargement des favoris",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

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

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { status: 400, message: "Produit manquant" },
        { status: 400 }
      );
    }

    let wishlist = await Wishlist.findOne({ userId: user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: user._id,
        items: [{ productId }],
      });
    } else {
      const alreadyExists = wishlist.items.some(
        (item) => String(item.productId) === String(productId)
      );

      if (!alreadyExists) {
        wishlist.items.push({ productId });
        await wishlist.save();
      }
    }

    const populated = await populateWishlist(
      Wishlist.findOne({ userId: user._id })
    );

    return NextResponse.json({
      status: 200,
      message: "Produit ajouté aux favoris",
      data: populated?.items || [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message: "Erreur lors de l'ajout aux favoris",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const DELETE = async (req) => {
  await connectDB();

  try {
    const { user, error } = await requireAuthUser();

    if (error) {
      return NextResponse.json(
        { status: error.status, message: error.message },
        { status: error.status }
      );
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { status: 400, message: "Produit manquant" },
        { status: 400 }
      );
    }

    await Wishlist.findOneAndUpdate(
      { userId: user._id },
      { $pull: { items: { productId } } },
      { new: true }
    );

    const populated = await populateWishlist(
      Wishlist.findOne({ userId: user._id })
    );

    return NextResponse.json({
      status: 200,
      message: "Produit retiré des favoris",
      data: populated?.items || [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message: "Erreur lors de la suppression du favori",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
