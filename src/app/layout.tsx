import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "ระบบอาจารย์ - จัดการข้อมูลฝึกงานและรหัสนิสิต (CS Co-op Portal)",
  description: "ระบบสำหรับอาจารย์: สร้างบัญชีรหัสนิสิต และกรอกข้อมูลบริษัท/ตำแหน่งที่รุ่นพี่เคยยื่น เพื่อส่งต่อไปยังเว็บนิสิต",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="th">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <header className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-xl font-bold tracking-tight hover:text-blue-100">
                CS Co-op Portal
              </Link>
              <span className="text-xs bg-blue-700 text-blue-100 px-2 py-0.5 rounded font-mono">
                อาจารย์
              </span>
            </div>
            <nav className="flex items-center space-x-1 sm:space-x-3 text-sm font-medium">
              <Link
                href="/"
                className="px-3 py-2 rounded-md hover:bg-blue-800 transition-colors"
              >
                หน้าหลัก
              </Link>
              <Link
                href="/companies"
                className="px-3 py-2 rounded-md hover:bg-blue-800 transition-colors"
              >
                รายการบริษัท
              </Link>
              <Link
                href="/companies/new"
                className="px-3 py-2 rounded-md bg-blue-800 hover:bg-blue-700 transition-colors"
              >
                + เพิ่มบริษัท
              </Link>
              <Link
                href="/students"
                className="px-3 py-2 rounded-md hover:bg-blue-800 transition-colors"
              >
                บัญชีนิสิต
              </Link>
              <Link
                href="/students/import"
                className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                + นำเข้านิสิต
              </Link>
            </nav>
          </div>
        </header>

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
