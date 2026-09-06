import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyBearerToken } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/v1/companies/[id]
 * 
 * Fetches a single company detail for external student web.
 * 
 * Header:
 *   Authorization: Bearer <STUDENT_WEB_API_TOKEN>
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse> {
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

    const { id } = await context.params;

    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: "Company not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: company.id,
          name: company.name,
          province: company.province,
          position: company.position,
          address: company.address,
          detail: company.detail,
          updatedAt: company.updatedAt.toISOString(),
        },
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
