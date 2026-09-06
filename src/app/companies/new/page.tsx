import React from "react";
import Link from "next/link";
import { CompanyForm } from "../CompanyForm";

export default function NewCompanyPage(): React.JSX.Element {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">เพิ่มข้อมูลบริษัท</h1>
          <p className="text-sm text-slate-600 mt-1">
            ระบุข้อมูลบริษัทและตำแหน่งที่รุ่นพี่เคยยื่น เพื่อส่งต่อไปยังเว็บนิสิต
          </p>
        </div>
        <Link
          href="/companies"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          &larr; กลับไปรายการบริษัท
        </Link>
      </div>

      <CompanyForm />
    </div>
  );
}
