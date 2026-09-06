import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface DeleteResponse {
  success: true;
  message: string;
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
 * DELETE /api/internal/students/[studentId]
 * Allows instructor to delete a student record.
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteParams
): Promise<NextResponse<DeleteResponse | ErrorResponse>> {
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

    await prisma.student.delete({
      where: { studentId },
    });

    return NextResponse.json({
      success: true,
      message: `ลบข้อมูลนิสิต ${studentId} เรียบร้อยแล้ว`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบข้อมูล";
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
