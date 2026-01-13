import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Gig from "@/models/Gig";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const gigs = await Gig.find({ status: "open" })
      .populate("client", "_id name companyName")
      .sort({ createdAt: -1 });

    return NextResponse.json({ gigs });
  } catch (error) {
    console.error("Error fetching gigs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Only clients can post gigs" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, budget, deadline } = body;

    if (!title || !description || !budget) {
      return NextResponse.json({ error: "Title, description, and budget are required" }, { status: 400 });
    }

    const gig = new Gig({
      title,
      description,
      budget,
      deadline: deadline ? new Date(deadline) : undefined,
      client: user._id,
    });

    await gig.save();

    return NextResponse.json({ gig }, { status: 201 });
  } catch (error) {
    console.error("Error creating gig:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}