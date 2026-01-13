import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Gig from "@/models/Gig";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const gig = await Gig.findById(id)
      .populate("client", "name companyName");

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    return NextResponse.json({ gig });
  } catch (error) {
    console.error("Error fetching gig:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}