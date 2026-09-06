import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyBearerToken } from "@/lib/auth";
import { studentIdRegex } from "@/lib/validators";

interface StudentCoopApiData {
  studentId: string;
  hasCoopRecord: boolean;
  companyName: string | null;
  companyProvince: string | null;
  jobPosition: string | null;
  companyAddress: string | null;
  detail: string | null;
  updatedAt: string | null;
}

interface StudentApiSuccessResponse {
  success: true;
  data: StudentCoopApiData;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
}

interface RouteParams {
  params: Promise<{
    studentId: string;
  }>;
}

const paramsSchema = z.object({
  studentId: z.string().regex(studentIdRegex, {
    message: "Invalid student ID format. Must be numeric (8-15 digits).",
  }),
});

/**
 * GET /api/v1/students/[studentId]
 * 
 * Secure REST API endpoint for the external Student Website to retrieve
 * Co-op internship data submitted by the CS faculty instructor.
 * 
 * Headers:
 *   Authorization: Bearer <STUDENT_WEB_API_TOKEN>
 * 
 * Response Success (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "studentId": "66011212222",
 *     "hasCoopRecord": true,
 *     "companyName": "Acme Tech Thailand",
 *     "companyProvince": "กรุงเทพมหานคร",
 *     "jobPosition": "Software Engineer Intern",
 *     "companyAddress": "123 Sukhumvit Road...",
 *     "detail": "ผ่านการสัมภาษณ์...",
 *     "updatedAt": "2026-09-06T08:30:00.000Z"
 *   }
 * }
 * 
 * Response Error (401 Unauthorized, 400 Bad Request, 404 Not Found, 500 Server Error):
 * {
 *   "success": false,
 *   "error": string,
 *   "code": string
 * }
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse<StudentApiSuccessResponse | ApiErrorResponse>> {
  try {
    // 1. Authenticate with Bearer token
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

    // 2. Validate URL params with Zod
    const rawParams = await context.params;
    const validatedParams = paramsSchema.safeParse(rawParams);

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: validatedParams.error.issues.map((i) => i.message).join(", "),
          code: "INVALID_PARAMETERS",
        },
        { status: 400 }
      );
    }

    const { studentId } = validatedParams.data;

    // 3. Query student and their co-op record
    const student = await prisma.student.findUnique({
      where: { studentId },
      include: {
        coopRecord: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: `Student record with ID '${studentId}' was not found.`,
          code: "STUDENT_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const record = student.coopRecord;

    return NextResponse.json(
      {
        success: true,
        data: {
          studentId: student.studentId,
          hasCoopRecord: record !== null,
          companyName: record?.companyName ?? null,
          companyProvince: record?.companyProvince ?? null,
          jobPosition: record?.jobPosition ?? null,
          companyAddress: record?.companyAddress ?? null,
          detail: record?.detail ?? null,
          updatedAt: record ? record.updatedAt.toISOString() : null,
        },
      },
      {
        status: 200,
        headers: {
          // Allow CORS so the external student website frontend can query directly if needed
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

/**
 * Handle OPTIONS preflight for CORS requests from the student portal frontend.
 */
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
