import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Contract from "@/models/Contract";
import { Types } from "mongoose";

interface PopulatedContract {
  _id: Types.ObjectId;
  gig: {
    title: string;
  };
  updatedAt: Date;
}

interface PastProject {
  _id: Types.ObjectId;
  title: string;
  completedAt: Date;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    // Fetch user profile
    const user = await User.findById(id).select(
      "name email companyName role walletBalance hourlyRate rating totalReviews skills about companyInfo"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let pastProjects: PastProject[] = [];

    // If user is a client, fetch their completed projects
    if (user.role === "client") {
      const contracts = await Contract.find({
        client: id,
        status: "completed",
      })
        .populate("gig", "title")
        .sort({ updatedAt: -1 }) as PopulatedContract[];

      pastProjects = contracts.map((contract) => ({
        _id: contract._id,
        title: (contract.gig as { title: string }).title,
        completedAt: contract.updatedAt,
      }));
    }

    return NextResponse.json({
      user,
      pastProjects,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}