import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyBearerToken } from "@/lib/auth";

interface StudentSummaryItem {
  studentId: string;
  hasCoopRecord: boolean;
  companyName: string | null;
  companyProvince: string | null;
  jobPosition: string | null;
  companyAddress: string | null;
  detail: string | null;
  updatedAt: string | null;
}

interface StudentsListSuccessResponse {
  success: true;
  count: number;
  data: StudentSummaryItem[];
}

interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
}

/**
 * GET /api/v1/students
 * 
 * Retrieve all students with their co-op internship records.
 * Secured via Bearer API Token.
 * 
 * Headers:
 *   Authorization: Bearer <STUDENT_WEB_API_TOKEN>
 * 
 * Response: 200 { success: true, count: number, data: [...] }
 * Error: 401 | 500 { success: false, error: string, code: string }
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<StudentsListSuccessResponse | ApiErrorResponse>> {
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

    const students = await prisma.student.findMany({
      include: {
        coopRecord: true,
      },
      orderBy: {
        studentId: "asc",
      },
    });

    const data: StudentSummaryItem[] = students.map((s) => ({
      studentId: s.studentId,
      hasCoopRecord: s.coopRecord !== null,
      companyName: s.coopRecord?.companyName ?? null,
      companyProvince: s.coopRecord?.companyProvince ?? null,
      jobPosition: s.coopRecord?.jobPosition ?? null,
      companyAddress: s.coopRecord?.companyAddress ?? null,
      detail: s.coopRecord?.detail ?? null,
      updatedAt: s.coopRecord ? s.coopRecord.updatedAt.toISOString() : null,
    }));

    return NextResponse.json(
      {
        success: true,
        count: data.length,
        data,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
