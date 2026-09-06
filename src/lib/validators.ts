import { z } from "zod";

/**
 * Regex ensuring student ID consists purely of digits (8 to 15 digits).
 * Matches patterns like '66011212222'.
 */
export const studentIdRegex = /^\d{8,15}$/;

export const singleStudentImportSchema = z.object({
  studentId: z
    .string()
    .trim()
    .regex(studentIdRegex, {
      message: "รหัสนิสิตต้องเป็นตัวเลขล้วน ความยาวระหว่าง 8 - 15 หลัก (เช่น 66011212222)",
    }),
});

export const batchStudentImportSchema = z.object({
  rawInput: z.string().min(1, { message: "กรุณาระบุรหัสนิสิตอย่างน้อย 1 รายการ" }),
});

export const companySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "กรุณาระบุชื่อบริษัท" })
    .max(200, { message: "ชื่อบริษัทต้องไม่เกิน 200 ตัวอักษร" }),
  province: z
    .string()
    .trim()
    .min(1, { message: "กรุณาเลือกหรือระบุจังหวัดของบริษัท" }),
  position: z
    .string()
    .trim()
    .min(1, { message: "กรุณาระบุตำแหน่งที่เคยเปิดรับหรือรุ่นพี่เคยยื่น" })
    .max(300, { message: "ตำแหน่งต้องไม่เกิน 300 ตัวอักษร" }),
  address: z
    .string()
    .trim()
    .min(1, { message: "กรุณาระบุที่อยู่ของบริษัท" }),
  detail: z.string().trim().optional(),
});

export interface ParseStudentIdsResult {
  validIds: string[];
  invalidLines: string[];
}

/**
 * Parses raw input containing student IDs separated by newlines, commas, or spaces.
 * Cleans each entry, validates against the numeric format, and deduplicates.
 * 
 * @param raw - Multiline or delimited string of student IDs
 * @returns Object with array of valid unique IDs and invalid raw entries
 */
export function parseAndValidateStudentIds(raw: string): ParseStudentIdsResult {
  const tokens = raw
    .split(/[\r\n,;\t\s]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const validSet = new Set<string>();
  const invalidLines: string[] = [];

  for (const token of tokens) {
    if (studentIdRegex.test(token)) {
      validSet.add(token);
    } else {
      invalidLines.push(token);
    }
  }

  return {
    validIds: Array.from(validSet),
    invalidLines,
  };
}
