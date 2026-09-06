import { describe, it, expect } from "vitest";
import {
  createInstructorSessionToken,
  verifyInstructorSessionToken,
  checkInstructorCredentials,
} from "./instructor-auth";

describe("Instructor Auth utilities", () => {
  it("validates correct instructor credentials against configured env", () => {
    // Arrange
    const username = process.env.INSTRUCTOR_USERNAME || "admin";
    const password = process.env.INSTRUCTOR_PASSWORD || "coop2026pass";

    // Act
    const isValid = checkInstructorCredentials(username, password);

    // Assert
    expect(isValid).toBe(true);
  });

  it("rejects invalid instructor credentials", () => {
    // Arrange & Act
    const isValid = checkInstructorCredentials("wrong_user", "wrong_pass");

    // Assert
    expect(isValid).toBe(false);
  });

  it("creates and verifies a valid signed session token", async () => {
    // Arrange
    const username = "admin";

    // Act
    const token = await createInstructorSessionToken(username);
    const result = await verifyInstructorSessionToken(token);

    // Assert
    expect(result.valid).toBe(true);
    expect(result.username).toBe(username);
  });

  it("rejects tampered session token", async () => {
    // Arrange
    const username = "admin";
    const token = await createInstructorSessionToken(username);
    const tamperedToken = token.slice(0, -4) + "XXXX";

    // Act
    const result = await verifyInstructorSessionToken(tamperedToken);

    // Assert
    expect(result.valid).toBe(false);
  });

  it("rejects empty or null session token", async () => {
    // Arrange & Act
    const resultNull = await verifyInstructorSessionToken(null);
    const resultEmpty = await verifyInstructorSessionToken("");

    // Assert
    expect(resultNull.valid).toBe(false);
    expect(resultEmpty.valid).toBe(false);
  });
});
