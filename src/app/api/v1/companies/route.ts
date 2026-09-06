import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyBearerToken } from "@/lib/auth";

interface CompanyApiItem {
  id: string;
  name: string;
  province: string;
  position: string;
  address: string;
  detail: string | null;
  updatedAt: string;
}

interface CompaniesApiResponse {
  success: true;
  count: number;
  data: CompanyApiItem[];
}

interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
}

/**
 * GET /api/v1/companies
 * 
 * Public/Authorized REST API for the external Student Website to fetch
 * all company listings, positions, and company addresses for students to view.
 * 
 * Header:
 *   Authorization: Bearer <STUDENT_WEB_API_TOKEN>
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<CompaniesApiResponse | ApiErrorResponse>> {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const province = searchParams.get("province")?.trim() || "";

    const whereClause: {
      province?: string;
      OR?: Array<{
        name?: { contains: string };
        position?: { contains: string };
      }>;
    } = {};

    if (province) {
      whereClause.province = province;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { position: { contains: search } },
      ];
    }

    const companies = await prisma.company.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });

    const data: CompanyApiItem[] = companies.map((c) => ({
      id: c.id,
      name: c.name,
      province: c.province,
      position: c.position,
      address: c.address,
      detail: c.detail,
      updatedAt: c.updatedAt.toISOString(),
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
