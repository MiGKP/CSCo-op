import { DashboardOverview } from "./DashboardOverview";
import { prisma } from "@/lib/prisma";
import React from "react";

export const dynamic = "force-dynamic";

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const [totalStudents, totalCompanies] = await Promise.all([
    prisma.student.count(),
    prisma.company.count(),
  ]);

  return (
    <DashboardOverview
      totalStudents={totalStudents}
      totalCompanies={totalCompanies}
    />
  );
}
