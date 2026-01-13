import mongoose, { Schema, models } from "mongoose";
import { IUser } from "./User";
import { IContract } from "./Contract";

export interface IEscrow extends mongoose.Document {
  contract: IContract["_id"];

  amount: number;

  fromUser: IUser["_id"];
  toUser: IUser["_id"];

  status: "locked" | "released" | "refunded";
}

const EscrowSchema = new Schema<IEscrow>(
  {
    contract: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    fromUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    toUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["locked", "released", "refunded"],
      default: "locked",
    },
  },
  { timestamps: true }
);

export default models.Escrow ||
  mongoose.model<IEscrow>("Escrow", EscrowSchema);