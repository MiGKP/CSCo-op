import { NextResponse } from "next/server";

interface LogoutResponse {
  success: true;
  message: string;
}

export async function POST(): Promise<NextResponse<LogoutResponse>> {
  const response = NextResponse.json<LogoutResponse>({
    success: true,
    message: "ออกจากระบบสำเร็จ",
  });

  response.cookies.set({
    name: "instructor_session",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
