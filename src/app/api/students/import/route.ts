import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateRandomPassword, hashPassword } from "@/lib/auth";
import { parseAndValidateStudentIds } from "@/lib/validators";

interface CreatedStudentResult {
  studentId: string;
  tempPassword: string;
}

interface ImportResponseData {
  success: true;
  totalImported: number;
  created: CreatedStudentResult[];
  skipped: string[];
  invalid: string[];
}

interface ErrorResponseData {
  error: string;
  code: string;
}

const importRequestSchema = z.object({
  studentIds: z.array(z.string()).optional(),
  rawInput: z.string().optional(),
});

/**
 * POST /api/students/import
 * 
 * Imports students by their student IDs. Generates a random temporary password
 * and securely stores the hash along with the plaintext temporary password for instructor distribution.
 * 
 * Request: { rawInput?: string; studentIds?: string[] }
 * Success: 200 { success: true, totalImported: number, created: [...], skipped: [...], invalid: [...] }
 * Error: 400 | 500 { error: string, code: string }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ImportResponseData | ErrorResponseData>> {
  try {
    const rawBody: unknown = await request.json();
    const parseResult = importRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "ข้อมูลนำเข้าไม่ถูกต้อง: " + parseResult.error.issues.map((i) => i.message).join(", "),
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { rawInput, studentIds: explicitIds } = parseResult.data;

    let targetIds: string[] = [];
    let invalidEntries: string[] = [];

    if (rawInput) {
      const parsed = parseAndValidateStudentIds(rawInput);
      targetIds = parsed.validIds;
      invalidEntries = parsed.invalidLines;
    } else if (explicitIds && explicitIds.length > 0) {
      const parsed = parseAndValidateStudentIds(explicitIds.join("\n"));
      targetIds = parsed.validIds;
      invalidEntries = parsed.invalidLines;
    }

    if (targetIds.length === 0 && invalidEntries.length === 0) {
      return NextResponse.json(
        {
          error: "กรุณาระบุรหัสนิสิตอย่างน้อย 1 รายการ",
          code: "EMPTY_INPUT",
        },
        { status: 400 }
      );
    }

    // Identify already existing students to avoid duplicate conflict crashes
    const existingRecords = await prisma.student.findMany({
      where: {
        studentId: {
          in: targetIds,
        },
      },
      select: {
        studentId: true,
      },
    });

    const existingIdSet = new Set<string>(existingRecords.map((r) => r.studentId));
    const idsToCreate = targetIds.filter((id) => !existingIdSet.has(id));
    const skippedIds = targetIds.filter((id) => existingIdSet.has(id));

    const createdList: CreatedStudentResult[] = [];

    // Create student records with auto-generated passwords
    for (const studentId of idsToCreate) {
      const randomPass = generateRandomPassword(8);
      const passwordHash = hashPassword(randomPass);

      await prisma.student.create({
        data: {
          studentId,
          passwordHash,
          tempPassword: randomPass,
        },
      });

      createdList.push({
        studentId,
        tempPassword: randomPass,
      });
    }

    return NextResponse.json({
      success: true,
      totalImported: createdList.length,
      created: createdList,
      skipped: skippedIds,
      invalid: invalidEntries,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการนำเข้านิสิต";
    return NextResponse.json(
      {
        error: message,
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
