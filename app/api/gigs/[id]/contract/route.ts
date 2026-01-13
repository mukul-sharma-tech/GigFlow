import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Contract from "@/models/Contract";

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

    const { id } = await params;

    const contract = await Contract.findOne({ gig: id })
      .populate("gig", "title description")
      .populate("proposal")
      .populate("client", "name email")
      .populate("freelancer", "name email");

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Check if user is part of the contract
    if (
      contract.client._id.toString() !== session.user.id &&
      contract.freelancer._id.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ contract });
  } catch (error) {
    console.error("Error fetching contract:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}