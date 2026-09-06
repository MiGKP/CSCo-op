import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const [totalStudents, totalCompanies] = await Promise.all([
    prisma.student.count(),
    prisma.company.count(),
  ]);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800 inline-block mb-3">
            ภาควิชาวิทยาการคอมพิวเตอร์ &bull; ระบบอาจารย์
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            ระบบจัดการข้อมูลการฝึกงานและบัญชีนิสิต
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            ระบบสำหรับอาจารย์เพื่อสร้าง User & Password ให้นิสิตใช้ล็อกอิน และรวบรวมลิสต์ข้อมูลบริษัท/ตำแหน่งที่รุ่นพี่เคยยื่นไป เพื่อส่งต่อข้อมูลไปยังเว็บไซต์ของนิสิตโดยเฉพาะ
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/companies/new"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              + เพิ่มข้อมูลบริษัท
            </Link>
            <Link
              href="/students/import"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              + นำเข้านิสิตและสุ่มรหัสผ่าน
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              บริษัทในระบบ (สำหรับนิสิตดู)
            </p>
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
              Company Directory
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3 font-mono">
            {totalCompanies} <span className="text-sm font-normal text-slate-500">บริษัท</span>
          </p>
          <div className="mt-4 flex space-x-3 text-xs font-medium">
            <Link href="/companies" className="text-blue-600 hover:underline">
              ดูรายการบริษัททั้งหมด &rarr;
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/companies/new" className="text-blue-600 hover:underline">
              + เพิ่มบริษัทใหม่
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              บัญชีนิสิตในระบบ (User & Pass)
            </p>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
              Student Accounts
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3 font-mono">
            {totalStudents} <span className="text-sm font-normal text-slate-500">คน</span>
          </p>
          <div className="mt-4 flex space-x-3 text-xs font-medium">
            <Link href="/students" className="text-emerald-700 hover:underline">
              ดูรายชื่อ & รหัสผ่าน &rarr;
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/students/import" className="text-emerald-700 hover:underline">
              + นำเข้านิสิตเพิ่ม
            </Link>
          </div>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workflow */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">
            2 หน้าที่หลักของอาจารย์ในระบบนี้
          </h2>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex space-x-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </span>
              <div>
                <strong className="text-slate-900 block">สร้าง User & Password ให้นิสิต</strong>
                <p className="text-xs text-slate-500 mt-0.5">
                  พิมพ์รหัสนิสิต (เช่น 66011212222) ระบบจะสุ่ม Password ให้อัตโนมัติ สามารถดาวน์โหลด CSV หรือคัดลอกไปแจกจ่ายให้นิสิตใช้ล็อกอิน
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </span>
              <div>
                <strong className="text-slate-900 block">ลิสต์ข้อมูลบริษัท 5 รายการ</strong>
                <p className="text-xs text-slate-500 mt-0.5">
                  กรอกชื่อบริษัท, จังหวัด, ตำแหน่งที่เคยเปิดรับหรือรุ่นพี่เคยยื่น, ที่อยู่บริษัท และรายละเอียดเพิ่มเติม เพื่อให้นิสิตเข้าไปดูเป็นแนวทาง
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* REST API Specs for Student Web */}
        <div className="bg-slate-900 text-slate-200 rounded-xl p-6 shadow-sm border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              REST API สำหรับส่งต่อให้เว็บนิสิต
            </h2>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              Ready
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Header: <code className="text-amber-300">Authorization: Bearer &lt;STUDENT_WEB_API_TOKEN&gt;</code>
          </p>
          <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs space-y-2 text-slate-300 overflow-x-auto">
            <div>
              <p className="text-slate-500">// 1. นิสิตล็อกอิน (ตรวจ User & Pass ที่อาจารย์สร้าง)</p>
              <p className="text-emerald-400 font-semibold">POST /api/v1/auth/login</p>
              <p className="text-slate-400 text-[11px]">Body: &#123; &quot;studentId&quot;: &quot;...&quot;, &quot;password&quot;: &quot;...&quot; &#125;</p>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <p className="text-slate-500">// 2. ดึงลิสต์บริษัททั้งหมดไปแสดงให้นิสิตดู</p>
              <p className="text-blue-400 font-semibold">GET /api/v1/companies</p>
              <p className="text-slate-400 text-[11px]">Params (optional): ?search=...&amp;province=...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
