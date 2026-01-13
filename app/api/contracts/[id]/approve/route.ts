import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import Contract from "@/models/Contract";
import Escrow from "@/models/Escrow";
import Transaction from "@/models/Transaction";
import Gig from "@/models/Gig";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const { rating } = await req.json();

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const contract = await Contract.findById(id).populate("client freelancer gig");
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.client._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only the client can approve work" }, { status: 403 });
    }

    if (contract.status !== "work_submitted") {
      return NextResponse.json({ error: "Work has not been submitted yet" }, { status: 400 });
    }

    // Start transaction
    const sessionDb = await mongoose.startSession();
    sessionDb.startTransaction();

    try {
      // Update contract status and rating
      contract.status = "approved";
      if (rating) {
        contract.rating = rating;
      }
      await contract.save({ session: sessionDb });

      // Update gig status
      const gig = await Gig.findById(contract.gig);
      if (gig) {
        gig.status = "completed";
        await gig.save({ session: sessionDb });
      }

      // Release escrow
      const escrow = await Escrow.findOne({ contract: contract._id });
      if (escrow) {
        escrow.status = "released";
        await escrow.save({ session: sessionDb });

        // Credit freelancer
        const freelancer = await mongoose.model("User").findById(contract.freelancer._id);
        if (freelancer) {
          freelancer.walletBalance += escrow.amount;

          // Update rating if provided
          if (rating) {
            const completedContracts = await Contract.find({
              freelancer: freelancer._id,
              status: "approved",
              rating: { $exists: true },
            });
            const totalRating = completedContracts.reduce((sum, c) => sum + (c.rating || 0), 0) + rating;
            const newAverage = totalRating / (completedContracts.length + 1);
            freelancer.rating = Math.round(newAverage * 10) / 10; // Round to 1 decimal
            freelancer.totalReviews = (freelancer.totalReviews || 0) + 1;
          }

          await freelancer.save({ session: sessionDb });

          // Create transaction
          const transaction = new Transaction({
            user: freelancer._id,
            type: "credit",
            amount: escrow.amount,
            source: "escrow",
            referenceId: escrow._id,
            description: `Payment released for gig: ${gig?.title}`,
          });
          await transaction.save({ session: sessionDb });
        }
      }

      await sessionDb.commitTransaction();
      sessionDb.endSession();

      return NextResponse.json({ message: "Work approved and payment released" });
    } catch (error) {
      await sessionDb.abortTransaction();
      sessionDb.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error approving work:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}