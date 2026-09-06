import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface DashboardStats {
  totalStudents: number;
  completedCoop: number;
  pendingCoop: number;
}

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const [totalStudents, completedCoop] = await Promise.all([
    prisma.student.count(),
    prisma.coopRecord.count(),
  ]);

  const stats: DashboardStats = {
    totalStudents,
    completedCoop,
    pendingCoop: Math.max(0, totalStudents - completedCoop),
  };

  const completionPercentage =
    stats.totalStudents > 0
      ? Math.round((stats.completedCoop / stats.totalStudents) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800 inline-block mb-3">
            ภาควิชาวิทยาการคอมพิวเตอร์ &bull; ระบบอาจารย์
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            ระบบจัดการข้อมูลการฝึกสหกิจศึกษา
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            อาจารย์สามารถนำเข้ารหัสนิสิตพร้อมสร้างรหัสผ่านแบบสุ่มอัตโนมัติ กรอกข้อมูลสถานประกอบการ
            และส่งต่อข้อมูลไปยังเว็บไซต์สำหรับนิสิตผ่าน REST API โดยอัตโนมัติ
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/students/import"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              + นำเข้านิสิตและสุ่มรหัสผ่าน
            </Link>
            <Link
              href="/students"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-colors border border-white/20"
            >
              รายชื่อนิสิตทั้งหมด ({stats.totalStudents})
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">จำนวนนิสิตทั้งหมดที่นำเข้า</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            {stats.totalStudents} <span className="text-sm font-normal text-slate-500">คน</span>
          </p>
          <div className="mt-3 text-xs text-blue-600 font-medium">
            <Link href="/students/import">+ นำเข้านิสิตเพิ่มเติม &rarr;</Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">กรอกข้อมูลฝึกงานครบถ้วนแล้ว</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2 font-mono">
            {stats.completedCoop} <span className="text-sm font-normal text-slate-500">คน</span>
          </p>
          <div className="mt-3 text-xs text-slate-500">
            คิดเป็น {completionPercentage}% ของนิสิตทั้งหมด
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">รออาจารย์กรอกข้อมูล</p>
          <p className="text-3xl font-extrabold text-amber-600 mt-2 font-mono">
            {stats.pendingCoop} <span className="text-sm font-normal text-slate-500">คน</span>
          </p>
          <div className="mt-3 text-xs text-amber-700 font-medium">
            <Link href="/students">คลิกเพื่อกรอกข้อมูล &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Feature Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workflow Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <span>ขั้นตอนการใช้งานสำหรับอาจารย์</span>
          </h2>
          <ol className="space-y-3 text-sm text-slate-600 list-decimal list-inside">
            <li className="leading-relaxed">
              <strong className="text-slate-800">นำเข้ารหัสนิสิต:</strong> พิมพ์หรือวางรหัสนิสิต (เช่น 66011212222) ระบบจะสร้างรหัสผ่านแบบสุ่มอัตโนมัติ และดาวน์โหลดรหัสผ่านเพื่อแจกจ่ายนิสิตได้
            </li>
            <li className="leading-relaxed">
              <strong className="text-slate-800">กรอกข้อมูล 5 รายการ:</strong> บันทึกชื่อบริษัท, จังหวัด, ตำแหน่ง, ที่อยู่บริษัท และรายละเอียดเพิ่มเติม
            </li>
            <li className="leading-relaxed">
              <strong className="text-slate-800">ส่งต่อข้อมูลไปเว็บนิสิต:</strong> ระบบเปิด REST API ให้นำไปใช้งานได้ทันที มีการยืนยันสิทธิ์ด้วย Bearer Token ปลอดภัย
            </li>
          </ol>
        </div>

        {/* API Integration Card for External Student Web */}
        <div className="bg-slate-900 text-slate-200 rounded-xl p-6 shadow-sm border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>ข้อมูลสำหรับเชื่อมต่อกับเว็บนิสิต (REST API)</span>
            </h2>
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              API Active
            </span>
          </div>
          <p className="text-xs text-slate-400">
            ทีมผู้พัฒนาเว็บนิสิตสามารถดึงข้อมูลฝึกงานของนิสิตแต่ละคนได้ผ่าน Endpoint ดังนี้:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-emerald-400 space-y-1 overflow-x-auto">
            <p className="text-slate-500">// Header ที่ต้องส่ง</p>
            <p className="text-white">Authorization: Bearer &lt;STUDENT_WEB_API_TOKEN&gt;</p>
            <p className="text-slate-500 pt-2">// Endpoint ดึงข้อมูลนิสิตรายคน</p>
            <p className="text-blue-400">GET /api/v1/students/:studentId</p>
            <p className="text-slate-500 pt-2">// ตัวอย่าง Response ที่จะได้รับ</p>
            <p className="text-slate-400 leading-relaxed">
              &#123; &quot;success&quot;: true, &quot;data&quot;: &#123; &quot;companyName&quot;: &quot;...&quot;, &quot;jobPosition&quot;: &quot;...&quot; &#125; &#125;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
