import mongoose from "mongoose";
import "@/lib/models/User"; // Register User before refs

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    joinCode: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    finalisedSlot: {
      start: Date,
      end: Date,
    },
  },
  { timestamps: true }
);

groupSchema.index({ joinCode: 1 }, { unique: true });

export const Group =
  mongoose.models.Group || mongoose.model("Group", groupSchema);
