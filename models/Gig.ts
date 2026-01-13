import mongoose, { Schema, models } from "mongoose";
import { IUser } from "./User";

export interface IGig extends mongoose.Document {
  title: string;
  description: string;
  budget: number;
  deadline?: Date;

  client: IUser["_id"];

  status: "open" | "in_progress" | "completed" | "cancelled";
}

const GigSchema = new Schema<IGig>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    budget: {
      type: Number,
      required: true,
      min: 1,
    },

    deadline: {
      type: Date,
    },

    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default models.Gig || mongoose.model<IGig>("Gig", GigSchema);