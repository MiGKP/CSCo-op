import React from "react";
import { prisma } from "@/lib/prisma";
import { StudentTable, StudentListItem } from "./StudentTable";

// Revalidate on request to reflect immediate database updates
export const dynamic = "force-dynamic";

export default async function StudentsPage(): Promise<React.JSX.Element> {
  const records = await prisma.student.findMany({
    include: {
      coopRecord: true,
    },
    orderBy: {
      studentId: "asc",
    },
  });

  const students: StudentListItem[] = records.map((s) => ({
    id: s.id,
    studentId: s.studentId,
    tempPassword: s.tempPassword,
    createdAt: s.createdAt.toISOString(),
    coopRecord: s.coopRecord
      ? {
          companyName: s.coopRecord.companyName,
          companyProvince: s.coopRecord.companyProvince,
          jobPosition: s.coopRecord.jobPosition,
          companyAddress: s.coopRecord.companyAddress,
          detail: s.coopRecord.detail,
        }
      : null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            รายชื่อนิสิตและสถานะการฝึกสหกิจศึกษา
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            จัดการรหัสนิสิต ตรวจสอบรหัสผ่าน และกรอกข้อมูลสถานประกอบการที่นิสิตไปฝึกงาน
          </p>
        </div>
      </div>

      <StudentTable initialStudents={students} />
    </div>
  );
}
