"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface CompanyListItem {
  id: string;
  name: string;
  province: string;
  position: string;
  address: string;
  detail: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CompanyTableProps {
  initialCompanies: CompanyListItem[];
}

export function CompanyTable({ initialCompanies }: CompanyTableProps): React.JSX.Element {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("ALL");
  const [companies, setCompanies] = useState<CompanyListItem[]>(initialCompanies);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract unique provinces for quick filtering
  const provinces = Array.from(new Set(companies.map((c) => c.province))).sort();

  const filteredCompanies = companies.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchProvince =
      selectedProvince === "ALL" || c.province === selectedProvince;

    return matchSearch && matchProvince;
  });

  const handleDelete = async (id: string, name: string): Promise<void> => {
    if (!window.confirm(`ยืนยันการลบข้อมูลบริษัท "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCompanies((prev) => prev.filter((item) => item.id !== id));
        router.refresh();
      } else {
        const errData: unknown = await res.json();
        const errObj = errData as { error?: string };
        alert(errObj.error || "เกิดข้อผิดพลาดในการลบ");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCsv = (): void => {
    if (filteredCompanies.length === 0) return;

    const headers = "Company Name,Province,Position,Address,Detail\n";
    const rows = filteredCompanies
      .map(
        (c) =>
          `"${c.name}","${c.province}","${c.position}","${c.address}","${c.detail ?? ""}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `coop_companies_${Date.now()}.csv`);
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
            placeholder="ค้นหาชื่อบริษัท / ตำแหน่ง / ที่อยู่..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {provinces.length > 0 && (
            <select
              value={selectedProvince}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedProvince(e.target.value)
              }
              className="text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none"
            >
              <option value="ALL">ทุกจังหวัด ({companies.length})</option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p} ({companies.filter((c) => c.province === p).length})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
          >
            ดาวน์โหลด CSV
          </button>

          <Link
            href="/companies/new"
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            + เพิ่มข้อมูลบริษัท
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredCompanies.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-medium">ยังไม่มีข้อมูลบริษัท</p>
            <p className="text-sm mt-1">
              {companies.length === 0
                ? "อาจารย์สามารถเพิ่มข้อมูลบริษัทเพื่อให้ส่งต่อไปยังเว็บนิสิตได้"
                : "ไม่พบบริษัทที่ตรงกับคำค้นหา"}
            </p>
            {companies.length === 0 && (
              <Link
                href="/companies/new"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                + เพิ่มบริษัทแรก
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ชื่อบริษัท</th>
                  <th className="py-3 px-4">จังหวัด</th>
                  <th className="py-3 px-4">ตำแหน่ง (ที่เคยเปิดรับ / รุ่นพี่ยื่น)</th>
                  <th className="py-3 px-4">ที่อยู่บริษัท</th>
                  <th className="py-3 px-4">รายละเอียด</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {company.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                        {company.province}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-blue-700 font-medium">
                      {company.position}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={company.address}>
                      {company.address}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs max-w-xs truncate" title={company.detail ?? ""}>
                      {company.detail || "-"}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/companies/${company.id}/edit`}
                        className="inline-block px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition-colors"
                      >
                        แก้ไข
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === company.id}
                        onClick={() => handleDelete(company.id, company.name)}
                        className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      >
                        {deletingId === company.id ? "..." : "ลบ"}
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
