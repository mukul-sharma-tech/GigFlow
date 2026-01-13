import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User, { IUser } from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";

interface SignupBody {
    name: string;
    email: string;
    password: string;
    role: "client" | "freelancer";
    companyName?: string;
    hourlyRate?: number;
}

export async function POST(req: Request) {
    try {
        const body: SignupBody = await req.json();
        const { name, email, password, role, companyName, hourlyRate } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { message: "Name, email, password, and role are required" },
                { status: 400 }
            );
        }

        if (role === "client" && !companyName) {
            return NextResponse.json(
                { message: "Company name is required for clients" },
                { status: 400 }
            );
        }

        if (role === "freelancer" && (hourlyRate === undefined || hourlyRate < 0)) {
            return NextResponse.json(
                { message: "Hourly rate is required for freelancers and must be non-negative" },
                { status: 400 }
            );
        }

        if (role !== "client" && role !== "freelancer") {
            return NextResponse.json(
                { message: "Invalid role" },
                { status: 400 }
            );
        }


        await connectDB();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const hashedVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        const userData: Partial<IUser> = {
            name,
            email,
            password: hashedPassword,
            role,
            emailVerificationToken: hashedVerificationToken,
            emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        };

        if (role === "client") {
            userData.companyName = companyName;
        } else if (role === "freelancer") {
            userData.hourlyRate = hourlyRate;
        }

        await User.create(userData);

        // Send verification email
        const emailResult = await sendVerificationEmail(email, verificationToken);
        if (!emailResult.success) {
            console.error("Failed to send verification email:", emailResult.error);
            // Still create user but log error
        }

        return NextResponse.json(
            { message: "User registered successfully. Please check your email to verify your account." },
            { status: 201 }
        );

    } catch (error) {
        let message = "Signup failed";

        if (error instanceof Error) {
            message = error.message;
        }

        return NextResponse.json(
            { message },
            { status: 500 }
        );

    }
}