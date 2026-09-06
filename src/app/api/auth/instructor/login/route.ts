import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  checkInstructorCredentials,
  createInstructorSessionToken,
} from "@/lib/instructor-auth";

const loginSchema = z.object({
  username: z.string().trim().min(1, { message: "กรุณาระบุชื่อผู้ใช้" }),
  password: z.string().min(1, { message: "กรุณาระบุรหัสผ่าน" }),
});

interface LoginSuccessResponse {
  success: true;
  message: string;
}

interface LoginErrorResponse {
  success: false;
  error: string;
  code: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<LoginSuccessResponse | LoginErrorResponse>> {
  try {
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

    const { username, password } = parseResult.data;

    const isValid = checkInstructorCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    const token = await createInstructorSessionToken(username);

    const response = NextResponse.json<LoginSuccessResponse>({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
    });

    response.cookies.set({
      name: "instructor_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
    return NextResponse.json(
      {
        success: false,
        error: message,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
