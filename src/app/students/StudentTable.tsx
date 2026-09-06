"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface StudentListItem {
  id: string;
  studentId: string;
  tempPassword: string | null;
  createdAt: string;
}

interface StudentTableProps {
  initialStudents: StudentListItem[];
}

export function StudentTable({ initialStudents }: StudentTableProps): React.JSX.Element {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [students, setStudents] = useState<StudentListItem[]>(initialStudents);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [revealPasswords, setRevealPasswords] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredStudents = students.filter((item) =>
    item.studentId.includes(searchTerm)
  );

  const handleDelete = async (studentId: string): Promise<void> => {
    if (!window.confirm(`ต้องการลบบัญชีนิสิต ${studentId} ใช่หรือไม่?`)) {
      return;
    }

    setDeletingId(studentId);
    try {
      const res = await fetch(`/api/internal/students/${studentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.studentId !== studentId));
        router.refresh();
      } else {
        const data: unknown = await res.json();
        const errObj = data as { error?: string };
        alert(errObj.error || "เกิดข้อผิดพลาดในการลบ");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopySingle = (studentId: string, pass: string | null): void => {
    if (!pass) return;
    navigator.clipboard.writeText(`User: ${studentId}\nPassword: ${pass}`).then(() => {
      setCopiedId(studentId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleExportCsv = (): void => {
    if (filteredStudents.length === 0) return;

    const headers = "Student ID,Password,Created At\n";
    const rows = filteredStudents
      .map((s) => `"${s.studentId}","${s.tempPassword ?? ""}","${s.createdAt}"`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `coop_student_accounts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="ค้นหารหัสนิสิต..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRevealPasswords((prev) => !prev)}
            className="px-3 py-2 text-xs font-medium border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
          >
            {revealPasswords ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
          >
            ดาวน์โหลด CSV
          </button>

          <Link
            href="/students/import"
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            + นำเข้านิสิตและสุ่มรหัสผ่าน
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-medium">ยังไม่มีบัญชีนิสิตในระบบ</p>
            <p className="text-sm mt-1">
              {students.length === 0
                ? "นำเข้านิสิตโดยใส่รหัสนิสิต ระบบจะสุ่ม Password ให้อัตโนมัติ"
                : "ไม่พบรหัสนิสิตที่ตรงกับการค้นหา"}
            </p>
            {students.length === 0 && (
              <Link
                href="/students/import"
                className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
              >
                + นำเข้านิสิตคนแรก
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ลำดับ</th>
                  <th className="py-3 px-4">รหัสนิสิต (User)</th>
                  <th className="py-3 px-4">รหัสผ่านที่สุ่มได้ (Password)</th>
                  <th className="py-3 px-4">วันที่นำเข้า</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-sans">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-base">
                      {student.studentId}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {student.tempPassword ? (
                        revealPasswords ? (
                          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold tracking-wider">
                            {student.tempPassword}
                          </span>
                        ) : (
                          <span className="text-slate-400">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span>
                        )
                      ) : (
                        <span className="text-slate-400 italic font-sans text-xs">เข้ารหัสแล้ว</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-sans text-xs">
                      {new Date(student.createdAt).toLocaleDateString("th-TH")}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 font-sans">
                      <button
                        type="button"
                        onClick={() => handleCopySingle(student.studentId, student.tempPassword)}
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                      >
                        {copiedId === student.studentId ? "คัดลอกแล้ว!" : "คัดลอก"}
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === student.studentId}
                        onClick={() => handleDelete(student.studentId)}
                        className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      >
                        {deletingId === student.studentId ? "..." : "ลบ"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
