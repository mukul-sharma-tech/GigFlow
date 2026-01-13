import mongoose, { Schema, models } from "mongoose";
import { IUser } from "./User";
import { IGig } from "./Gig";

export interface IProposal extends mongoose.Document {
  gig: IGig["_id"];
  freelancer: IUser["_id"];

  coverLetter: string;
  proposedAmount: number;
  deliveryTime: number;

  status: "pending" | "accepted" | "rejected";
}

const ProposalSchema = new Schema<IProposal>(
  {
    gig: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },

    freelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    coverLetter: {
      type: String,
      required: true,
      maxlength: 3000,
    },

    proposedAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    deliveryTime: {
      type: Number, // days
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// 🚫 One proposal per freelancer per gig
ProposalSchema.index({ gig: 1, freelancer: 1 }, { unique: true });

export default models.Proposal ||
  mongoose.model<IProposal>("Proposal", ProposalSchema);