import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StudentTable, StudentListItem } from "./StudentTable";

export const dynamic = "force-dynamic";

export default async function StudentsPage(): Promise<React.JSX.Element> {
  const records = await prisma.student.findMany({
    orderBy: {
      studentId: "asc",
    },
  });

  const students: StudentListItem[] = records.map((s) => ({
    id: s.id,
    studentId: s.studentId,
    tempPassword: s.tempPassword,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            บัญชีผู้ใช้นิสิต (User & Password)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            รายชื่อบัญชีนิสิตและรหัสผ่านแบบสุ่ม สำหรับแจกจ่ายให้นิสิตใช้ล็อกอินเข้าระบบดูข้อมูลบริษัท
          </p>
        </div>
        <Link
          href="/students/import"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors self-start sm:self-auto"
        >
          + นำเข้านิสิตและสุ่มรหัสผ่าน
        </Link>
      </div>

      <StudentTable initialStudents={students} />
    </div>
  );
}
