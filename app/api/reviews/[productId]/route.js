import connectDB from "@/db/Database";
import ClothingProduct from "@/models/Product";
import Review from "@/models/Review";
import { NextResponse } from "next/server";
import { requireAuthUser } from "@/utils/serverAuth";

const buildSummary = (reviews = []) => {
  const total = reviews.length;
  const average =
    total > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total
      : 0;

  return {
    total,
    average,
  };
};

export const GET = async (req, { params }) => {
  await connectDB();

  try {
    const { productId } = params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    return NextResponse.json({
      status: 200,
      data: reviews,
      summary: buildSummary(reviews),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message: "Erreur lors du chargement des avis",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const POST = async (req, { params }) => {
  await connectDB();

  try {
    const { user, error } = await requireAuthUser();

    if (error) {
      return NextResponse.json(
        { status: error.status, message: error.message },
        { status: error.status }
      );
    }

    const { productId } = params;
    const product = await ClothingProduct.findById(productId);

    if (!product) {
      return NextResponse.json(
        { status: 404, message: "Produit introuvable" },
        { status: 404 }
      );
    }

    const { rating, title = "", comment = "" } = await req.json();

    if (!rating || !comment?.trim()) {
      return NextResponse.json(
        {
          status: 400,
          message: "La note et le commentaire sont obligatoires",
        },
        { status: 400 }
      );
    }

    const review = await Review.findOneAndUpdate(
      {
        productId,
        userId: user._id,
      },
      {
        productId,
        vendorId: product.vendorId || null,
        userId: user._id,
        userName: user.name,
        rating: Number(rating),
        title: title.trim(),
        comment: comment.trim(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    return NextResponse.json({
      status: 201,
      message: "Avis enregistré avec succès",
      data: review,
      summary: buildSummary(reviews),
    });
  } catch (error) {
    const duplicate = error?.code === 11000;
    return NextResponse.json(
      {
        status: duplicate ? 400 : 500,
        message: duplicate
          ? "Vous avez déjà laissé un avis pour ce produit"
          : "Erreur lors de l'enregistrement de l'avis",
        error: error.message,
      },
      { status: duplicate ? 400 : 500 }
    );
  }
};
