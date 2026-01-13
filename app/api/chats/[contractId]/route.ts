import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import Chat from "@/models/Chat";
import Contract from "@/models/Contract";
import Gig from "@/models/Gig";
import User from "@/models/User";

// Get messages for a specific contract
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Ensure models are registered - access them to trigger registration
    if (!mongoose.models.Gig) {
      await import("@/models/Gig");
    }
    if (!mongoose.models.User) {
      await import("@/models/User");
    }

    const { contractId } = await params;

    // Verify user has access to this contract
    // and populate related gig + users so the frontend
    // can safely show names/emails
    const contract = await Contract.findOne({
      _id: contractId,
      $or: [{ client: session.user.id }, { freelancer: session.user.id }],
    })
      .populate("gig", "title")
      .populate("client", "name email")
      .populate("freelancer", "name email");

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const messages = await Chat.find({ contract: contractId })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 });

    // Mark messages as read for the current user
    await Chat.updateMany(
      {
        contract: contractId,
        receiver: session.user.id,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    return NextResponse.json({ messages, contract });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
