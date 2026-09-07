import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans_Thai,
  Noto_Serif_Thai,
} from "next/font/google";
import "./globals.css";
import React from "react";
import { AppShell } from "@/components/AppShell";
import { verifyInstructorSessionToken } from "@/lib/instructor-auth";

const display = Noto_Serif_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const code = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบอาจารย์ - จัดการข้อมูลฝึกงานและรหัสนิสิต (CS Co-op Portal)",
  description:
    "ระบบสำหรับอาจารย์: สร้างบัญชีรหัสนิสิต และกรอกข้อมูลบริษัท/ตำแหน่งที่รุ่นพี่เคยยื่น เพื่อส่งต่อไปยังเว็บนิสิต",
};

/**
 * Applies the saved theme before first paint so the page never renders in the
 * wrong palette and then swaps. Kept inline and dependency-free on purpose.
 */
const THEME_BOOTSTRAP = `(function(){try{var k='coop-instructor-theme';var t=localStorage.getItem(k);if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t}catch(e){}})();`;

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({
  children,
}: RootLayoutProps): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("instructor_session")?.value;
  const session = await verifyInstructorSessionToken(sessionToken);

  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${code.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="font-sans antialiased">
        {session.valid ? (
          <AppShell username={session.username}>{children}</AppShell>
        ) : (
          <div className="min-h-dvh">{children}</div>
        )}
      </body>
    </html>
  );
}
