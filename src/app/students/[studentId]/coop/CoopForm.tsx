"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { THAI_PROVINCES } from "@/lib/provinces";

interface ExistingCoopData {
  companyName: string;
  companyProvince: string;
  jobPosition: string;
  companyAddress: string;
  detail: string | null;
}

interface CoopFormProps {
  studentId: string;
  tempPassword: string | null;
  existingData: ExistingCoopData | null;
}

interface FormFields {
  companyName: string;
  companyProvince: string;
  jobPosition: string;
  companyAddress: string;
  detail: string;
}

interface ApiResponseSuccess {
  success: true;
  data: ExistingCoopData & { id: string; studentId: string; updatedAt: string };
}

interface ApiResponseError {
  error: string;
  code: string;
}

export function CoopForm({
  studentId,
  tempPassword,
  existingData,
}: CoopFormProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormFields>({
    companyName: existingData?.companyName ?? "",
    companyProvince: existingData?.companyProvince ?? "กรุงเทพมหานคร",
    jobPosition: existingData?.jobPosition ?? "",
    companyAddress: existingData?.companyAddress ?? "",
    detail: existingData?.detail ?? "",
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
    setSuccessMsg(null);
    setErrorMsg(null);

    // Basic front-end guard
    if (
      !formData.companyName.trim() ||
      !formData.companyProvince.trim() ||
      !formData.jobPosition.trim() ||
      !formData.companyAddress.trim()
    ) {
      setErrorMsg("กรุณากรอกข้อมูลในช่องที่มีเครื่องหมายดอกจัน (*) ให้ครบถ้วน");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/students/${studentId}/coop`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data: unknown = await res.json();

        if (!res.ok) {
          const errData = data as ApiResponseError;
          setErrorMsg(errData.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
          return;
        }

        setSuccessMsg("บันทึกข้อมูลฝึกสหกิจศึกษาเรียบร้อยแล้ว ข้อมูลพร้อมส่งต่อไปยังเว็บนิสิตทันที");
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ";
        setErrorMsg(message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-blue-400">
            ข้อมูลนิสิตวิทยาการคอมพิวเตอร์
          </span>
          <h2 className="text-2xl font-bold font-mono tracking-tight mt-0.5">
            รหัสนิสิต: {studentId}
          </h2>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-xs">
          <span className="text-slate-400 block">รหัสผ่านชั่วคราวสำหรับนิสิต:</span>
          <span className="font-mono text-emerald-400 font-bold text-sm tracking-wider">
            {tempPassword ?? "ไม่พบรหัสผ่าน"}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold">&#10003;</span>
            <span>{successMsg}</span>
          </div>
          <Link
            href="/students"
            className="text-xs font-semibold underline hover:text-emerald-900"
          >
            กลับไปหน้ารายชื่อ
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          <strong>แจ้งเตือน:</strong> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
              แบบฟอร์มข้อมูลการฝึกสหกิจศึกษา (5 รายการ)
            </h3>

            {/* 2.1 ชื่อบริษัท */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                2.1 ชื่อบริษัท (Company Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="เช่น บริษัท สยามเทคโนโลยี จำกัด (มหาชน)"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 2.2 จังหวัดของบริษัท */}
            <div>
              <label
                htmlFor="companyProvince"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                2.2 จังหวัดของบริษัท (Province) <span className="text-red-500">*</span>
              </label>
              <select
                id="companyProvince"
                name="companyProvince"
                required
                value={formData.companyProvince}
                onChange={handleChange}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
              <label
                htmlFor="jobPosition"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                2.3 ตำแหน่ง (Position) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="jobPosition"
                name="jobPosition"
                required
                value={formData.jobPosition}
                onChange={handleChange}
                placeholder="เช่น Software Engineer, Frontend Developer, Data Analyst"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 2.4 ที่อยู่ของบริษัท */}
            <div>
              <label
                htmlFor="companyAddress"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                2.4 ที่อยู่ของบริษัท (Company Address) <span className="text-red-500">*</span>
              </label>
              <textarea
                id="companyAddress"
                name="companyAddress"
                required
                rows={3}
                value={formData.companyAddress}
                onChange={handleChange}
                placeholder="เลขที่ อาคาร ถนน แขวง/ตำบล เขต/อำเภอ รหัสไปรษณีย์"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 2.5 detail */}
            <div>
              <label
                htmlFor="detail"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                2.5 รายละเอียดเพิ่มเติม (Detail)
              </label>
              <textarea
                id="detail"
                name="detail"
                rows={4}
                value={formData.detail}
                onChange={handleChange}
                placeholder="เช่น ผลการสัมภาษณ์, วันที่เริ่มฝึกงาน, หัวหน้างานที่ดูแล, สวัสดิการ, หรือข้อกำหนดเฉพาะ"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <Link
                href="/students"
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
              >
                {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูลการฝึกงาน"}
              </button>
            </div>
          </form>
        </div>

        {/* API Output Live Preview for Student Web */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-slate-200 rounded-xl p-5 shadow-sm border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span className="text-xs font-mono font-semibold text-slate-300">
                  REST API Preview
                </span>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                GET /api/v1/students/{studentId}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              ตัวอย่าง JSON ที่เว็บของนิสิตจะได้รับเมื่อยิง API มาขอข้อมูล:
            </p>
            <pre className="text-xs font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto text-emerald-400 leading-relaxed">
{JSON.stringify(
  {
    success: true,
    data: {
      studentId: studentId,
      companyName: formData.companyName || "<ยังไม่ระบุ>",
      companyProvince: formData.companyProvince,
      jobPosition: formData.jobPosition || "<ยังไม่ระบุ>",
      companyAddress: formData.companyAddress || "<ยังไม่ระบุ>",
      detail: formData.detail || null,
      updatedAt: new Date().toISOString(),
    },
  },
  null,
  2
)}
            </pre>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
            <p className="font-semibold">&#128161; คำแนะนำสำหรับอาจารย์:</p>
            <p>
              เมื่ออาจารย์บันทึกข้อมูลแล้ว เว็บไซต์นิสิตสามารถดึงข้อมูลผ่าน REST API ไปแสดงผลให้นิสิตดูได้ทันทีโดยอัตโนมัติ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
