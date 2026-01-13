import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Contract from "@/models/Contract";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const excludeStatus = searchParams.get("excludeStatus");

    const query: Record<string, unknown> = {
      $or: [{ client: session.user.id }, { freelancer: session.user.id }],
    };

    if (statusFilter) {
      query.status = statusFilter;
    }

    if (excludeStatus) {
      query.status = { $ne: excludeStatus };
    }

    const contracts = await Contract.find(query)
      .populate("gig", "title status")
      .populate("client", "name")
      .populate("freelancer", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({ contracts });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}