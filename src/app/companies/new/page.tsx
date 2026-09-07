import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { IconArrowLeft } from "@/components/icons";
import { LinkButton } from "@/components/ui/button";
import { CompanyForm } from "../CompanyForm";

export default function NewCompanyPage(): React.JSX.Element {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="เพิ่มรายการ"
        title="เพิ่มข้อมูลบริษัท"
        description="กรอกข้อมูลที่จำเป็นสำหรับรายการบริษัทในเว็บฝั่งนิสิต"
        actions={
          <LinkButton href="/companies" icon={<IconArrowLeft />}>
            กลับไปรายการบริษัท
          </LinkButton>
        }
      />

      <CompanyForm />
    </div>
  );
}
