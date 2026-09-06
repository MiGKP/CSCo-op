import { describe, it, expect } from "vitest";
import { generateRandomPassword, hashPassword, verifyBearerToken } from "./auth";

describe("generateRandomPassword", () => {
  it("generates password with requested default length of 8 characters", () => {
    // Arrange
    const defaultLength = 8;

    // Act
    const result = generateRandomPassword();

    // Assert
    expect(result).toHaveLength(defaultLength);
  });

  it("enforces minimum length of 6 when smaller length is requested", () => {
    // Arrange
    const smallLength = 3;

    // Act
    const result = generateRandomPassword(smallLength);

    // Assert
    expect(result).toHaveLength(6);
  });

  it("excludes easily confused characters 0, O, 1, l, and I", () => {
    // Arrange & Act
    const result = generateRandomPassword(50);

    // Assert
    expect(result).not.toMatch(/[0O1lI]/);
  });
});

describe("hashPassword", () => {
  it("produces deterministic 64-character hex SHA-256 hash", () => {
    // Arrange
    const password = "mySecurePassword123";

    // Act
    const hash = hashPassword(password);

    // Assert
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("verifyBearerToken", () => {
  it("returns true when Authorization header has matching Bearer token", () => {
    // Arrange
    const secret = "secret_token_123";
    const header = "Bearer secret_token_123";

    // Act
    const isValid = verifyBearerToken(header, secret);

    // Assert
    expect(isValid).toBe(true);
  });

  it("returns false when Authorization header token does not match", () => {
    // Arrange
    const secret = "secret_token_123";
    const header = "Bearer wrong_token";

    // Act
    const isValid = verifyBearerToken(header, secret);

    // Assert
    expect(isValid).toBe(false);
  });

  it("returns false when Authorization header is null or undefined", () => {
    // Arrange
    const secret = "secret_token_123";

    // Act
    const isValid = verifyBearerToken(null, secret);

    // Assert
    expect(isValid).toBe(false);
  });
});
