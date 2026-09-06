"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { THAI_PROVINCES } from "@/lib/provinces";

interface ExistingCompanyData {
  id?: string;
  name: string;
  province: string;
  position: string;
  address: string;
  detail: string | null;
}

interface CompanyFormProps {
  initialData?: ExistingCompanyData;
  isEdit?: boolean;
}

interface FormState {
  name: string;
  province: string;
  position: string;
  address: string;
  detail: string;
}

export function CompanyForm({ initialData, isEdit = false }: CompanyFormProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormState>({
    name: initialData?.name ?? "",
    province: initialData?.province ?? "กรุงเทพมหานคร",
    position: initialData?.position ?? "",
    address: initialData?.address ?? "",
    detail: initialData?.detail ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMsg(null);

    if (
      !formData.name.trim() ||
      !formData.province.trim() ||
      !formData.position.trim() ||
      !formData.address.trim()
    ) {
      setErrorMsg("กรุณากรอกข้อมูลในช่องที่มีเครื่องหมายดอกจัน (*) ให้ครบถ้วน");
      return;
    }

    startTransition(async () => {
      try {
        const url = isEdit && initialData?.id
          ? `/api/companies/${initialData.id}`
          : "/api/companies";
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data: unknown = await res.json();

        if (!res.ok) {
          const errData = data as { error?: string };
          setErrorMsg(errData.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
          return;
        }

        router.push("/companies");
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ";
        setErrorMsg(message);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Card */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
            {isEdit ? "แก้ไขข้อมูลบริษัท" : "กรอกข้อมูลบริษัทใหม่ (5 รายการ)"}
          </h2>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
              <strong>แจ้งเตือน:</strong> {errorMsg}
            </div>
          )}

          {/* 2.1 ชื่อบริษัท */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">
              2.1 ชื่อบริษัท (Company Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="เช่น บริษัท สยามเทคโนโลยี จำกัด (มหาชน)"
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 2.2 จังหวัดของบริษัท */}
          <div>
            <label htmlFor="province" className="block text-sm font-semibold text-slate-700 mb-1">
              2.2 จังหวัดของบริษัท (Province) <span className="text-red-500">*</span>
            </label>
            <select
              id="province"
              name="province"
              required
              value={formData.province}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 bg-white focus:outline-none focus:border-blue-500"
            >
              {THAI_PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* 2.3 ตำแหน่ง */}
          <div>
            <label htmlFor="position" className="block text-sm font-semibold text-slate-700 mb-1">
              2.3 ตำแหน่ง (Positions) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="position"
              name="position"
              required
              value={formData.position}
              onChange={handleChange}
              placeholder="เช่น Software Engineer, Frontend Developer, Data Analyst"
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              ระบุตำแหน่งที่บริษัทนี้เคยเปิดรับ หรือที่รุ่นพี่เคยยื่นฝึกงาน
            </p>
          </div>

          {/* 2.4 ที่อยู่ของบริษัท */}
          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-1">
              2.4 ที่อยู่ของบริษัท (Company Address) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="เลขที่ อาคาร ถนน แขวง/ตำบล เขต/อำเภอ รหัสไปรษณีย์"
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 2.5 detail */}
          <div>
            <label htmlFor="detail" className="block text-sm font-semibold text-slate-700 mb-1">
              2.5 รายละเอียดเพิ่มเติม (Detail)
            </label>
            <textarea
              id="detail"
              name="detail"
              rows={4}
              value={formData.detail}
              onChange={handleChange}
              placeholder="เช่น มีเบี้ยเลี้ยง, ทำงานแบบ On-site / Remote, สวัสดิการ, ข้อมูลติดต่อฝ่ายบุคคล"
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <Link
              href="/companies"
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
            >
              {isPending ? "กำลังบันทึก..." : isEdit ? "อัปเดตข้อมูลบริษัท" : "บันทึกข้อมูลบริษัท"}
            </button>
          </div>
        </form>
      </div>

      {/* Live API Preview */}
      <div className="space-y-4">
        <div className="bg-slate-900 text-slate-200 rounded-xl p-5 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span className="text-xs font-mono font-semibold text-slate-300">
                REST API Live Preview
              </span>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              GET /api/v1/companies
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-2">
            ข้อมูลที่ระบบจะส่งต่อไปยังเว็บนิสิตเพื่อให้นิสิตดู:
          </p>
          <pre className="text-xs font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto text-emerald-400 leading-relaxed">
{JSON.stringify(
  {
    name: formData.name || "<ยังไม่ระบุ>",
    province: formData.province,
    position: formData.position || "<ยังไม่ระบุ>",
    address: formData.address || "<ยังไม่ระบุ>",
    detail: formData.detail || null,
  },
  null,
  2
)}
          </pre>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
          <p className="font-semibold">&#128161; คำแนะนำ:</p>
          <p>
            อาจารย์สามารถเพิ่มข้อมูลบริษัทไว้ได้เรื่อย ๆ ข้อมูลทั้งหมดจะถูกส่งไปแสดงเป็นรายการในเว็บนิสิตทันที
          </p>
        </div>
      </div>
    </div>
  );
}
