import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Gig from "@/models/Gig";
import User from "@/models/User";
import Proposal from "@/models/Proposal";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    const gig = await Gig.findById(id);
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    // Only client can view proposals
    if (gig.client.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Only the client can view proposals" }, { status: 403 });
    }

    const proposals = await Proposal.find({ gig: gig._id })
      .populate("freelancer", "_id name email rating totalReviews")
      .sort({ proposedAmount: -1 }); // Sort by amount descending

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user || user.role !== "freelancer") {
      return NextResponse.json({ error: "Only freelancers can send proposals" }, { status: 403 });
    }

    const { id } = await params;

    const gig = await Gig.findById(id);
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    if (gig.status !== "open") {
      return NextResponse.json({ error: "Gig is not open for proposals" }, { status: 400 });
    }

    const body = await req.json();
    const { coverLetter, proposedAmount, deliveryTime } = body;

    if (!coverLetter || !proposedAmount || !deliveryTime) {
      return NextResponse.json({ error: "Cover letter, proposed amount, and delivery time are required" }, { status: 400 });
    }

    const proposal = new Proposal({
      gig: gig._id,
      freelancer: user._id,
      coverLetter,
      proposedAmount,
      deliveryTime,
    });

    await proposal.save();

    return NextResponse.json({ message: "Proposal submitted successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error sending proposal:", error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json({ error: "You have already sent a proposal for this gig" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}