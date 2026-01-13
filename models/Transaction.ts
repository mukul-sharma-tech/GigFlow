import mongoose, { Schema, models } from "mongoose";
import { IUser } from "./User";

export interface ITransaction extends mongoose.Document {
  user: IUser["_id"];

  type: "debit" | "credit";
  amount: number;

  source: "wallet" | "escrow";
  referenceId?: mongoose.Types.ObjectId;

  description?: string;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    source: {
      type: String,
      enum: ["wallet", "escrow"],
      required: true,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
    },

    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);