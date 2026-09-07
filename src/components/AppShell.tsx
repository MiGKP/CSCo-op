"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import {
  IconApi,
  IconBuilding,
  IconClose,
  IconHome,
  IconMenu,
  IconPlus,
  IconSignOut,
  IconUpload,
  IconUsers,
} from "./icons";
import { ThemeSelect } from "./ThemeSelect";
import { Button } from "./ui/button";
import { Tooltip } from "./ui/tooltip";

interface AppShellProps {
  username: string | null;
  children: React.ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface NavItem {
  href: string;
  label: string;
  icon: React.JSX.Element;
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "เมนูหลัก",
    items: [
      { href: "/", label: "ภาพรวม", icon: <IconHome /> },
      { href: "/companies", label: "ข้อมูลบริษัท", icon: <IconBuilding /> },
      { href: "/students", label: "บัญชีนิสิต", icon: <IconUsers /> },
      { href: "/docs", label: "เอกสาร API", icon: <IconApi /> },
      { href: "/docs", label: "เอกสาร API", icon: <IconApi /> },
    ],
  },
  {
    label: "งานด่วน",
    items: [
      { href: "/companies/new", label: "เพิ่มบริษัท", icon: <IconPlus /> },
      { href: "/students/import", label: "นำเข้านิสิต", icon: <IconUpload /> },
    ],
  },
];

export function AppShell({
  username,
  children,
}: AppShellProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isSigningOut, startSignOut] = useTransition();

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  const isActive = (href: string): boolean =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleSignOut = (): void => {
    startSignOut(async () => {
      try {
        await fetch("/api/auth/instructor/logout", { method: "POST" });
      } finally {
        router.push("/login");
        router.refresh();
      }
    });
  };

  const brand = (
    <Link href="/" className="block no-underline">
      <span className="eyebrow block text-accent">
        ภาควิชาวิทยาการคอมพิวเตอร์
      </span>
      <span className="display mt-1.5 block text-[20px] text-ink">
        Co-op Portal
      </span>
    </Link>
  );

  const navigation = (
    <nav className="grid gap-7" aria-label="เมนูระบบ">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="grid gap-1">
          <span className="eyebrow px-3 pb-1">{section.label}</span>
          {section.items.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setIsDrawerOpen(false)}
                className={`group flex items-center gap-3 border-l-2 px-3 py-2 text-[13.5px] no-underline transition-colors duration-150 ${
                  active
                    ? "border-accent bg-accent-soft font-medium text-accent"
                    : "border-transparent text-ink-muted hover:bg-raised/60 hover:text-ink"
                }`}
              >
                <span
                  className={
                    active
                      ? "text-accent"
                      : "text-ink-faint transition-colors group-hover:text-ink-muted"
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const identity = (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-raised font-mono text-[13px] text-ink-muted">
        {(username ?? "IN").slice(0, 2).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium text-ink">
          {username ?? "อาจารย์"}
        </span>
        <span className="block text-xs text-ink-faint">ผู้ดูแลระบบ</span>
      </span>
    </div>
  );

  const accountActions = (
    <div className="flex items-center gap-1.5">
      <ThemeSelect />
      <Tooltip label="ออกจากระบบ" placement="top">
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="ออกจากระบบ"
          loading={isSigningOut}
          icon={<IconSignOut />}
          onClick={handleSignOut}
        />
      </Tooltip>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-paper lg:flex">
        <div className="px-6 pt-8 pb-7">{brand}</div>
        <div className="flex-1 overflow-y-auto px-3 pb-8">{navigation}</div>
        <div className="grid gap-3 border-t border-line px-4 py-4">
          {identity}
          <div className="flex justify-between">
            <span className="self-center font-mono text-[11px] text-ink-faint">
              v0.1.0
            </span>
            {accountActions}
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur-sm lg:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label="เปิดเมนู"
              aria-expanded={isDrawerOpen}
              icon={<IconMenu />}
              onClick={() => setIsDrawerOpen(true)}
            />
            <Link href="/" className="display text-[17px] text-ink no-underline">
              Co-op Portal
            </Link>
          </div>
          {accountActions}
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-[78rem]">{children}</div>
        </main>

        <footer className="border-t border-line px-5 py-5 text-xs text-ink-faint sm:px-8 lg:px-12">
          CS Co-op Instructor Portal — ภาควิชาวิทยาการคอมพิวเตอร์
        </footer>
      </div>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="ปิดเมนู"
            className="absolute inset-0 h-full w-full cursor-default bg-ink/35"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative flex h-full w-[17.5rem] max-w-[85vw] flex-col border-r border-line bg-paper">
            <div className="flex items-start justify-between gap-3 px-5 pt-6 pb-6">
              {brand}
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label="ปิดเมนู"
                icon={<IconClose />}
                onClick={() => setIsDrawerOpen(false)}
              />
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-6">{navigation}</div>
            <div className="grid gap-3 border-t border-line px-4 py-4">
              {identity}
              <ThemeSelect />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
