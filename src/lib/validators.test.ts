import { describe, it, expect } from "vitest";
import {
  parseAndValidateStudentIds,
  coopRecordSchema,
  singleStudentImportSchema,
} from "./validators";

describe("singleStudentImportSchema", () => {
  it("accepts valid 11-digit numeric student ID", () => {
    // Arrange
    const input = { studentId: "66011212222" };

    // Act
    const result = singleStudentImportSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  it("rejects student ID containing alphabetic characters", () => {
    // Arrange
    const input = { studentId: "66011212ABC" };

    // Act
    const result = singleStudentImportSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });

  it("rejects student ID that is too short", () => {
    // Arrange
    const input = { studentId: "1234" };

    // Act
    const result = singleStudentImportSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });
});

describe("parseAndValidateStudentIds", () => {
  it("extracts unique valid IDs from newline and comma delimited input", () => {
    // Arrange
    const rawInput = "66011212222\n66011212223, 66011212222\n66011212224";

    // Act
    const parsed = parseAndValidateStudentIds(rawInput);

    // Assert
    expect(parsed.validIds).toEqual([
      "66011212222",
      "66011212223",
      "66011212224",
    ]);
  });

  it("separates invalid strings into invalidLines array", () => {
    // Arrange
    const rawInput = "66011212222\ninvalid_id\n66011212223";

    // Act
    const parsed = parseAndValidateStudentIds(rawInput);

    // Assert
    expect(parsed.invalidLines).toEqual(["invalid_id"]);
  });
});

describe("coopRecordSchema", () => {
  it("accepts complete valid 5-field co-op payload", () => {
    // Arrange
    const payload = {
      companyName: "Acme Tech Thailand",
      companyProvince: "กรุงเทพมหานคร",
      jobPosition: "Software Engineer Intern",
      companyAddress: "123 Sukhumvit Road, Bangkok",
      detail: "ผ่านการสัมภาษณ์รอบสุดท้าย",
    };

    // Act
    const result = coopRecordSchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(true);
  });

  it("rejects payload when company name is empty string", () => {
    // Arrange
    const payload = {
      companyName: "",
      companyProvince: "กรุงเทพมหานคร",
      jobPosition: "Frontend Intern",
      companyAddress: "Bangkok",
    };

    // Act
    const result = coopRecordSchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(false);
  });

  it("allows detail field to be omitted", () => {
    // Arrange
    const payload = {
      companyName: "Acme Tech Thailand",
      companyProvince: "เชียงใหม่",
      jobPosition: "Backend Intern",
      companyAddress: "456 Nimman Road, Chiang Mai",
    };

    // Act
    const result = coopRecordSchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(true);
  });
});
