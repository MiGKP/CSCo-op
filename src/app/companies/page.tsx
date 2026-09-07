import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { IconPlus } from "@/components/icons";
import { LinkButton } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { CompanyTable, type CompanyListItem } from "./CompanyTable";

export const dynamic = "force-dynamic";

export default async function CompaniesPage(): Promise<React.JSX.Element> {
  const records = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
  });

  const companies: CompanyListItem[] = records.map((company) => ({
    id: company.id,
    name: company.name,
    province: company.province,
    position: company.position,
    address: company.address,
    detail: company.detail,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  }));

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="รายการกลาง"
        title="ข้อมูลบริษัท"
        description="จัดการรายชื่อบริษัท ตำแหน่งที่เคยเปิดรับ และข้อมูลที่ส่งต่อให้นิสิตใช้ค้นคว้า"
        actions={
          <LinkButton href="/companies/new" variant="primary" icon={<IconPlus />}>
            เพิ่มบริษัท
          </LinkButton>
        }
      />

      <CompanyTable initialCompanies={companies} />
    </div>
  );
}
