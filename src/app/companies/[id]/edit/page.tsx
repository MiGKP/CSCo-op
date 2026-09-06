import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            แก้ไขข้อมูลบริษัท: {company.name}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            อัปเดตข้อมูลบริษัท ตำแหน่งงาน หรือรายละเอียด
          </p>
        </div>
        <Link
          href="/companies"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          &larr; กลับไปรายการบริษัท
        </Link>
      </div>

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
