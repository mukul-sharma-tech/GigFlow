import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Contract from "@/models/Contract";

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
    const { message, fileUrl } = await req.json();

    const contract = await Contract.findById(id).populate("freelancer");
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.freelancer._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only the freelancer can submit work" }, { status: 403 });
    }

    if (contract.status !== "active") {
      return NextResponse.json({ error: "Contract is not active" }, { status: 400 });
    }

    contract.status = "work_submitted";
    contract.submission = {
      message,
      fileUrl,
      submittedAt: new Date(),
    };

    await contract.save();

    return NextResponse.json({ message: "Work submitted successfully" });
  } catch (error) {
    console.error("Error submitting work:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}