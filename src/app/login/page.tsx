"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState, useTransition } from "react";
import {
  IconArrowRight,
  IconEye,
  IconEyeOff,
  IconKey,
  IconUser,
} from "@/components/icons";
import { ThemeSelect } from "@/components/ThemeSelect";
import { Button } from "@/components/ui/button";
import { Alert, Spinner } from "@/components/ui/feedback";
import { TextInput } from "@/components/ui/form";

interface Highlight {
  title: string;
  detail: string;
}

const HIGHLIGHTS: Highlight[] = [
  {
    title: "ข้อมูลบริษัท",
    detail: "รวบรวมตำแหน่งและที่อยู่ที่รุ่นพี่เคยยื่น ไว้เป็นรายการกลาง",
  },
  {
    title: "บัญชีนิสิต",
    detail: "สร้าง User และ Password พร้อมส่งออกเป็นไฟล์ CSV",
  },
  {
    title: "ส่งต่ออัตโนมัติ",
    detail: "เว็บฝั่งนิสิตอ่านข้อมูลผ่าน API โดยไม่ต้องคัดลอกซ้ำ",
  },
];

function getSafeRedirectPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001F]/u.test(value)
  ) {
    return "/";
  }

  return value;
}

function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("from"));
  const isDevelopment = process.env.NODE_ENV === "development";

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFillDemo = (): void => {
    setUsername("admin");
    setPassword("coop2026pass");
    setErrorMsg(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบ");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/instructor/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim(),
          }),
        });

        const data: unknown = await response.json();

        if (!response.ok) {
          const errorData = data as { error?: string };
          setErrorMsg(errorData.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
          return;
        }

        router.push(redirectTo);
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

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {errorMsg ? (
        <Alert tone="danger" title="เข้าสู่ระบบไม่สำเร็จ">
          {errorMsg}
        </Alert>
      ) : null}

      <TextInput
        label="ชื่อผู้ใช้"
        required
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        leadingIcon={<IconUser />}
        autoComplete="username"
        placeholder="กรอกชื่อผู้ใช้"
        disabled={isPending}
      />

      <TextInput
        label="รหัสผ่าน"
        required
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        leadingIcon={<IconKey />}
        trailing={
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            icon={showPassword ? <IconEyeOff /> : <IconEye />}
            onClick={() => setShowPassword((current) => !current)}
          />
        }
        autoComplete="current-password"
        placeholder="กรอกรหัสผ่าน"
        disabled={isPending}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isPending}
        iconAfter={<IconArrowRight />}
        className="mt-1 w-full"
      >
        {isPending ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
      </Button>

      {isDevelopment ? (
        <div className="mt-2 flex items-center justify-between gap-4 border border-line bg-raised px-4 py-3">
          <div className="min-w-0">
            <strong className="block text-[13px] font-medium text-ink">
              บัญชีทดสอบสำหรับเครื่องนี้
            </strong>
            <span className="block font-mono text-xs text-ink-muted">
              admin / coop2026pass
            </span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleFillDemo}>
            กรอกให้
          </Button>
        </div>
      ) : null}
    </form>
  );
}

export default function InstructorLoginPage(): React.JSX.Element {
  return (
    <div className="relative min-h-dvh lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(27rem,0.9fr)]">
      <div className="absolute top-4 right-4 z-20">
        <ThemeSelect />
      </div>
      <section
        aria-label="ข้อมูลระบบ"
        className="hidden flex-col justify-between border-r border-line bg-accent-soft px-14 py-14 lg:flex"
      >
        <div>
          <p className="eyebrow text-accent">ภาควิชาวิทยาการคอมพิวเตอร์</p>
          <p className="display mt-2 text-[20px] text-ink">Co-op Portal</p>
        </div>

        <div className="max-w-[34rem]">
          <h1 className="display text-[clamp(2.5rem,4.4vw,3.75rem)] text-ink">
            จัดการข้อมูล
            <br />
            สหกิจศึกษา
            <br />
            ไว้ในที่เดียว
          </h1>
          <div className="mt-9 grid gap-0">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="grid gap-1 border-t border-line py-4 last:border-b"
              >
                <strong className="text-[14px] font-medium text-ink">
                  {item.title}
                </strong>
                <span className="text-[13px] text-ink-muted">
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-ink-faint">
          พื้นที่จัดการข้อมูลสำหรับอาจารย์ผู้ดูแลสหกิจศึกษาเท่านั้น
        </p>
      </section>

      <section
        aria-label="เข้าสู่ระบบ"
        className="flex min-h-dvh items-center justify-center border-line bg-surface px-6 py-14 sm:px-10 lg:px-14"
      >
        <div className="w-full max-w-[24rem]">
          <p className="eyebrow text-accent lg:hidden">
            ภาควิชาวิทยาการคอมพิวเตอร์
          </p>
          <h2 className="display mt-2 text-[28px] text-ink">ยินดีต้อนรับ</h2>
          <p className="mt-2 mb-9 text-sm text-ink-muted">
            เข้าสู่ระบบด้วยบัญชีอาจารย์เพื่อจัดการข้อมูล
          </p>

          <Suspense
            fallback={
              <div className="grid min-h-52 place-items-center">
                <Spinner label="กำลังเตรียมแบบฟอร์ม" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
