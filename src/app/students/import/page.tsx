"use client";

import React, { useState, useTransition } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconDownload,
  IconUpload,
} from "@/components/icons";
import { Button, LinkButton } from "@/components/ui/button";
import { Alert, Badge } from "@/components/ui/feedback";
import { TextArea } from "@/components/ui/form";
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

interface ImportStep {
  title: string;
  detail: string;
}

const IMPORT_STEPS: ImportStep[] = [
  {
    title: "ตรวจสอบรหัสนิสิต",
    detail: "ใช้ตัวเลขเท่านั้น 8-15 หลัก ไม่ต้องใส่คำนำหน้าหรือชื่อ",
  },
  {
    title: "บันทึกรหัสผ่านทันที",
    detail: "ดาวน์โหลด CSV หลังสร้างบัญชี เพราะรหัสผ่านแสดงครั้งนี้ครั้งเดียว",
  },
  {
    title: "รายการซ้ำจะถูกข้าม",
    detail: "ระบบไม่เปลี่ยนรหัสผ่านของบัญชีที่มีอยู่แล้ว",
  },
];

export default function StudentImportPage(): React.JSX.Element {
  const [inputText, setInputText] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedStudentId, setCopiedStudentId] = useState<string | null>(null);
  const [importResult, setImportResult] =
    useState<ImportApiSuccessResponse | null>(null);

  const preview = parseAndValidateStudentIds(inputText);
  const hasOnlyInvalidInput =
    inputText.trim().length > 0 && preview.validIds.length === 0;

  const handleInsertSample = (): void => {
    setInputText("66011212222\n66011212223\n66011212224\n66011212225");
    setErrorMsg(null);
  };

  const handleImportSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    setErrorMsg(null);

    if (preview.validIds.length === 0) {
      setErrorMsg(
        "กรุณาระบุรหัสนิสิตที่ถูกต้องอย่างน้อย 1 รายการ (ตัวเลข 8-15 หลัก)"
      );
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/students/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawInput: inputText }),
        });
        const data: unknown = await response.json();

        if (!response.ok) {
          const errorData = data as ImportApiErrorResponse;
          setErrorMsg(errorData.error || "เกิดข้อผิดพลาดในการนำเข้า");
          return;
        }

        setImportResult(data as ImportApiSuccessResponse);
        setInputText("");
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการเชื่อมต่อ";
        setErrorMsg(message);
      }
    });
  };

  const copyAllCredentials = async (): Promise<void> => {
    if (!importResult || importResult.created.length === 0) {
      return;
    }

    const text = importResult.created
      .map(
        (item) =>
          `รหัสนิสิต: ${item.studentId}\tรหัสผ่าน: ${item.tempPassword}`
      )
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      window.setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      setErrorMsg("เบราว์เซอร์ไม่อนุญาตให้คัดลอก กรุณาดาวน์โหลด CSV แทน");
    }
  };

  const copySingleCredential = async (
    credential: CreatedStudent
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(
        `User: ${credential.studentId}\nPassword: ${credential.tempPassword}`
      );
      setCopiedStudentId(credential.studentId);
      window.setTimeout(() => setCopiedStudentId(null), 2000);
    } catch {
      setErrorMsg("เบราว์เซอร์ไม่อนุญาตให้คัดลอก กรุณาดาวน์โหลด CSV แทน");
    }
  };

  const downloadCsv = (): void => {
    if (!importResult || importResult.created.length === 0) {
      return;
    }

    const headers = "Student ID,Temporary Password\n";
    const rows = importResult.created
      .map((item) => `"${item.studentId}","${item.tempPassword}"`)
      .join("\n");
    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `coop_students_credentials_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="สร้างบัญชี"
        title="นำเข้าบัญชีนิสิต"
        description="วางรหัสนิสิตเป็นรายการ ระบบจะตรวจรูปแบบและสร้างรหัสผ่านแบบสุ่มให้อัตโนมัติ"
        actions={
          <LinkButton href="/students" icon={<IconArrowLeft />}>
            กลับไปบัญชีนิสิต
          </LinkButton>
        }
      />

      {errorMsg ? (
        <Alert tone="danger" title="นำเข้าไม่สำเร็จ">
          {errorMsg}
        </Alert>
      ) : null}

      <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,1fr)] lg:gap-12">
        <form
          onSubmit={handleImportSubmit}
          className="grid gap-5 border border-line bg-surface p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
            <div>
              <p className="eyebrow text-accent">ข้อมูลนำเข้า</p>
              <h2 className="display mt-1.5 text-xl text-ink">รหัสนิสิต</h2>
              <p className="mt-1.5 text-[13px] text-ink-muted">
                หนึ่งรหัสต่อหนึ่งบรรทัด รองรับตัวเลข 8-15 หลัก
              </p>
            </div>
            <Button
              variant="quiet"
              size="sm"
              onClick={handleInsertSample}
              disabled={isPending}
            >
              ใส่ข้อมูลตัวอย่าง
            </Button>
          </div>

          <TextArea
            label="รายการที่ต้องการนำเข้า"
            rows={10}
            mono
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder={"66011212222\n66011212223\n66011212224"}
            disabled={isPending}
            error={
              hasOnlyInvalidInput
                ? "ยังไม่พบรหัสนิสิตที่อยู่ในรูปแบบที่ถูกต้อง"
                : undefined
            }
          />

          <div
            aria-live="polite"
            className="grid gap-px border border-line bg-line sm:grid-cols-2"
          >
            <div className="flex items-baseline justify-between gap-3 bg-surface px-4 py-3">
              <span className="text-[13px] text-ink-muted">พร้อมนำเข้า</span>
              <strong className="font-mono text-lg text-ink">
                {preview.validIds.length}
              </strong>
            </div>
            <div className="flex items-baseline justify-between gap-3 bg-surface px-4 py-3">
              <span className="text-[13px] text-ink-muted">
                รูปแบบไม่ถูกต้อง
              </span>
              <strong
                className={`font-mono text-lg ${
                  preview.invalidLines.length > 0 ? "text-warning" : "text-ink"
                }`}
              >
                {preview.invalidLines.length}
              </strong>
            </div>
          </div>

          {preview.invalidLines.length > 0 ? (
            <Alert tone="warning">
              ระบบจะข้าม: {preview.invalidLines.slice(0, 4).join(", ")}
              {preview.invalidLines.length > 4 ? " และรายการอื่น" : ""}
            </Alert>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={<IconUpload />}
            loading={isPending}
            disabled={preview.validIds.length === 0}
          >
            {isPending
              ? "กำลังสร้างบัญชี..."
              : `นำเข้า ${preview.validIds.length} บัญชี`}
          </Button>
        </form>

        <aside className="lg:sticky lg:top-8">
          <p className="eyebrow text-accent">ก่อนนำเข้า</p>
          <h2 className="display mt-1.5 text-xl text-ink">สิ่งที่ควรรู้</h2>
          <ol className="mt-6 grid gap-0">
            {IMPORT_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-t border-line py-4 last:border-b"
              >
                <span className="display pt-0.5 text-[14px] text-accent/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <strong className="text-[13.5px] font-medium text-ink">
                    {step.title}
                  </strong>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      {importResult ? (
        <section
          aria-live="polite"
          className="grid gap-6 border border-line bg-surface p-6 sm:p-8"
        >
          <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge tone="success" icon={<IconCheck />}>
                นำเข้าสำเร็จ
              </Badge>
              <h2 className="display mt-3 text-xl text-ink">
                สร้างบัญชีใหม่ {importResult.totalImported} บัญชี
              </h2>
            </div>
            {importResult.created.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  icon={copiedAll ? <IconCheck /> : <IconCopy />}
                  onClick={copyAllCredentials}
                >
                  {copiedAll ? "คัดลอกแล้ว" : "คัดลอกทั้งหมด"}
                </Button>
                <Button
                  variant="primary"
                  icon={<IconDownload />}
                  onClick={downloadCsv}
                >
                  ดาวน์โหลด CSV
                </Button>
              </div>
            ) : null}
          </div>

          {importResult.skipped.length > 0 ? (
            <Alert tone="warning">
              ข้ามบัญชีที่มีอยู่แล้ว: {importResult.skipped.join(", ")}
            </Alert>
          ) : null}

          {importResult.created.length > 0 ? (
            <div className="overflow-hidden border border-line md:overflow-x-auto">
              <table className="data-table">
                <caption className="sr-only">
                  บัญชีนิสิตและรหัสผ่านที่สร้างจากการนำเข้าครั้งล่าสุด
                </caption>
                <thead>
                  <tr>
                    <th scope="col">ลำดับ</th>
                    <th scope="col">รหัสนิสิต</th>
                    <th scope="col">รหัสผ่านที่สร้าง</th>
                    <th scope="col" aria-label="คัดลอก" />
                  </tr>
                </thead>
                <tbody>
                  {importResult.created.map((item, index) => (
                    <tr key={item.studentId}>
                      <td data-label="ลำดับ">
                        <span className="font-mono text-[13px] text-ink-faint">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td data-label="รหัสนิสิต">
                        <span className="font-mono text-[13.5px] font-medium tracking-[0.02em] text-ink">
                          {item.studentId}
                        </span>
                      </td>
                      <td data-label="รหัสผ่าน">
                        <span className="font-mono text-[13.5px] tracking-[0.02em] text-success">
                          {item.tempPassword}
                        </span>
                      </td>
                      <td data-actions>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={
                            copiedStudentId === item.studentId ? (
                              <IconCheck />
                            ) : (
                              <IconCopy />
                            )
                          }
                          aria-label={`คัดลอกบัญชี ${item.studentId}`}
                          onClick={() => copySingleCredential(item)}
                        >
                          {copiedStudentId === item.studentId
                            ? "คัดลอกแล้ว"
                            : "คัดลอก"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-2 py-8 text-center text-sm text-ink-muted">
              ไม่มีบัญชีใหม่ รายการทั้งหมดมีอยู่ในระบบแล้ว
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[13px] text-ink-muted">
              เก็บไฟล์รหัสผ่านในพื้นที่ปลอดภัย และส่งให้นิสิตโดยตรง
            </span>
            <LinkButton href="/students" icon={<IconArrowLeft />}>
              ดูบัญชีทั้งหมด
            </LinkButton>
          </div>
        </section>
      ) : null}
    </div>
  );
}
