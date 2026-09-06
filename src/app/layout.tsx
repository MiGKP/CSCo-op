import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import React from "react";
import { Navbar } from "./Navbar";
import { verifyInstructorSessionToken } from "@/lib/instructor-auth";

export const metadata: Metadata = {
  title: "ระบบอาจารย์ - จัดการข้อมูลฝึกงานและรหัสนิสิต (CS Co-op Portal)",
  description: "ระบบสำหรับอาจารย์: สร้างบัญชีรหัสนิสิต และกรอกข้อมูลบริษัท/ตำแหน่งที่รุ่นพี่เคยยื่น เพื่อส่งต่อไปยังเว็บนิสิต",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({
  children,
}: RootLayoutProps): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("instructor_session")?.value;
  const session = await verifyInstructorSessionToken(sessionToken);

  return (
    <html lang="th">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <Navbar
          isLoggedIn={session.valid}
          username={session.username}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          CS Co-op Instructor Portal &bull; สำหรับอาจารย์ภาควิชาวิทยาการคอมพิวเตอร์
        </footer>
      </body>
    </html>
  );
}
