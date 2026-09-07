import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { ApiDocs } from "./ApiDocs";

export default function ApiDocsPage(): React.JSX.Element {
  const apiToken =
    process.env.STUDENT_WEB_API_TOKEN ?? "coop_secret_token_2026_student_portal";

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="สำหรับเว็บนิสิต"
        title="เอกสาร API"
        description="วิธียืนยันตัวตนและดึงข้อมูลบริษัทจากระบบอาจารย์ เพื่อนำไปแสดงบนเว็บฝั่งนิสิต โดยไม่ต้องคัดลอกข้อมูลซ้ำ"
      />
      <ApiDocs apiToken={apiToken} />
    </div>
  );
}
