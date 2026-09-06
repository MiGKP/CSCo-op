import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CompanyTable, CompanyListItem } from "./CompanyTable";

export const dynamic = "force-dynamic";

export default async function CompaniesPage(): Promise<React.JSX.Element> {
  const records = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
  });

  const companies: CompanyListItem[] = records.map((c) => ({
    id: c.id,
    name: c.name,
    province: c.province,
    position: c.position,
    address: c.address,
    detail: c.detail,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            รายการบริษัทและตำแหน่งงาน
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            ข้อมูลบริษัทที่อาจารย์รวบรวมไว้ สำหรับส่งต่อไปแสดงผลให้นิสิตดูผ่านเว็บนิสิต
          </p>
        </div>
        <Link
          href="/companies/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors self-start sm:self-auto"
        >
          + เพิ่มข้อมูลบริษัท
        </Link>
      </div>

      <CompanyTable initialCompanies={companies} />
    </div>
  );
}
