import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coopRecordSchema } from "@/lib/validators";

interface CoopRecordData {
  id: string;
  studentId: string;
  companyName: string;
  companyProvince: string;
  jobPosition: string;
  companyAddress: string;
  detail: string | null;
  updatedAt: string;
}

interface CoopSuccessResponse {
  success: true;
  data: CoopRecordData;
}

interface ErrorResponse {
  error: string;
  code: string;
}

interface RouteParams {
  params: Promise<{
    studentId: string;
  }>;
}

/**
 * GET /api/students/[studentId]/coop
 * Returns the student and their associated co-op record.
 */
export async function GET(
  _request: NextRequest,
  context: RouteParams
): Promise<NextResponse<CoopSuccessResponse | ErrorResponse>> {
  try {
    const { studentId } = await context.params;

    const student = await prisma.student.findUnique({
      where: { studentId },
      include: { coopRecord: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลนิสิตนี้ในระบบ", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!student.coopRecord) {
      return NextResponse.json(
        { error: "นิสิตยังไม่มีข้อมูลการฝึกงาน", code: "COOP_RECORD_NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: student.coopRecord.id,
        studentId: student.studentId,
        companyName: student.coopRecord.companyName,
        companyProvince: student.coopRecord.companyProvince,
        jobPosition: student.coopRecord.jobPosition,
        companyAddress: student.coopRecord.companyAddress,
        detail: student.coopRecord.detail,
        updatedAt: student.coopRecord.updatedAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล";
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/students/[studentId]/coop
 * Creates or updates the 5-field Co-op record for a student.
 * 
 * Expected payload:
 * {
 *   companyName: string;
 *   companyProvince: string;
 *   jobPosition: string;
 *   companyAddress: string;
 *   detail?: string;
 * }
 */
export async function POST(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse<CoopSuccessResponse | ErrorResponse>> {
  try {
    const { studentId } = await context.params;

    const student = await prisma.student.findUnique({
      where: { studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลนิสิตนี้ในระบบ", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const body: unknown = await request.json();
    const parseResult = coopRecordSchema.safeParse(body);

    if (!parseResult.success) {
      const errorText = parseResult.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json(
        { error: errorText, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { companyName, companyProvince, jobPosition, companyAddress, detail } =
      parseResult.data;

    // Use upsert to handle both first-time creation and subsequent updates cleanly
    const savedRecord = await prisma.coopRecord.upsert({
      where: {
        studentId: student.id,
      },
      update: {
        companyName,
        companyProvince,
        jobPosition,
        companyAddress,
        detail: detail || null,
      },
      create: {
        studentId: student.id,
        companyName,
        companyProvince,
        jobPosition,
        companyAddress,
        detail: detail || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: savedRecord.id,
        studentId: student.studentId,
        companyName: savedRecord.companyName,
        companyProvince: savedRecord.companyProvince,
        jobPosition: savedRecord.jobPosition,
        companyAddress: savedRecord.companyAddress,
        detail: savedRecord.detail,
        updatedAt: savedRecord.updatedAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
