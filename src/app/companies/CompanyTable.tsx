"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import {
  IconBuilding,
  IconDownload,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@/components/icons";
import { Button, LinkButton } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Alert } from "@/components/ui/feedback";
import { SelectField, TextInput, type SelectOption } from "@/components/ui/form";

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

interface PendingDelete {
  id: string;
  name: string;
}

const ALL_PROVINCES = "ALL";

export function CompanyTable({
  initialCompanies,
}: CompanyTableProps): React.JSX.Element {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProvince, setSelectedProvince] =
    useState<string>(ALL_PROVINCES);
  const [companies, setCompanies] =
    useState<CompanyListItem[]>(initialCompanies);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const provinceOptions = useMemo<SelectOption[]>(() => {
    const unique = Array.from(
      new Set(companies.map((company) => company.province))
    ).sort((a, b) => a.localeCompare(b, "th"));

    return [
      { value: ALL_PROVINCES, label: `ทุกจังหวัด (${companies.length})` },
      ...unique.map((province) => ({ value: province, label: province })),
    ];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("th");

    return companies.filter((company) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        company.name.toLocaleLowerCase("th").includes(normalizedSearch) ||
        company.position.toLocaleLowerCase("th").includes(normalizedSearch) ||
        company.address.toLocaleLowerCase("th").includes(normalizedSearch);
      const matchesProvince =
        selectedProvince === ALL_PROVINCES ||
        company.province === selectedProvince;

      return matchesSearch && matchesProvince;
    });
  }, [companies, searchTerm, selectedProvince]);

  const handleDelete = async (): Promise<void> => {
    if (!pendingDelete) {
      return;
    }

    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`/api/companies/${pendingDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data: unknown = await response.json();
        const errorData = data as { error?: string };
        setErrorMsg(errorData.error || "ไม่สามารถลบข้อมูลบริษัทได้");
        return;
      }

      setCompanies((current) =>
        current.filter((company) => company.id !== pendingDelete.id)
      );
      setPendingDelete(null);
      router.refresh();
    } catch {
      setErrorMsg("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองอีกครั้ง");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = (): void => {
    if (filteredCompanies.length === 0) {
      return;
    }

    const headers = "Company Name,Province,Position,Address,Detail\n";
    const rows = filteredCompanies
      .map(
        (company) =>
          `"${company.name}","${company.province}","${company.position}","${company.address}","${company.detail ?? ""}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `coop_companies_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6">
      {errorMsg && !pendingDelete ? (
        <Alert tone="danger">{errorMsg}</Alert>
      ) : null}

      <div className="flex flex-col gap-3 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
        <TextInput
          label="ค้นหาบริษัท"
          hideLabel
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          leadingIcon={<IconSearch />}
          placeholder="ค้นหาชื่อบริษัท ตำแหน่ง หรือที่อยู่"
          className="md:w-[22rem]"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SelectField
            label="กรองตามจังหวัด"
            hideLabel
            value={selectedProvince}
            onChange={(event) => setSelectedProvince(event.target.value)}
            options={provinceOptions}
            className="sm:w-52"
          />
          <Button
            icon={<IconDownload />}
            onClick={handleExportCsv}
            disabled={filteredCompanies.length === 0}
          >
            ส่งออก CSV
          </Button>
        </div>
      </div>

      <div className="overflow-hidden border border-line bg-surface">
        {filteredCompanies.length === 0 ? (
          <div className="grid justify-items-center gap-3 px-6 py-20 text-center">
            <span className="text-2xl text-ink-faint">
              <IconBuilding />
            </span>
            <strong className="display text-lg text-ink">
              {companies.length === 0
                ? "ยังไม่มีข้อมูลบริษัท"
                : "ไม่พบบริษัทที่ตรงกับการค้นหา"}
            </strong>
            <span className="max-w-[38ch] text-sm text-ink-muted">
              {companies.length === 0
                ? "เพิ่มข้อมูลบริษัทเพื่อส่งต่อให้นิสิตใช้ค้นคว้า"
                : "ลองเปลี่ยนคำค้นหาหรือตัวกรองจังหวัด"}
            </span>
            {companies.length === 0 ? (
              <LinkButton
                href="/companies/new"
                variant="primary"
                icon={<IconPlus />}
                className="mt-2"
              >
                เพิ่มบริษัทแรก
              </LinkButton>
            ) : null}
          </div>
        ) : (
          <div className="md:overflow-x-auto">
            <table className="data-table">
              <caption className="sr-only">
                รายการบริษัท ตำแหน่ง ที่อยู่ และรายละเอียดสำหรับเว็บนิสิต
              </caption>
              <thead>
                <tr>
                  <th scope="col">ชื่อบริษัท</th>
                  <th scope="col">จังหวัด</th>
                  <th scope="col">ตำแหน่ง</th>
                  <th scope="col">ที่อยู่</th>
                  <th scope="col">รายละเอียด</th>
                  <th scope="col" aria-label="การจัดการ" />
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id}>
                    <td data-label="ชื่อบริษัท">
                      <span className="block min-w-[11rem] font-medium text-ink">
                        {company.name}
                      </span>
                    </td>
                    <td data-label="จังหวัด">
                      <span className="text-sm whitespace-nowrap text-ink-muted">
                        {company.province}
                      </span>
                    </td>
                    <td data-label="ตำแหน่ง">
                      <span className="block min-w-[10rem] text-sm text-accent">
                        {company.position}
                      </span>
                    </td>
                    <td data-label="ที่อยู่">
                      <span
                        title={company.address}
                        className="line-clamp-2 block min-w-[11rem] max-w-[16rem] text-[13px] leading-relaxed text-ink-muted"
                      >
                        {company.address}
                      </span>
                    </td>
                    <td data-label="รายละเอียด">
                      <span
                        title={company.detail ?? ""}
                        className="line-clamp-2 block min-w-[10rem] max-w-[16rem] text-[13px] leading-relaxed text-ink-muted"
                      >
                        {company.detail || "—"}
                      </span>
                    </td>
                    <td data-actions>
                      <div className="flex items-center justify-end gap-1">
                        <LinkButton
                          href={`/companies/${company.id}/edit`}
                          variant="ghost"
                          size="sm"
                          icon={<IconPencil />}
                          aria-label={`แก้ไข ${company.name}`}
                        >
                          แก้ไข
                        </LinkButton>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<IconTrash />}
                          aria-label={`ลบ ${company.name}`}
                          onClick={() => {
                            setErrorMsg(null);
                            setPendingDelete({
                              id: company.id,
                              name: company.name,
                            });
                          }}
                        >
                          ลบ
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="ลบข้อมูลบริษัท"
        description={
          <>
            ต้องการลบข้อมูล “{pendingDelete?.name}” ใช่หรือไม่
            ข้อมูลที่ลบแล้วไม่สามารถเรียกคืนได้
          </>
        }
        confirmLabel="ลบข้อมูล"
        pendingLabel="กำลังลบ..."
        destructive
        pending={isDeleting}
        errorMessage={errorMsg}
        confirmIcon={<IconTrash />}
        onConfirm={handleDelete}
        onCancel={() => {
          setPendingDelete(null);
          setErrorMsg(null);
        }}
      />
    </div>
  );
}
