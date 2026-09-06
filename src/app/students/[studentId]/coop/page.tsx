import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CoopForm } from "./CoopForm";

export const dynamic = "force-dynamic";

interface CoopEntryPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function CoopEntryPage({
  params,
}: CoopEntryPageProps): Promise<React.JSX.Element> {
  const { studentId } = await params;

  const student = await prisma.student.findUnique({
    where: { studentId },
    include: { coopRecord: true },
  });

  if (!student) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2">ไม่พบข้อมูลรหัสนิสิต</h2>
        <p className="text-sm text-slate-600 mb-6">
          ไม่พบรหัสนิสิต <span className="font-mono font-bold text-slate-800">{studentId}</span> ในระบบ
        </p>
        <div className="flex justify-center space-x-3">
          <Link
            href="/students"
            className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
          >
            ดูรายชื่อทั้งหมด
          </Link>
          <Link
            href="/students/import"
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            นำเข้านิสิตคนนี้
          </Link>
        </div>
      </div>
    );
  }

  const existingData = student.coopRecord
    ? {
        companyName: student.coopRecord.companyName,
        companyProvince: student.coopRecord.companyProvince,
        jobPosition: student.coopRecord.jobPosition,
        companyAddress: student.coopRecord.companyAddress,
        detail: student.coopRecord.detail,
      }
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/students"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          &larr; กลับไปหน้ารายชื่อนิสิต
        </Link>
      </div>

      <CoopForm
        studentId={student.studentId}
        tempPassword={student.tempPassword}
        existingData={existingData}
      />
    </div>
  );
}
