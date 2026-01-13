import mongoose, { Schema, models } from "mongoose";

/* -------------------- SUB MODELS -------------------- */

export interface IProject {
  name: string;
  description: string;
  link?: string;
}

export interface IAbout {
  summary?: string;          // short intro / bio
  experience?: string;       // detailed experience (text)
  projects?: IProject[];     // highlighted projects
}

/* -------------------- USER INTERFACE -------------------- */

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  companyName: string;

  role: "client" | "freelancer";

  // Wallet
  walletBalance: number;

  // Pricing & Ratings
  hourlyRate?: number;
  rating?: number;       // avg rating (e.g. 4.5)
  totalReviews?: number; // total ratings count

  // Profile
  skills?: string[];
  about?: IAbout;

  // Auth
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
}

/* -------------------- SCHEMAS -------------------- */

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String },
  },
  { _id: false }
);

const AboutSchema = new Schema<IAbout>(
  {
    summary: {
      type: String,
      maxlength: 500,
    },
    experience: {
      type: String, // full experience in text
      maxlength: 3000,
    },
    projects: {
      type: [ProjectSchema],
      default: [],
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    companyName: { type: String },

    role: {
      type: String,
      enum: ["client", "freelancer"],
      required: true,
    },

    // 💰 Wallet
    walletBalance: {
      type: Number,
      default: 100000, // 1 lakh fake balance
    },

    // 💵 Pricing
    hourlyRate: {
      type: Number,
      min: 0,
    },

    // ⭐ Ratings
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // 🧠 Profile
    skills: {
      type: [String],
      default: [],
    },

    about: {
      type: AboutSchema,
      default: {},
    },

    // 🔐 Auth
    resetPasswordToken: { type: String },

    resetPasswordExpiry: { type: Date },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: { type: String },

    emailVerificationExpiry: { type: Date },
  },
  { timestamps: true }
);

export default models.User || mongoose.model<IUser>("User", UserSchema);
