import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = "login", email, password, name, role } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = (role || "").toUpperCase() === "CANDIDATE" ? "CANDIDATE" : "RECRUITER";

    // ----------------------------------------------------------------------
    // ACTION: SIGNUP / CREATE ACCOUNT
    // ----------------------------------------------------------------------
    if (action === "signup") {
      if (!password || password.trim().length < 6) {
        return NextResponse.json(
          { success: false, error: "Password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "An account with this email already exists. Please Sign In." },
          { status: 409 }
        );
      }

      const passwordHash = hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name || (normalizedRole === "RECRUITER" ? "Recruiter User" : "Student Applicant"),
          password: passwordHash,
          role: normalizedRole,
        },
      });

      const { password: _, ...sanitizedUser } = user;
      return NextResponse.json({
        success: true,
        data: sanitizedUser,
        message: "Account created successfully!",
      });
    }

    // ----------------------------------------------------------------------
    // ACTION: LOGIN / SIGN IN
    // ----------------------------------------------------------------------
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email. Please Create an Account first." },
        { status: 404 }
      );
    }

    // Verify password if user has a password set
    if (user.password) {
      if (!password) {
        return NextResponse.json({ success: false, error: "Password is required to sign in." }, { status: 400 });
      }
      const isValid = verifyPassword(password, user.password);
      if (!isValid) {
        return NextResponse.json({ success: false, error: "Incorrect password. Please try again." }, { status: 401 });
      }
    }

    const { password: _, ...sanitizedUser } = user;
    return NextResponse.json({
      success: true,
      data: sanitizedUser,
      message: "Authenticated successfully!",
    });
  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Authentication process failed." },
      { status: 500 }
    );
  }
}
