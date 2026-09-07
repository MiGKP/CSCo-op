"use client";

import React, { useEffect, useState } from "react";
import { IconCheck, IconCopy } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/feedback";

interface CodeBlockProps {
  title: string;
  code: string;
}

interface EndpointHeadingProps {
  method: "GET" | "POST";
  path: string;
  title: string;
  id: string;
}

function CodeBlock({ title, code }: CodeBlockProps): React.JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden border border-panel-line bg-panel">
      <div className="flex items-center justify-between gap-3 border-b border-panel-line px-4 py-2.5">
        <span className="text-[12px] text-panel-ink/70">{title}</span>
        <Button
          variant="ghost"
          size="sm"
          icon={copied ? <IconCheck /> : <IconCopy />}
          aria-label={copied ? "คัดลอกแล้ว" : `คัดลอก ${title}`}
          className="text-panel-ink hover:bg-white/8 hover:text-panel-ink"
          onClick={handleCopy}
        >
          {copied ? "คัดลอกแล้ว" : "คัดลอก"}
        </Button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12px] leading-7 text-panel-ink whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function EndpointHeading({
  method,
  path,
  title,
  id,
}: EndpointHeadingProps): React.JSX.Element {
  return (
    <div id={id} className="scroll-mt-24 border-b border-line pb-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={method === "GET" ? "accent" : "success"}>{method}</Badge>
        <code className="font-mono text-[13px] break-all text-accent">{path}</code>
      </div>
      <h2 className="display mt-3 text-xl text-ink">{title}</h2>
    </div>
  );
}

function FieldRow({
  name,
  type,
  required,
  detail,
}: {
  name: string;
  type: string;
  required?: boolean;
  detail: string;
}): React.JSX.Element {
  return (
    <tr>
      <td data-label="ชื่อ">
        <code className="font-mono text-[13px] text-ink">{name}</code>
      </td>
      <td data-label="ชนิด">
        <span className="font-mono text-[12px] text-ink-muted">{type}</span>
      </td>
      <td data-label="จำเป็น">
        {required ? (
          <span className="text-danger">จำเป็น</span>
        ) : (
          <span className="text-ink-faint">ไม่บังคับ</span>
        )}
      </td>
      <td data-label="รายละเอียด">
        <span className="text-[13px] leading-relaxed text-ink-muted">{detail}</span>
      </td>
    </tr>
  );
}

