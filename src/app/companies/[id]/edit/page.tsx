import React from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { IconArrowLeft } from "@/components/icons";
import { LinkButton } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { CompanyForm } from "../../CompanyForm";

export const dynamic = "force-dynamic";

interface EditCompanyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCompanyPage({
  params,
}: EditCompanyPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
  });

  if (!company) {
    notFound();
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="แก้ไขรายการ"
        title="แก้ไขข้อมูลบริษัท"
        description={`อัปเดตข้อมูลของ ${company.name}`}
        actions={
          <LinkButton href="/companies" icon={<IconArrowLeft />}>
            กลับไปรายการบริษัท
          </LinkButton>
        }
      />

      <CompanyForm
        isEdit
        initialData={{
          id: company.id,
          name: company.name,
          province: company.province,
          position: company.position,
          address: company.address,
          detail: company.detail,
        }}
      />
    </div>
  );
}
