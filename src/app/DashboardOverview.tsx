import Link from "next/link";
import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { IconArrowRight, IconPlus, IconUpload } from "@/components/icons";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/feedback";

interface DashboardOverviewProps {
  totalStudents: number;
  totalCompanies: number;
}

interface MetricProps {
  eyebrow: string;
  value: number;
  unit: string;
  caption: string;
  href: string;
  linkLabel: string;
}

interface WorkflowStep {
  title: string;
  detail: string;
}

interface Endpoint {
  purpose: string;
  route: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    title: "รวบรวมข้อมูลบริษัท",
    detail:
      "บันทึกชื่อบริษัท จังหวัด ตำแหน่งที่เคยเปิดรับ ที่อยู่ และรายละเอียดเพิ่มเติม เพื่อให้นิสิตใช้ค้นคว้าก่อนยื่นสมัคร",
  },
  {
    title: "สร้างบัญชีนิสิต",
    detail:
      "วางรหัสนิสิตเป็นรายการ ระบบตรวจรูปแบบ สร้างรหัสผ่านแบบสุ่ม และส่งออกเป็น CSV สำหรับแจกให้นิสิต",
  },
  {
    title: "ส่งต่อไปเว็บนิสิต",
    detail:
      "ข้อมูลบริษัทและบัญชีนิสิตถูกเปิดผ่าน REST API ให้เว็บฝั่งนิสิตเรียกใช้ได้ทันทีโดยไม่ต้องคัดลอกข้อมูลซ้ำ",
  },
];

const ENDPOINTS: Endpoint[] = [
  { purpose: "เข้าสู่ระบบสำหรับนิสิต", route: "POST /api/v1/auth/login" },
  { purpose: "รายการบริษัททั้งหมด", route: "GET /api/v1/companies" },
  { purpose: "รายละเอียดบริษัท", route: "GET /api/v1/companies/:id" },
];

function Metric({
  eyebrow,
  value,
  unit,
  caption,
  href,
  linkLabel,
}: MetricProps): React.JSX.Element {
  return (
    <div className="bg-surface px-6 py-7 sm:px-8 sm:py-9">
      <p className="eyebrow text-accent">{eyebrow}</p>
      <p className="mt-5 flex items-baseline gap-2.5">
        <span className="display text-[clamp(2.75rem,5vw,3.75rem)] text-accent">
          {value.toLocaleString("th-TH")}
        </span>
        <span className="text-sm text-ink-faint">{unit}</span>
      </p>
      <p className="mt-2 text-sm text-ink-muted">{caption}</p>
      <Link
        href={href}
        className="group mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-accent no-underline"
      >
        {linkLabel}
        <span className="transition-transform duration-150 group-hover:translate-x-0.5">
          <IconArrowRight />
        </span>
      </Link>
    </div>
  );
}

export function DashboardOverview({
  totalStudents,
  totalCompanies,
}: DashboardOverviewProps): React.JSX.Element {
  return (
    <div className="grid gap-10">
      <PageHeader
        eyebrow="ภาพรวมระบบ"
        title="ศูนย์จัดการข้อมูลสหกิจศึกษา"
        description="จัดการรายการบริษัทที่รุ่นพี่เคยยื่น และบัญชีเข้าใช้งานของนิสิต จากหน้าจอเดียว"
        actions={
          <>
            <LinkButton href="/companies/new" variant="primary" icon={<IconPlus />}>
              เพิ่มบริษัท
            </LinkButton>
            <LinkButton href="/students/import" icon={<IconUpload />}>
              นำเข้านิสิต
            </LinkButton>
          </>
        }
      />

      {/* gap-px over a line-coloured background renders true hairline dividers
          between cells without doubling borders. */}
      <section
        aria-label="สถิติระบบ"
        className="grid gap-px border border-line bg-line sm:grid-cols-2"
      >
        <Metric
          eyebrow="ข้อมูลบริษัท"
          value={totalCompanies}
          unit="บริษัท"
          caption="รายการที่นิสิตค้นดูได้จากเว็บฝั่งนิสิต"
          href="/companies"
          linkLabel="จัดการข้อมูลบริษัท"
        />
        <Metric
          eyebrow="บัญชีนิสิต"
          value={totalStudents}
          unit="บัญชี"
          caption="User และ Password ที่สร้างไว้แล้ว"
          href="/students"
          linkLabel="จัดการบัญชีนิสิต"
        />
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-14">
        <div>
          <p className="eyebrow text-accent">ขั้นตอนการทำงาน</p>
          <h2 className="display mt-2 text-2xl text-ink">งานหลักของอาจารย์</h2>

          <ol className="mt-7 grid gap-0">
            {WORKFLOW_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4 border-t border-line py-5 last:border-b"
              >
                <span className="display pt-0.5 text-[15px] text-accent/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <strong className="text-[15px] font-medium text-ink">
                    {step.title}
                  </strong>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-accent">การเชื่อมต่อ</p>
              <h2 className="display mt-2 text-2xl text-ink">เว็บฝั่งนิสิต</h2>
            </div>
            <Badge tone="success">พร้อมใช้งาน</Badge>
          </div>

          <dl className="mt-7 grid gap-0">
            {ENDPOINTS.map((endpoint) => (
              <div
                key={endpoint.route}
                className="grid gap-1.5 border-t border-line py-4 last:border-b"
              >
                <dt className="text-[13px] text-ink-muted">
                  {endpoint.purpose}
                </dt>
                <dd className="font-mono text-[12.5px] break-all text-accent">
                  {endpoint.route}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 text-[13px] leading-relaxed text-ink-faint">
            ข้อมูลบริษัทเป็นรายการกลาง ไม่ผูกกับนิสิตคนใดคนหนึ่ง
            การเพิ่มหรือแก้ไขจะมีผลกับทุกคนที่เปิดดู
          </p>
        </div>
      </section>
    </div>
  );
}
