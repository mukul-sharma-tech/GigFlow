import mongoose, { Schema, models } from "mongoose";
import { IUser } from "./User";
import { IContract } from "./Contract";

export interface IChat extends mongoose.Document {
  contract: IContract["_id"];
  sender: IUser["_id"];
  receiver: IUser["_id"];
  message: string;
  read: boolean;
  readAt?: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    contract: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
ChatSchema.index({ contract: 1, createdAt: -1 });
ChatSchema.index({ sender: 1, receiver: 1 });
ChatSchema.index({ receiver: 1, read: 1 });

export default models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
