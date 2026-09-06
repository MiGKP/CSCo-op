"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { parseAndValidateStudentIds } from "@/lib/validators";

interface CreatedStudent {
  studentId: string;
  tempPassword: string;
}

interface ImportApiSuccessResponse {
  success: true;
  totalImported: number;
  created: CreatedStudent[];
  skipped: string[];
  invalid: string[];
}

interface ImportApiErrorResponse {
  error: string;
  code: string;
}

export default function StudentImportPage(): React.JSX.Element {
  const [inputText, setInputText] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<ImportApiSuccessResponse | null>(null);

  // Parse preview on the fly
  const preview = parseAndValidateStudentIds(inputText);

  const handleInsertSample = (): void => {
    setInputText("66011212222\n66011212223\n66011212224\n66011212225");
  };

  const handleImportSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMsg(null);

    if (preview.validIds.length === 0) {
      setErrorMsg("กรุณาระบุรหัสนิสิตที่ถูกต้องอย่างน้อย 1 รายการ (ตัวเลข 8-15 หลัก เช่น 66011212222)");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/students/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rawInput: inputText }),
        });

        const data: unknown = await response.json();

        if (!response.ok) {
          const errData = data as ImportApiErrorResponse;
          setErrorMsg(errData.error || "เกิดข้อผิดพลาดในการนำเข้า");
          return;
        }

        const successData = data as ImportApiSuccessResponse;
        setImportResult(successData);
        setInputText("");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ";
        setErrorMsg(message);
      }
    });
  };

  const copyCredentials = (): void => {
    if (!importResult || importResult.created.length === 0) return;

    const text = importResult.created
      .map((item) => `รหัสนิสิต: ${item.studentId}\tรหัสผ่าน: ${item.tempPassword}`)
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const downloadCsv = (): void => {
    if (!importResult || importResult.created.length === 0) return;

    const headers = "Student ID,Temporary Password\n";
    const rows = importResult.created
      .map((item) => `"${item.studentId}","${item.tempPassword}"`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `coop_students_credentials_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            นำเข้านิสิตเข้าระบบฝึกสหกิจศึกษา
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            พิมพ์หรือวางรหัสนิสิต (ตัวเลข เช่น 66011212222) ระบบจะทำการสุ่มรหัสผ่าน (Random Password) ให้อัตโนมัติ
          </p>
        </div>
        <Link
          href="/students"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          &larr; กลับไปหน้ารายชื่อนิสิต
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <strong>แจ้งเตือน:</strong> {errorMsg}
        </div>
      )}

      {/* Input Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleImportSubmit} className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="studentInput" className="block text-sm font-semibold text-slate-700">
              รหัสนิสิต (Student IDs)
            </label>
            <button
              type="button"
              onClick={handleInsertSample}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              + ใส่ตัวอย่างข้อมูล
            </button>
          </div>

          <textarea
            id="studentInput"
            rows={6}
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
            placeholder="เช่น&#10;66011212222&#10;66011212223&#10;66011212224"
            className="w-full rounded-lg border border-slate-300 p-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />

          {inputText.trim().length > 0 && (
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="text-emerald-700 font-medium">
                &#10003; ตรวจพบรหัสนิสิตถูกต้อง: {preview.validIds.length} รหัส
              </span>
              {preview.invalidLines.length > 0 && (
                <span className="text-amber-700 font-medium">
                  &#9888; รูปแบบไม่ถูกต้อง (ข้าม): {preview.invalidLines.length} รายการ ({preview.invalidLines.slice(0, 3).join(", ")}...)
                </span>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isPending || preview.validIds.length === 0}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center space-x-2"
            >
              {isPending ? (
                <span>กำลังนำเข้าและสร้างรหัสผ่าน...</span>
              ) : (
                <span>นำเข้า {preview.validIds.length > 0 ? `${preview.validIds.length} คน` : ""} & สุ่มรหัสผ่าน</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Import Result Card */}
      {importResult && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                นำเข้าสำเร็จ
              </span>
              <h2 className="text-lg font-bold text-slate-800 mt-1">
                สร้างข้อมูลนิสิตใหม่จำนวน {importResult.totalImported} คน
              </h2>
            </div>
            {importResult.created.length > 0 && (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={copyCredentials}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  {copied ? "คัดลอกแล้ว!" : "คัดลอกทั้งหมด"}
                </button>
                <button
                  type="button"
                  onClick={downloadCsv}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
                >
                  ดาวน์โหลด CSV
                </button>
              </div>
            )}
          </div>

          {importResult.skipped.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>มีรหัสนิสิตที่มีในระบบอยู่แล้ว (ข้ามการสร้างใหม่):</strong>{" "}
              {importResult.skipped.join(", ")}
            </div>
          )}

          {importResult.created.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">ลำดับ</th>
                    <th className="py-2.5 px-4">รหัสนิสิต</th>
                    <th className="py-2.5 px-4">รหัสผ่านที่สุ่มได้ (Random Password)</th>
                    <th className="py-2.5 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {importResult.created.map((item, index) => (
                    <tr key={item.studentId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 text-slate-400 font-sans">{index + 1}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{item.studentId}</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-bold tracking-wider">
                        {item.tempPassword}
                      </td>
                      <td className="py-2.5 px-4 text-right font-sans">
                        <Link
                          href={`/students/${item.studentId}/coop`}
                          className="inline-block px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-medium"
                        >
                          กรอกข้อมูลฝึกงาน &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">ไม่มีนิสิตใหม่ที่ถูกนำเข้า</p>
          )}

          <div className="pt-2 flex justify-between items-center text-sm">
            <span className="text-slate-500">
              * รหัสผ่านนี้สามารถนำไปแจกจ่ายให้นิสิตใช้ล็อกอินในระบบของนิสิตได้
            </span>
            <Link
              href="/students"
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium text-xs transition-colors"
            >
              ดูรายชื่อนิสิตทั้งหมด &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
