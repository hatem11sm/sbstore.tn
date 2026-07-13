import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  role: {
    type: String,
    enum: ["customer", "vendor", "admin"],
    default: "customer",
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    default: null,
  },
});

userSchema.pre("save", function syncRole(next) {
  if (this.isAdmin) {
    this.role = "admin";
  } else if (this.role === "admin") {
    this.isAdmin = true;
  }
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
