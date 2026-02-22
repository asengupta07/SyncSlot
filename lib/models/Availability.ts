import mongoose from "mongoose";
import "@/lib/models/User"; // Register User before refs
import "@/lib/models/Group"; // Register Group before refs

const intervalSchema = new mongoose.Schema(
  {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    intervals: [intervalSchema],
  },
  { timestamps: true }
);

availabilitySchema.index({ userId: 1, groupId: 1 }, { unique: true });

export const Availability =
  mongoose.models.Availability ||
  mongoose.model("Availability", availabilitySchema);
