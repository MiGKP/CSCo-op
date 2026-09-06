import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { companySchema } from "@/lib/validators";

/**
 * GET /api/companies
 * Fetch all companies for instructor dashboard.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching companies";
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies
 * Create a new company record in directory.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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

    const company = await prisma.company.create({
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
      data: company,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating company";
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
