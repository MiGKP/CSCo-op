"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useState, useTransition } from "react";
import { IconArrowLeft, IconCheck } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import {
  SelectField,
  TextArea,
  TextInput,
  type SelectOption,
} from "@/components/ui/form";
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

export function CompanyForm({
  initialData,
  isEdit = false,
}: CompanyFormProps): React.JSX.Element {
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

  const provinceOptions = useMemo<SelectOption[]>(
    () =>
      THAI_PROVINCES.map((province) => ({
        value: province,
        label: province,
      })),
    []
  );

  const setField = (field: keyof FormState, value: string): void => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setErrorMsg(null);

    if (
      !formData.name.trim() ||
      !formData.province.trim() ||
      !formData.position.trim() ||
      !formData.address.trim()
    ) {
      setErrorMsg("กรุณากรอกข้อมูลที่จำเป็นให้ครบทุกช่อง");
      return;
    }

    startTransition(async () => {
      try {
        const url =
          isEdit && initialData?.id
            ? `/api/companies/${initialData.id}`
            : "/api/companies";
        const response = await fetch(url, {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data: unknown = await response.json();

        if (!response.ok) {
          const errorData = data as { error?: string };
          setErrorMsg(errorData.error || "ไม่สามารถบันทึกข้อมูลบริษัทได้");
          return;
        }

        router.push("/companies");
        router.refresh();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองอีกครั้ง";
        setErrorMsg(message);
      }
    });
  };

  const apiPreview = JSON.stringify(
    {
      name: formData.name || "ชื่อบริษัท",
      province: formData.province,
      position: formData.position || "ตำแหน่ง",
      address: formData.address || "ที่อยู่บริษัท",
      detail: formData.detail || null,
    },
    null,
    2
  );

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)] lg:gap-12">
      <form
        onSubmit={handleSubmit}
        className="@container grid gap-6 border border-line bg-surface p-6 sm:p-8"
      >
        <div className="border-b border-line pb-5">
          <p className="eyebrow text-accent">แบบฟอร์ม</p>
          <h2 className="display mt-1.5 text-xl text-ink">
            {isEdit ? "ข้อมูลบริษัท" : "ข้อมูลบริษัทใหม่"}
          </h2>
          <p className="mt-1.5 text-[13px] text-ink-muted">
            ช่องที่มีเครื่องหมาย
            <span className="mx-1 text-danger">*</span>
            เป็นข้อมูลที่จำเป็น
          </p>
        </div>

        {errorMsg ? <Alert tone="danger">{errorMsg}</Alert> : null}

        <div className="grid gap-5 @xl:grid-cols-2">
          <TextInput
            label="ชื่อบริษัท"
            required
            value={formData.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="เช่น บริษัท สยามเทคโนโลยี จำกัด"
            disabled={isPending}
            className="@xl:col-span-2"
          />

          <SelectField
            label="จังหวัด"
            required
            value={formData.province}
            onChange={(event) => setField("province", event.target.value)}
            options={provinceOptions}
            disabled={isPending}
          />

          <TextInput
            label="ตำแหน่ง"
            required
            hint="ตำแหน่งที่บริษัทเคยเปิดรับ หรือที่รุ่นพี่เคยยื่น"
            value={formData.position}
            onChange={(event) => setField("position", event.target.value)}
            placeholder="เช่น Software Engineer, Data Analyst"
            disabled={isPending}
          />

          <TextArea
            label="ที่อยู่บริษัท"
            required
            rows={4}
            value={formData.address}
            onChange={(event) => setField("address", event.target.value)}
            placeholder="เลขที่ อาคาร ถนน แขวง/ตำบล เขต/อำเภอ และรหัสไปรษณีย์"
            disabled={isPending}
            className="@xl:col-span-2"
          />

          <TextArea
            label="รายละเอียดเพิ่มเติม"
            hint="ตัวอย่าง: รูปแบบการทำงาน สวัสดิการ เบี้ยเลี้ยง หรือข้อมูลติดต่อ"
            rows={5}
            value={formData.detail}
            onChange={(event) => setField("detail", event.target.value)}
            placeholder="ระบุข้อมูลที่เป็นประโยชน์สำหรับนิสิต"
            disabled={isPending}
            className="@xl:col-span-2"
          />
        </div>

        <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col-reverse gap-2 border-t border-line bg-surface px-6 py-4 sm:-mx-8 sm:-mb-8 sm:flex-row sm:justify-end sm:px-8">
          <Button
            icon={<IconArrowLeft />}
            disabled={isPending}
            onClick={() => router.push("/companies")}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<IconCheck />}
            loading={isPending}
          >
            {isPending
              ? "กำลังบันทึก..."
              : isEdit
                ? "บันทึกการแก้ไข"
                : "เพิ่มข้อมูลบริษัท"}
          </Button>
        </div>
      </form>

      <aside className="grid gap-6 lg:sticky lg:top-8">
        <div className="overflow-hidden border border-panel-line bg-panel">
          <div className="flex items-center justify-between gap-3 border-b border-panel-line px-4 py-3">
            <span className="eyebrow text-panel-ink/70">
              ข้อมูลที่เว็บนิสิตจะได้รับ
            </span>
            <span className="font-mono text-[11px] text-panel-ink/60">JSON</span>
          </div>
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[12px] leading-7 text-panel-ink">
            {apiPreview}
          </pre>
        </div>

        <div className="border-t border-line pt-5">
          <strong className="text-[13.5px] font-medium text-ink">
            ข้อมูลนี้แยกจากบัญชีนิสิต
          </strong>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            การเพิ่มบริษัทไม่ผูกกับนิสิตคนใด ข้อมูลจะปรากฏเป็นรายการกลาง
            ให้ทุกคนเปิดดูได้ในเว็บฝั่งนิสิต
          </p>
        </div>
      </aside>
    </div>
  );
}
