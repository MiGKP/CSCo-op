import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { IconUpload } from "@/components/icons";
import { LinkButton } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { StudentTable, type StudentListItem } from "./StudentTable";

export const dynamic = "force-dynamic";

export default async function StudentsPage(): Promise<React.JSX.Element> {
  const records = await prisma.student.findMany({
    orderBy: {
      studentId: "asc",
    },
  });

  const students: StudentListItem[] = records.map((student) => ({
    id: student.id,
    studentId: student.studentId,
    tempPassword: student.tempPassword,
    createdAt: student.createdAt.toISOString(),
  }));

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="บัญชีเข้าใช้งาน"
        title="บัญชีนิสิต"
        description="จัดการ User และ Password สำหรับให้นิสิตเข้าสู่ระบบดูข้อมูลบริษัท"
        actions={
          <LinkButton
            href="/students/import"
            variant="primary"
            icon={<IconUpload />}
          >
            นำเข้านิสิต
          </LinkButton>
        }
      />

      <StudentTable initialStudents={students} />
    </div>
  );
}