export function ApiDocs(): React.JSX.Element {
  const [origin, setOrigin] = useState<string>("https://your-app.vercel.app");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const tokenPlaceholder = "STUDENT_WEB_API_TOKEN";
  const loginPath = `${origin}/api/v1/auth/login`;
  const companiesPath = `${origin}/api/v1/companies`;
  const companyDetailPath = `${origin}/api/v1/companies/{id}`;

  const curlLogin = `curl -X POST "${loginPath}" \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d "{\\"studentId\\":\\"66011212222\\",\\"password\\":\\"xxxxxxxx\\"}"`;

  const curlList = `curl "${companiesPath}" \\
  -H "Authorization: Bearer ${tokenPlaceholder}"`;

  const curlSearch = `curl "${companiesPath}?search=Software&province=${encodeURIComponent("กรุงเทพมหานคร")}" \\
  -H "Authorization: Bearer ${tokenPlaceholder}"`;

  const curlDetail = `curl "${origin}/api/v1/companies/REPLACE_WITH_ID" \\
  -H "Authorization: Bearer ${tokenPlaceholder}"`;

  const fetchLogin = `const response = await fetch("${loginPath}", {
  method: "POST",
  headers: {
    Authorization: "Bearer ${tokenPlaceholder}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    studentId: "66011212222",
    password: "xxxxxxxx",
  }),
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.error);
}

// result.data.studentId คือรหัสนิสิตที่ล็อกอินสำเร็จ`;

  const fetchList = `const params = new URLSearchParams({
  search: "Software",
  province: "กรุงเทพมหานคร",
});

const response = await fetch(\`${companiesPath}?\${params.toString()}\`, {
  headers: {
    Authorization: "Bearer ${tokenPlaceholder}",
  },
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.error);
}

// result.data เป็น array ของบริษัท
// result.count เป็นจำนวนรายการ`;

  const fetchDetail = `const companyId = "clxxxxxxxx";
const response = await fetch(\`${origin}/api/v1/companies/\${companyId}\`, {
  headers: {
    Authorization: "Bearer ${tokenPlaceholder}",
  },
});

const result = await response.json();

if (response.status === 404) {
  // ไม่พบบริษัทนี้
}

if (!response.ok) {
  throw new Error(result.error);
}

const company = result.data;`;

  return (
    <div className="grid gap-12">
      <nav
        aria-label="สารบัญเอกสาร"
        className="border border-line bg-surface px-5 py-5"
      >
        <p className="eyebrow text-accent">สารบัญ</p>
        <ol className="mt-4 grid gap-2 text-sm">
          <li>
            <a href="#overview" className="text-accent no-underline hover:underline">
              ภาพรวมการเชื่อมต่อ
            </a>
          </li>
          <li>
            <a href="#auth" className="text-accent no-underline hover:underline">
              การยืนยันตัวตน (Bearer Token)
            </a>
          </li>
          <li>
            <a href="#errors" className="text-accent no-underline hover:underline">
              รูปแบบข้อผิดพลาด
            </a>
          </li>
          <li>
            <a href="#login" className="text-accent no-underline hover:underline">
              POST /api/v1/auth/login
            </a>
          </li>
          <li>
            <a href="#companies" className="text-accent no-underline hover:underline">
              GET /api/v1/companies
            </a>
          </li>
          <li>
            <a href="#company-detail" className="text-accent no-underline hover:underline">
              GET /api/v1/companies/:id
            </a>
          </li>
          <li>
            <a href="#flow" className="text-accent no-underline hover:underline">
              ลำดับการเรียกจากเว็บนิสิต
            </a>
          </li>
        </ol>
      </nav>

      <section id="overview" className="scroll-mt-24 grid gap-4">
        <p className="eyebrow text-accent">ภาพรวม</p>
        <h2 className="display text-2xl text-ink">เว็บนิสิตดึงข้อมูลจากระบบนี้อย่างไร</h2>
        <p className="max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          ระบบอาจารย์เป็นแหล่งข้อมูลกลาง เว็บนิสิตไม่เก็บรายชื่อบริษัทเอง
          แต่เรียก REST API ชุด <code className="font-mono text-ink">/api/v1</code>{" "}
          เพื่อล็อกอินนิสิตและดึงรายการบริษัทที่อาจารย์กรอกไว้
          เส้นเหล่านี้ไม่ต้องล็อกอินเป็นอาจารย์ — ใช้ Bearer Token ของเว็บนิสิตแทน
        </p>
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
          <div className="bg-surface px-5 py-4">
            <span className="eyebrow text-accent">Base URL ของเครื่องนี้</span>
            <p className="mt-2 font-mono text-[13px] break-all text-ink">{origin}</p>
          </div>
          <div className="bg-surface px-5 py-4">
            <span className="eyebrow text-accent">Prefix ของ API นิสิต</span>
            <p className="mt-2 font-mono text-[13px] text-ink">/api/v1</p>
          </div>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-faint">
          บน production ให้ใช้โดเมน Vercel แทน localhost เช่น{" "}
          <code className="font-mono">https://your-app.vercel.app/api/v1/companies</code>
        </p>
      </section>

      <section id="auth" className="scroll-mt-24 grid gap-4">
        <p className="eyebrow text-accent">ความปลอดภัย</p>
        <h2 className="display text-2xl text-ink">การยืนยันตัวตน</h2>
        <p className="max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          ทุกเส้นใน <code className="font-mono text-ink">/api/v1</code> ต้องส่ง header{" "}
          <code className="font-mono text-ink">Authorization</code> ค่าต้องตรงกับตัวแปร{" "}
          <code className="font-mono text-ink">STUDENT_WEB_API_TOKEN</code> ใน{" "}
          <code className="font-mono text-ink">.env</code> ของระบบอาจารย์ (และใน Vercel)
        </p>
        <CodeBlock
          title="Header ที่ต้องส่งทุกครั้ง"
          code={`Authorization: Bearer ${tokenPlaceholder}`}
        />
        <ul className="grid gap-2 text-sm leading-relaxed text-ink-muted">
          <li>วาง token ฝั่งเซิร์ฟเวอร์ของเว็บนิสิต อย่าฝังใน JavaScript ที่ browser เห็นได้</li>
          <li>รูปแบบต้องมีคำว่า Bearer ตามด้วยช่องว่าง แล้วตามด้วย token</li>
          <li>ถ้าขาดหรือผิด จะได้ HTTP 401 และ code UNAUTHORIZED</li>
          <li>เส้นนี้เปิด CORS ให้เว็บอื่นเรียกได้ (Access-Control-Allow-Origin: *)</li>
        </ul>
      </section>

      <section id="errors" className="scroll-mt-24 grid gap-4">
        <p className="eyebrow text-accent">ข้อผิดพลาด</p>
        <h2 className="display text-2xl text-ink">รูปแบบ error ที่เหมือนกันทุกเส้น</h2>
        <CodeBlock
          title="JSON เมื่อล้มเหลว"
          code={`{
  "success": false,
  "error": "ข้อความอธิบายภาษาอังกฤษหรือไทย",
  "code": "UNAUTHORIZED"
}`}
        />
        <div className="overflow-hidden border border-line bg-surface">
          <table className="data-table">
            <caption className="sr-only">รหัสข้อผิดพลาดของ API นิสิต</caption>
            <thead>
              <tr>
                <th scope="col">HTTP</th>
                <th scope="col">code</th>
                <th scope="col">ความหมาย</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="HTTP">400</td>
                <td data-label="code">
                  <code className="font-mono text-[13px]">VALIDATION_ERROR</code>
                </td>
                <td data-label="ความหมาย">body ไม่ครบหรือผิดชนิด</td>
              </tr>
              <tr>
                <td data-label="HTTP">401</td>
                <td data-label="code">
                  <code className="font-mono text-[13px]">UNAUTHORIZED</code>
                </td>
                <td data-label="ความหมาย">ไม่มี Bearer หรือ token ไม่ตรง</td>
              </tr>
              <tr>
                <td data-label="HTTP">401</td>
                <td data-label="code">
                  <code className="font-mono text-[13px]">INVALID_CREDENTIALS</code>
                </td>
                <td data-label="ความหมาย">รหัสนิสิตหรือรหัสผ่านผิด</td>
              </tr>
              <tr>
                <td data-label="HTTP">404</td>
                <td data-label="code">
                  <code className="font-mono text-[13px]">NOT_FOUND</code>
                </td>
                <td data-label="ความหมาย">ไม่พบบริษัทตาม id</td>
              </tr>
              <tr>
                <td data-label="HTTP">500</td>
                <td data-label="code">
                  <code className="font-mono text-[13px]">INTERNAL_SERVER_ERROR</code>
                </td>
                <td data-label="ความหมาย">ผิดพลาดฝั่งเซิร์ฟเวอร์</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6">
        <EndpointHeading
          id="login"
          method="POST"
          path="/api/v1/auth/login"
          title="ล็อกอินนิสิตด้วยรหัสที่อาจารย์สร้างให้"
        />
        <p className="max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          ใช้เมื่อนิสิตกรอกรหัสนิสิตและรหัสผ่านชั่วคราวบนเว็บนิสิต
          ระบบตรวจกับบัญชีที่สร้างจากหน้า «นำเข้านิสิต» ถ้าผ่าน จะคืนเฉพาะ{" "}
          <code className="font-mono text-ink">studentId</code> ไม่คืนรหัสผ่าน
        </p>
        <h3 className="text-[15px] font-medium text-ink">Request body</h3>
        <div className="overflow-hidden border border-line bg-surface">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">ชื่อ</th>
                <th scope="col">ชนิด</th>
                <th scope="col">จำเป็น</th>
                <th scope="col">รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              <FieldRow
                name="studentId"
                type="string"
                required
                detail="รหัสนิสิตที่นำเข้าแล้ว เช่น 66011212222"
              />
              <FieldRow
                name="password"
                type="string"
                required
                detail="รหัสผ่านชั่วคราวที่ระบบสุ่มให้ตอนนำเข้า"
              />
            </tbody>
          </table>
        </div>
        <h3 className="text-[15px] font-medium text-ink">สำเร็จ — HTTP 200</h3>
        <CodeBlock
          title="Response"
          code={`{
  "success": true,
  "message": "Login successful",
  "data": {
    "studentId": "66011212222"
  }
}`}
        />
        <div className="grid gap-4">
          <CodeBlock title="cURL" code={curlLogin} />
          <CodeBlock title="fetch (JavaScript)" code={fetchLogin} />
        </div>
      </section>

      <section className="grid gap-6">
        <EndpointHeading
          id="companies"
          method="GET"
          path="/api/v1/companies"
          title="ดึงรายการบริษัททั้งหมด (ค้นหาและกรองจังหวัดได้)"
        />
        <p className="max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          คืนรายการบริษัทที่อาจารย์บันทึก เรียงตามชื่อ
          ข้อมูลเป็นรายการกลาง ไม่ผูกกับนิสิตคนใดคนหนึ่ง
          นิสิตคนละคนได้ชุดเดียวกัน
        </p>
        <h3 className="text-[15px] font-medium text-ink">Query string</h3>
        <div className="overflow-hidden border border-line bg-surface">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">ชื่อ</th>
                <th scope="col">ชนิด</th>
                <th scope="col">จำเป็น</th>
                <th scope="col">รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              <FieldRow
                name="search"
                type="string"
                detail="ค้นหาในชื่อบริษัทหรือตำแหน่ง แบบมีคำนั้นอยู่ในข้อความ"
              />
              <FieldRow
                name="province"
                type="string"
                detail="กรองจังหวัดให้ตรงทั้งค่า เช่น กรุงเทพมหานคร"
              />
            </tbody>
          </table>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          ใช้ร่วมกันได้ เช่น{" "}
          <code className="font-mono text-ink">
            /api/v1/companies?search=Engineer&amp;province=ชลบุรี
          </code>
          . ไม่ส่ง query = ได้ทุกรายการ
        </p>
        <h3 className="text-[15px] font-medium text-ink">ฟิลด์ในแต่ละบริษัท</h3>
        <div className="overflow-hidden border border-line bg-surface">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">ชื่อ</th>
                <th scope="col">ชนิด</th>
                <th scope="col">จำเป็น</th>
                <th scope="col">รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              <FieldRow name="id" type="string" required detail="รหัสรายการ ใช้เรียกหน้าละเอียด" />
              <FieldRow name="name" type="string" required detail="ชื่อบริษัท" />
              <FieldRow name="province" type="string" required detail="จังหวัด" />
              <FieldRow
                name="position"
                type="string"
                required
                detail="ตำแหน่งที่เคยเปิดรับหรือที่รุ่นพี่เคยยื่น"
              />
              <FieldRow name="address" type="string" required detail="ที่อยู่บริษัท" />
              <FieldRow
                name="detail"
                type="string | null"
                detail="รายละเอียดเพิ่มเติม ถ้าไม่กรอกจะเป็น null"
              />
              <FieldRow
                name="updatedAt"
                type="string"
                required
                detail="เวลาแก้ไขล่าสุด รูปแบบ ISO 8601"
              />
            </tbody>
          </table>
        </div>
        <h3 className="text-[15px] font-medium text-ink">สำเร็จ — HTTP 200</h3>
        <CodeBlock
          title="Response"
          code={`{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "clxxxxxxxx",
      "name": "บริษัท สยาม อินโนเวชั่น จำกัด (มหาชน)",
      "province": "กรุงเทพมหานคร",
      "position": "Software Engineer, Frontend Developer",
      "address": "123 อาคารสาทรซิตี้ทาวเวอร์ ชั้น 18 ...",
      "detail": "เบี้ยเลี้ยง 600 บาท/วัน",
      "updatedAt": "2026-09-07T14:00:00.000Z"
    }
  ]
}`}
        />
        <div className="grid gap-4">
          <CodeBlock title="cURL — ดึงทั้งหมด" code={curlList} />
          <CodeBlock title="cURL — ค้นหาและกรองจังหวัด" code={curlSearch} />
          <CodeBlock title="fetch (JavaScript)" code={fetchList} />
        </div>
      </section>

      <section className="grid gap-6">
        <EndpointHeading
          id="company-detail"
          method="GET"
          path="/api/v1/companies/:id"
          title="ดึงรายละเอียดบริษัทรายตัว"
        />
        <p className="max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          ใช้เมื่อนิสิตกดเข้าหน้าบริษัทจากรายการ{" "}
          <code className="font-mono text-ink">:id</code> คือค่า{" "}
          <code className="font-mono text-ink">id</code> จากเส้นรายการ
          ฟิลด์ใน <code className="font-mono text-ink">data</code> ชุดเดียวกับรายการ
        </p>
        <h3 className="text-[15px] font-medium text-ink">สำเร็จ — HTTP 200</h3>
        <CodeBlock
          title="Response"
          code={`{
  "success": true,
  "data": {
    "id": "clxxxxxxxx",
    "name": "บริษัท สยาม อินโนเวชั่น จำกัด (มหาชน)",
    "province": "กรุงเทพมหานคร",
    "position": "Software Engineer, Frontend Developer",
    "address": "123 อาคารสาทรซิตี้ทาวเวอร์ ชั้น 18 ...",
    "detail": "เบี้ยเลี้ยง 600 บาท/วัน",
    "updatedAt": "2026-09-07T14:00:00.000Z"
  }
}`}
        />
        <h3 className="text-[15px] font-medium text-ink">ไม่พบ — HTTP 404</h3>
        <CodeBlock
          title="Response"
          code={`{
  "success": false,
  "error": "Company not found",
  "code": "NOT_FOUND"
}`}
        />
        <div className="grid gap-4">
          <CodeBlock title="cURL" code={curlDetail} />
          <CodeBlock title="fetch (JavaScript)" code={fetchDetail} />
        </div>
      </section>

      <section id="flow" className="scroll-mt-24 grid gap-4">
        <p className="eyebrow text-accent">การนำไปใช้</p>
        <h2 className="display text-2xl text-ink">ลำดับที่แนะนำบนเว็บนิสิต</h2>
        <ol className="grid gap-0">
          <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4 border-t border-line py-5">
            <span className="display pt-0.5 text-[15px] text-accent/70">01</span>
            <div>
              <strong className="text-[15px] font-medium text-ink">
                เก็บ token ฝั่งเซิร์ฟเวอร์
              </strong>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                ใส่ STUDENT_WEB_API_TOKEN ใน env ของเว็บนิสิต ค่าเดียวกับระบบอาจารย์
                เรียก API จาก server/route handler อย่าใส่ token ในหน้าเว็บสาธารณะ
              </p>
            </div>
          </li>
          <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4 border-t border-line py-5">
            <span className="display pt-0.5 text-[15px] text-accent/70">02</span>
            <div>
              <strong className="text-[15px] font-medium text-ink">
                ล็อกอินนิสิต
              </strong>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                POST /api/v1/auth/login ด้วย studentId + password ที่อาจารย์แจก
                ถ้า 200 ให้เปิด session ของเว็บนิสิตเอง (JWT/cookie ของฝั่งนิสิต)
                API นี้ไม่ได้ออก session cookie ให้นิสิต
              </p>
            </div>
          </li>
          <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4 border-t border-line py-5 last:border-b">
            <span className="display pt-0.5 text-[15px] text-accent/70">03</span>
            <div>
              <strong className="text-[15px] font-medium text-ink">
                ดึงรายการแล้วเปิดรายละเอียด
              </strong>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                GET /api/v1/companies สำหรับหน้ารายการ ใช้ search และ province ตามฟอร์มค้นหา
                เมื่อนิสิตกดบริษัท ให้ GET /api/v1/companies/:id ด้วย id จากรายการ
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="grid gap-4 border-t border-line pt-8">
        <p className="eyebrow text-accent">API ภายใน</p>
        <h2 className="display text-2xl text-ink">เส้นที่ใช้แค่ในระบบอาจารย์</h2>
        <p className="max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          เส้นด้านล่างต้องล็อกอินอาจารย์ (cookie{" "}
          <code className="font-mono text-ink">instructor_session</code>)
          เว็บนิสิตห้ามเรียกชุดนี้
        </p>
        <div className="overflow-hidden border border-line bg-surface">
          <table className="data-table">
            <caption className="sr-only">API ภายในพอร์ทัลอาจารย์</caption>
            <thead>
              <tr>
                <th scope="col">เส้น</th>
                <th scope="col">หน้าที่</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="เส้น">
                  <code className="font-mono text-[13px]">POST /api/auth/instructor/login</code>
                </td>
                <td data-label="หน้าที่">ล็อกอินอาจารย์ แล้วตั้ง cookie session</td>
              </tr>
              <tr>
                <td data-label="เส้น">
                  <code className="font-mono text-[13px]">POST /api/auth/instructor/logout</code>
                </td>
                <td data-label="หน้าที่">ลบ cookie ออกจากระบบ</td>
              </tr>
              <tr>
                <td data-label="เส้น">
                  <code className="font-mono text-[13px]">GET/POST /api/companies</code>
                </td>
                <td data-label="หน้าที่">อ่านและเพิ่มบริษัทจากหน้าจัดการ</td>
              </tr>
              <tr>
                <td data-label="เส้น">
                  <code className="font-mono text-[13px]">PUT/DELETE /api/companies/:id</code>
                </td>
                <td data-label="หน้าที่">แก้ไขหรือลบบริษัท</td>
              </tr>
              <tr>
                <td data-label="เส้น">
                  <code className="font-mono text-[13px]">POST /api/students/import</code>
                </td>
                <td data-label="หน้าที่">นำเข้ารหัสนิสิต แล้วสุ่มรหัสผ่าน</td>
              </tr>
              <tr>
                <td data-label="เส้น">
                  <code className="font-mono text-[13px]">
                    DELETE /api/internal/students/:studentId
                  </code>
                </td>
                <td data-label="หน้าที่">ลบบัญชีนิสิต</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
