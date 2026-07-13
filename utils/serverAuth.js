import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";

export const getAuthUser = async () => {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authToken")?.value || "";

  if (!authToken) {
    return null;
  }

  try {
    const payload = jwt.verify(authToken, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password").populate(
      "vendorId",
      "name slug city phone contactName description status"
    );

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
};

export const requireAuthUser = async () => {
  const user = await getAuthUser();

  if (!user) {
    return {
      user: null,
      error: {
        status: 401,
        message: "Authentification requise",
      },
    };
  }

  return { user, error: null };
};

export const isAdminUser = (user) =>
  Boolean(user?.isAdmin || user?.role === "admin");

export const isVendorUser = (user) => user?.role === "vendor";

export const userOwnsVendor = (user, vendorId) => {
  if (!user?.vendorId || !vendorId) return false;
  return String(user.vendorId._id || user.vendorId) === String(vendorId);
};
