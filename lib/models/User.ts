import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    timezone: { type: String, default: "UTC" },
  },
  { timestamps: true }
);

userSchema.index({ username: 1 }, { unique: true });

export const User =
  mongoose.models.User || mongoose.model("User", userSchema);
