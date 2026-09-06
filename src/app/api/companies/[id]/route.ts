import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { companySchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/companies/[id]
 */
export async function GET(
  _request: NextRequest,
  context: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลบริษัทนี้ในระบบ", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching company";
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/companies/[id]
 */
export async function PUT(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const body: unknown = await request.json();
    const parseResult = companySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: parseResult.error.issues.map((i) => i.message).join(", "),
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { name, province, position, address, detail } = parseResult.data;

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        name,
        province,
        position,
        address,
        detail: detail || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCompany,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating company";
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/companies/[id]
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    await prisma.company.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบข้อมูลบริษัทเรียบร้อยแล้ว",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error deleting company";
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
