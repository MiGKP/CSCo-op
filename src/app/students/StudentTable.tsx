"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface StudentListItem {
  id: string;
  studentId: string;
  tempPassword: string | null;
  createdAt: string;
  coopRecord: {
    companyName: string;
    companyProvince: string;
    jobPosition: string;
    companyAddress: string;
    detail: string | null;
  } | null;
}

interface StudentTableProps {
  initialStudents: StudentListItem[];
}

export function StudentTable({ initialStudents }: StudentTableProps): React.JSX.Element {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "FILLED" | "PENDING">("ALL");
  const [students, setStudents] = useState<StudentListItem[]>(initialStudents);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [revealPasswords, setRevealPasswords] = useState<boolean>(false);

  // Filter students by search term and co-op completion status
  const filteredStudents = students.filter((item) => {
    const matchId = item.studentId.includes(searchTerm);
    const matchCompany = item.coopRecord?.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const matchPos = item.coopRecord?.jobPosition.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const matchesSearch = matchId || matchCompany || matchPos;

    if (!matchesSearch) return false;

    if (filterStatus === "FILLED") {
      return item.coopRecord !== null;
    }
    if (filterStatus === "PENDING") {
      return item.coopRecord === null;
    }

    return true;
  });

  const handleDelete = async (studentId: string): Promise<void> => {
    if (!window.confirm(`ต้องการลบข้อมูลนิสิต ${studentId} ใช่หรือไม่?`)) {
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

  const handleExportCsv = (): void => {
    if (filteredStudents.length === 0) return;

    const headers = "Student ID,Temporary Password,Company Name,Province,Job Position,Address,Detail\n";
    const rows = filteredStudents
      .map((s) => {
        const c = s.coopRecord;
        return `"${s.studentId}","${s.tempPassword ?? ""}","${c?.companyName ?? ""}","${c?.companyProvince ?? ""}","${c?.jobPosition ?? ""}","${c?.companyAddress ?? ""}","${c?.detail ?? ""}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `coop_students_all_${Date.now()}.csv`);
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
            placeholder="ค้นหารหัสนิสิต / ชื่อบริษัท / ตำแหน่งที่เคยยื่น..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFilterStatus(e.target.value as "ALL" | "FILLED" | "PENDING")
            }
            className="text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none"
          >
            <option value="ALL">สถานะทั้งหมด ({students.length})</option>
            <option value="FILLED">กรอกข้อมูลแล้ว ({students.filter((s) => s.coopRecord).length})</option>
            <option value="PENDING">ยังไม่กรอกข้อมูล ({students.filter((s) => !s.coopRecord).length})</option>
          </select>

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
            + นำเข้านิสิต
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-medium">ไม่พบข้อมูลนิสิต</p>
            <p className="text-sm mt-1">
              {students.length === 0
                ? "ยังไม่มีการนำเข้านิสิตเข้าระบบ"
                : "ไม่มีรายการที่ตรงกับเงื่อนไขการค้นหา"}
            </p>
            {students.length === 0 && (
              <Link
                href="/students/import"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
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
                  <th className="py-3 px-4">รหัสนิสิต</th>
                  <th className="py-3 px-4">รหัสผ่านชั่วคราว</th>
                  <th className="py-3 px-4">บริษัทที่ฝึกสหกิจ</th>
                  <th className="py-3 px-4">จังหวัด</th>
                  <th className="py-3 px-4">ตำแหน่ง</th>
                  <th className="py-3 px-4">สถานะข้อมูล</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const coop = student.coopRecord;
                  const isFilled = coop !== null;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {student.tempPassword ? (
                          revealPasswords ? (
                            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                              {student.tempPassword}
                            </span>
                          ) : (
                            <span className="text-slate-400">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span>
                          )
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isFilled ? (
                          <span className="font-medium text-slate-800">{coop.companyName}</span>
                        ) : (
                          <span className="text-slate-400 italic">ยังไม่ระบุ</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {isFilled ? coop.companyProvince : "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {isFilled ? coop.jobPosition : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {isFilled ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            ครบถ้วน
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            รออาจารย์กรอก
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          href={`/students/${student.studentId}/coop`}
                          className={`inline-block px-3 py-1 text-xs rounded font-medium transition-colors ${
                            isFilled
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {isFilled ? "แก้ไขข้อมูล" : "กรอกข้อมูล"}
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === student.studentId}
                          onClick={() => handleDelete(student.studentId)}
                          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        >
                          {deletingId === student.studentId ? "..." : "ลบ"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
