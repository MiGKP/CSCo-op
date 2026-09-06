import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyBearerToken } from "@/lib/auth";

const loginSchema = z.object({
  studentId: z.string().min(1, { message: "Student ID is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

interface LoginSuccessResponse {
  success: true;
  message: string;
  data: {
    studentId: string;
  };
}

interface LoginErrorResponse {
  success: false;
  error: string;
  code: string;
}

/**
 * POST /api/v1/auth/login
 * 
 * Authenticates a student account created by the instructor.
 * Called by external Student Website when a student enters their studentId and random password.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<LoginSuccessResponse | LoginErrorResponse>> {
  try {
    const expectedToken =
      process.env.STUDENT_WEB_API_TOKEN || "coop_secret_token_2026_student_portal";
    const authHeader = request.headers.get("authorization");

    if (!verifyBearerToken(authHeader, expectedToken)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Missing or invalid Bearer API token",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues.map((i) => i.message).join(", "),
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { studentId, password } = parseResult.data;

    const student = await prisma.student.findUnique({
      where: { studentId },
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid student ID or password",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    // Verify password hash
    const inputHash = hashPassword(password);
    if (inputHash !== student.passwordHash && password !== student.tempPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid student ID or password",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          studentId: student.studentId,
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      {
        success: false,
        error: message,
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
