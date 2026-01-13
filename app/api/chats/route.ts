import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import Chat from "@/models/Chat";
import Contract from "@/models/Contract";
import Gig from "@/models/Gig";
import User from "@/models/User";

// Get all contracts with chat for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Ensure models are registered - access them to trigger registration
    // This is necessary in Next.js serverless environment
    if (!mongoose.models.Gig) {
      await import("@/models/Gig");
    }
    if (!mongoose.models.User) {
      await import("@/models/User");
    }

    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get("contractId");

    // If contractId is provided, get messages for that contract
    if (contractId) {
      // Verify user has access to this contract
      const contract = await Contract.findOne({
        _id: contractId,
        $or: [{ client: session.user.id }, { freelancer: session.user.id }],
      });

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

      return NextResponse.json({ messages });
    }

    // Otherwise, get all contracts with unread message counts
    const contracts = await Contract.find({
      $or: [{ client: session.user.id }, { freelancer: session.user.id }],
      status: { $in: ["active", "work_submitted"] }, // Only show active contracts
    })
      .populate("gig", "title")
      .populate("client", "name email")
      .populate("freelancer", "name email")
      .sort({ updatedAt: -1 });

    // Get unread counts for each contract
    const contractsWithUnread = await Promise.all(
      contracts.map(async (contract) => {
        const unreadCount = await Chat.countDocuments({
          contract: contract._id,
          receiver: session.user.id,
          read: false,
        });

        // Get last message
        const lastMessage = await Chat.findOne({ contract: contract._id })
          .sort({ createdAt: -1 })
          .select("message createdAt sender")
          .populate("sender", "name");

        return {
          _id: contract._id.toString(),
          gig: contract.gig,
          client: contract.client,
          freelancer: contract.freelancer,
          status: contract.status,
          agreedAmount: contract.agreedAmount,
          unreadCount,
          lastMessage: lastMessage
            ? {
                message: lastMessage.message,
                createdAt: lastMessage.createdAt,
                sender: lastMessage.sender,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ contracts: contractsWithUnread });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create a new message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { contractId, message } = await req.json();

    if (!contractId || !message || !message.trim()) {
      return NextResponse.json(
        { error: "Contract ID and message are required" },
        { status: 400 }
      );
    }

    // Verify user has access to this contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (
      contract.client.toString() !== session.user.id &&
      contract.freelancer.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Determine receiver
    const receiverId =
      contract.client.toString() === session.user.id
        ? contract.freelancer
        : contract.client;

    // Create message
    const chatMessage = await Chat.create({
      contract: contractId,
      sender: session.user.id,
      receiver: receiverId,
      message: message.trim(),
    });

    const populatedMessage = await Chat.findById(chatMessage._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    return NextResponse.json({ message: populatedMessage }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
