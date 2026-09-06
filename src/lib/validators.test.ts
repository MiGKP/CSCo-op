import { describe, it, expect } from "vitest";
import {
  parseAndValidateStudentIds,
  companySchema,
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

describe("companySchema", () => {
  it("accepts complete valid 5-field company payload", () => {
    // Arrange
    const payload = {
      name: "Acme Tech Thailand",
      province: "กรุงเทพมหานคร",
      position: "Software Engineer, Frontend Developer",
      address: "123 Sukhumvit Road, Bangkok",
      detail: "สวัสดิการดี มีพี่เลี้ยงดูแล",
    };

    // Act
    const result = companySchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(true);
  });

  it("rejects payload when company name is empty", () => {
    // Arrange
    const payload = {
      name: "",
      province: "กรุงเทพมหานคร",
      position: "Frontend Intern",
      address: "Bangkok",
    };

    // Act
    const result = companySchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(false);
  });

  it("allows detail field to be omitted", () => {
    // Arrange
    const payload = {
      name: "Acme Tech Thailand",
      province: "เชียงใหม่",
      position: "Backend Intern",
      address: "456 Nimman Road, Chiang Mai",
    };

    // Act
    const result = companySchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(true);
  });
});
