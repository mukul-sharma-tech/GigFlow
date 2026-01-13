import mongoose, { Schema, models } from "mongoose";
import { IUser } from "./User";
import { IGig } from "./Gig";
import { IProposal } from "./Proposal";

export interface IContract extends mongoose.Document {
  gig: IGig["_id"];
  proposal: IProposal["_id"];

  client: IUser["_id"];
  freelancer: IUser["_id"];

  agreedAmount: number;

  status:
    | "active"
    | "work_submitted"
    | "approved"
    | "completed"
    | "cancelled";

  submission?: {
    message?: string;
    fileUrl?: string;
    submittedAt?: Date;
  };

  rating?: number; // Rating given by client (1-5)
}

const ContractSchema = new Schema<IContract>(
  {
    gig: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },

    proposal: {
      type: Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },

    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    freelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    agreedAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: [
        "active",
        "work_submitted",
        "approved",
        "completed",
        "cancelled",
      ],
      default: "active",
    },

    submission: {
      message: { type: String },
      fileUrl: { type: String },
      submittedAt: { type: Date },
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// 🚫 One contract per gig
ContractSchema.index({ gig: 1 }, { unique: true });

export default models.Contract ||
  mongoose.model<IContract>("Contract", ContractSchema);