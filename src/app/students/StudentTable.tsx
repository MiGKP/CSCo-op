"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconSearch,
  IconTrash,
  IconUpload,
  IconUsers,
} from "@/components/icons";
import { Button, LinkButton } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Alert } from "@/components/ui/feedback";
import { TextInput } from "@/components/ui/form";

export interface StudentListItem {
  id: string;
  studentId: string;
  tempPassword: string | null;
  createdAt: string;
}

interface StudentTableProps {
  initialStudents: StudentListItem[];
}

export function StudentTable({
  initialStudents,
}: StudentTableProps): React.JSX.Element {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [students, setStudents] =
    useState<StudentListItem[]>(initialStudents);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [revealPasswords, setRevealPasswords] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredStudents = useMemo(
    () =>
      students.filter((student) =>
        student.studentId.includes(searchTerm.trim())
      ),
    [searchTerm, students]
  );

  const handleDelete = async (): Promise<void> => {
    if (!pendingDelete) {
      return;
    }

    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`/api/internal/students/${pendingDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data: unknown = await response.json();
        const errorData = data as { error?: string };
        setErrorMsg(errorData.error || "ไม่สามารถลบบัญชีนิสิตได้");
        return;
      }

      setStudents((current) =>
        current.filter((student) => student.studentId !== pendingDelete)
      );
      setPendingDelete(null);
      router.refresh();
    } catch {
      setErrorMsg("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองอีกครั้ง");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopySingle = async (
    studentId: string,
    password: string | null
  ): Promise<void> => {
    if (!password) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `User: ${studentId}\nPassword: ${password}`
      );
      setCopiedId(studentId);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setErrorMsg("เบราว์เซอร์ไม่อนุญาตให้คัดลอก กรุณาคัดลอกด้วยตนเอง");
    }
  };

  const handleExportCsv = (): void => {
    if (filteredStudents.length === 0) {
      return;
    }

    const headers = "Student ID,Password,Created At\n";
    const rows = filteredStudents
      .map(
        (student) =>
          `"${student.studentId}","${student.tempPassword ?? ""}","${student.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `coop_student_accounts_${Date.now()}.csv`;
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
          label="ค้นหารหัสนิสิต"
          hideLabel
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          leadingIcon={<IconSearch />}
          placeholder="ค้นหารหัสนิสิต"
          inputMode="numeric"
          mono
          className="md:w-[20rem]"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            icon={revealPasswords ? <IconEyeOff /> : <IconEye />}
            onClick={() => setRevealPasswords((current) => !current)}
          >
            {revealPasswords ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          </Button>
          <Button
            icon={<IconDownload />}
            onClick={handleExportCsv}
            disabled={filteredStudents.length === 0}
          >
            ส่งออก CSV
          </Button>
        </div>
      </div>

      <div className="overflow-hidden border border-line bg-surface">
        {filteredStudents.length === 0 ? (
          <div className="grid justify-items-center gap-3 px-6 py-20 text-center">
            <span className="text-2xl text-ink-faint">
              <IconUsers />
            </span>
            <strong className="display text-lg text-ink">
              {students.length === 0
                ? "ยังไม่มีบัญชีนิสิต"
                : "ไม่พบรหัสนิสิตที่ค้นหา"}
            </strong>
            <span className="max-w-[38ch] text-sm text-ink-muted">
              {students.length === 0
                ? "นำเข้ารหัสนิสิตเพื่อให้ระบบสร้าง User และ Password"
                : "ตรวจสอบรหัสนิสิตแล้วลองค้นหาอีกครั้ง"}
            </span>
            {students.length === 0 ? (
              <LinkButton
                href="/students/import"
                variant="primary"
                icon={<IconUpload />}
                className="mt-2"
              >
                นำเข้านิสิต
              </LinkButton>
            ) : null}
          </div>
        ) : (
          <div className="md:overflow-x-auto">
            <table className="data-table">
              <caption className="sr-only">
                รายการรหัสนิสิต รหัสผ่านชั่วคราว และวันที่สร้างบัญชี
              </caption>
              <thead>
                <tr>
                  <th scope="col">รหัสนิสิต</th>
                  <th scope="col">รหัสผ่าน</th>
                  <th scope="col">วันที่สร้างบัญชี</th>
                  <th scope="col" aria-label="การจัดการ" />
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td data-label="รหัสนิสิต">
                      <span className="font-mono text-[13.5px] font-medium tracking-[0.02em] text-ink">
                        {student.studentId}
                      </span>
                    </td>
                    <td data-label="รหัสผ่าน">
                      {student.tempPassword ? (
                        <span className="font-mono text-[13.5px] tracking-[0.02em] text-ink-muted">
                          {revealPasswords ? student.tempPassword : "••••••••"}
                        </span>
                      ) : (
                        <span className="text-[13px] text-ink-faint">
                          ไม่มีรหัสผ่านชั่วคราว
                        </span>
                      )}
                    </td>
                    <td data-label="วันที่สร้าง">
                      <span className="text-[13px] whitespace-nowrap text-ink-muted">
                        {new Date(student.createdAt).toLocaleDateString(
                          "th-TH",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </td>
                    <td data-actions>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={
                            copiedId === student.studentId ? (
                              <IconCheck />
                            ) : (
                              <IconCopy />
                            )
                          }
                          disabled={!student.tempPassword}
                          aria-label={`คัดลอกบัญชี ${student.studentId}`}
                          onClick={() =>
                            handleCopySingle(
                              student.studentId,
                              student.tempPassword
                            )
                          }
                        >
                          {copiedId === student.studentId
                            ? "คัดลอกแล้ว"
                            : "คัดลอก"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<IconTrash />}
                          aria-label={`ลบบัญชี ${student.studentId}`}
                          onClick={() => {
                            setErrorMsg(null);
                            setPendingDelete(student.studentId);
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
        title="ลบบัญชีนิสิต"
        description={
          <>
            ต้องการลบบัญชี{" "}
            <span className="font-mono text-ink">{pendingDelete}</span>{" "}
            ใช่หรือไม่ นิสิตจะไม่สามารถเข้าสู่ระบบด้วยบัญชีนี้ได้อีก
          </>
        }
        confirmLabel="ลบบัญชี"
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
