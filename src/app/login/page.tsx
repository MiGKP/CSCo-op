"use client";

import React, { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/instructor/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim(),
          }),
        });

        const data: unknown = await res.json();

        if (!res.ok) {
          const errData = data as { error?: string };
          setErrorMsg(errData.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
          return;
        }

        router.push(redirectTo);
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ";
        setErrorMsg(message);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start space-x-2">
          <span className="font-bold">&#9888;</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-xs font-semibold uppercase text-slate-600 mb-1"
          >
            ชื่อผู้ใช้ (Username)
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            placeholder="เช่น admin"
            className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase text-slate-600"
            >
              รหัสผ่าน (Password)
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              {showPassword ? "ซ่อน" : "แสดง"}
            </button>
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="กรอกรหัสผ่าน"
            className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2 mt-2"
        >
          {isPending ? <span>กำลังเข้าสู่ระบบ...</span> : <span>เข้าสู่ระบบ</span>}
        </button>
      </form>

      {/* Preset Credentials Box */}
      <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700">บัญชีเริ่มต้นสำหรับทดสอบ:</span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
          >
            คลิกใส่ข้อมูลอัตโนมัติ
          </button>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 flex justify-between">
          <span>User: <strong>admin</strong></span>
          <span>Pass: <strong>coop2026pass</strong></span>
        </div>
      </div>
    </div>
  );
}

export default function InstructorLoginPage(): React.JSX.Element {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-900 text-white shadow-md mb-2">
            <span className="font-bold text-xl font-mono">CS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            เข้าสู่ระบบสำหรับอาจารย์
          </h1>
          <p className="text-xs text-slate-500">
            ระบบจัดการข้อมูลการฝึกงานและบัญชีผู้ใช้นิสิต (CS Co-op Portal)
          </p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">กำลังโหลด...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
