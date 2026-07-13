import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClothingProduct",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      size: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
      },
      vendorName: {
        type: String,
        default: "SB Store",
      },
      vendorSlug: {
        type: String,
        default: "sb-store",
      },
    },
  ],
  vendorBreakdown: [
    {
      vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
      },
      vendorName: {
        type: String,
        required: true,
      },
      vendorSlug: {
        type: String,
        default: "sb-store",
      },
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
      itemCount: {
        type: Number,
        required: true,
        min: 0,
      },
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ClothingProduct",
          },
          quantity: Number,
          size: String,
          image: String,
          price: Number,
          name: String,
        },
      ],
    },
  ],
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  promo: {
    code: String,
    label: String,
    type: {
      type: String,
      enum: ["percent", "fixed"],
    },
    value: Number,
    discountAmount: Number,
  },
  customer: {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["cash_on_delivery", "online"],
    default: "cash_on_delivery",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "awaiting_payment", "paid", "failed", "refunded"],
    default: "pending",
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
