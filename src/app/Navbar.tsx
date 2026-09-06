"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
  isLoggedIn: boolean;
  username: string | null;
}

export function Navbar({ isLoggedIn, username }: NavbarProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async (): Promise<void> => {
    startTransition(async () => {
      try {
        await fetch("/api/auth/instructor/logout", {
          method: "POST",
        });
        router.push("/login");
        router.refresh();
      } catch {
        router.push("/login");
      }
    });
  };

  return (
    <header className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="text-xl font-bold tracking-tight hover:text-blue-100">
            CS Co-op Portal
          </Link>
          <span className="text-xs bg-blue-700 text-blue-100 px-2 py-0.5 rounded font-mono">
            อาจารย์
          </span>
        </div>

        {isLoggedIn ? (
          <nav className="flex items-center space-x-1 sm:space-x-3 text-sm font-medium">
            <Link
              href="/"
              className="px-3 py-2 rounded-md hover:bg-blue-800 transition-colors"
            >
              หน้าหลัก
            </Link>
            <Link
              href="/companies"
              className="px-3 py-2 rounded-md hover:bg-blue-800 transition-colors"
            >
              รายการบริษัท
            </Link>
            <Link
              href="/companies/new"
              className="px-3 py-2 rounded-md bg-blue-800 hover:bg-blue-700 transition-colors text-xs"
            >
              + เพิ่มบริษัท
            </Link>
            <Link
              href="/students"
              className="px-3 py-2 rounded-md hover:bg-blue-800 transition-colors"
            >
              บัญชีนิสิต
            </Link>
            <Link
              href="/students/import"
              className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-xs"
            >
              + นำเข้านิสิต
            </Link>

            <div className="h-4 w-px bg-blue-700 mx-1 hidden sm:block" />

            <div className="flex items-center space-x-2 pl-1">
              <span className="text-xs text-blue-200 hidden md:inline font-mono">
                {username}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPending}
                className="px-2.5 py-1.5 text-xs font-semibold bg-rose-600/80 hover:bg-rose-600 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {isPending ? "..." : "ออกจากระบบ"}
              </button>
            </div>
          </nav>
        ) : (
          <div className="text-xs text-blue-200">
            เข้าสู่ระบบเพื่อจัดการข้อมูล
          </div>
        )}
      </div>
    </header>
  );
}
