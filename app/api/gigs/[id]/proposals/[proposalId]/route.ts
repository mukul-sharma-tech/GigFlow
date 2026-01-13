import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import Gig from "@/models/Gig";
import User from "@/models/User";
import Proposal from "@/models/Proposal";
import Contract from "@/models/Contract";
import Escrow from "@/models/Escrow";
import Transaction from "@/models/Transaction";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Only clients can approve proposals" }, { status: 403 });
    }

    const { id, proposalId } = await params;

    const gig = await Gig.findById(id);
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    if (gig.client.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "You can only approve proposals for your own gigs" }, { status: 403 });
    }

    if (gig.status !== "open") {
      return NextResponse.json({ error: "Gig is not open for approval" }, { status: 400 });
    }

    const proposal = await Proposal.findById(proposalId).populate("freelancer");
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.gig.toString() !== gig._id.toString()) {
      return NextResponse.json({ error: "Proposal does not belong to this gig" }, { status: 400 });
    }

    if (proposal.status !== "pending") {
      return NextResponse.json({ error: "Proposal is not pending" }, { status: 400 });
    }

    // Check if client has enough balance
    if (user.walletBalance < proposal.proposedAmount) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    // Start transaction
    const sessionDb = await mongoose.startSession();
    sessionDb.startTransaction();

    try {
      // Update proposal status
      proposal.status = "accepted";
      await proposal.save({ session: sessionDb });

      // Update gig status
      gig.status = "in_progress";
      await gig.save({ session: sessionDb });

      // Create contract
      const contract = new Contract({
        gig: gig._id,
        proposal: proposal._id,
        client: user._id,
        freelancer: proposal.freelancer._id,
        agreedAmount: proposal.proposedAmount,
        status: "active",
      });
      await contract.save({ session: sessionDb });

      // Create escrow
      const escrow = new Escrow({
        contract: contract._id,
        amount: proposal.proposedAmount,
        fromUser: user._id,
        toUser: proposal.freelancer._id,
        status: "locked",
      });
      await escrow.save({ session: sessionDb });

      // Debit from client wallet
      user.walletBalance -= proposal.proposedAmount;
      await user.save({ session: sessionDb });

      // Create transactions
      const debitTransaction = new Transaction({
        user: user._id,
        type: "debit",
        amount: proposal.proposedAmount,
        source: "wallet",
        referenceId: escrow._id,
        description: `Payment for gig: ${gig.title}`,
      });
      await debitTransaction.save({ session: sessionDb });

      const creditTransaction = new Transaction({
        user: proposal.freelancer._id,
        type: "credit",
        amount: proposal.proposedAmount,
        source: "escrow",
        referenceId: escrow._id,
        description: `Escrow locked for gig: ${gig.title}`,
      });
      await creditTransaction.save({ session: sessionDb });

      await sessionDb.commitTransaction();
      sessionDb.endSession();

      return NextResponse.json({ message: "Proposal approved successfully", contract: contract._id });
    } catch (error) {
      await sessionDb.abortTransaction();
      sessionDb.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error approving proposal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}