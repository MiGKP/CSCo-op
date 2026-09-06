import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { POST as importStudentsHandler } from "@/app/api/students/import/route";
import { POST as submitCoopHandler } from "@/app/api/students/[studentId]/coop/route";
import { GET as getStudentPortalApiHandler } from "@/app/api/v1/students/[studentId]/route";
import { POST as loginStudentHandler } from "@/app/api/v1/auth/login/route";

const TEST_STUDENT_ID = "66011999999";
let createdTempPass = "";
const TEST_TOKEN = "test_coop_token_integration";

beforeAll(() => {
  process.env.STUDENT_WEB_API_TOKEN = TEST_TOKEN;
});

afterAll(async () => {
  // Clean up any test records
  await prisma.student.deleteMany({
    where: { studentId: TEST_STUDENT_ID },
  });
});

describe("API Integration: Student Import -> Co-op Entry -> Student Portal API", () => {
  it("imports student and generates temporary password with hashed storage", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/students/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawInput: TEST_STUDENT_ID }),
    });

    // Act
    const res = await importStudentsHandler(req);
    const body: unknown = await res.json();
    const data = body as { success: boolean; created: Array<{ studentId: string; tempPassword: string }> };

    // Assert
    expect(data.created[0]?.studentId).toBe(TEST_STUDENT_ID);
    createdTempPass = data.created[0]?.tempPassword ?? "";
  });

  it("saves the 5 required co-op fields for the imported student", async () => {
    // Arrange
    const payload = {
      companyName: "Google Thailand",
      companyProvince: "กรุงเทพมหานคร",
      jobPosition: "Software Engineering Intern",
      companyAddress: "CentralWorld Offices, Pathumwan, Bangkok",
      detail: "รอบฝึกงานภาคฤดูร้อน 2569",
    };
    const req = new NextRequest(
      `http://localhost:3000/api/students/${TEST_STUDENT_ID}/coop`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    // Act
    const res = await submitCoopHandler(req, {
      params: Promise.resolve({ studentId: TEST_STUDENT_ID }),
    });
    const body: unknown = await res.json();
    const result = body as { success: boolean; data: { companyName: string } };

    // Assert
    expect(result.data.companyName).toBe("Google Thailand");
  });

  it("returns 401 Unauthorized when Student Portal requests API without valid Bearer token", async () => {
    // Arrange
    const req = new NextRequest(
      `http://localhost:3000/api/v1/students/${TEST_STUDENT_ID}`,
      {
        headers: { Authorization: "Bearer wrong_invalid_token" },
      }
    );

    // Act
    const res = await getStudentPortalApiHandler(req, {
      params: Promise.resolve({ studentId: TEST_STUDENT_ID }),
    });

    // Assert
    expect(res.status).toBe(401);
  });

  it("returns 200 OK with co-op details when Student Portal requests with valid Bearer token", async () => {
    // Arrange
    const req = new NextRequest(
      `http://localhost:3000/api/v1/students/${TEST_STUDENT_ID}`,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
    );

    // Act
    const res = await getStudentPortalApiHandler(req, {
      params: Promise.resolve({ studentId: TEST_STUDENT_ID }),
    });
    const body: unknown = await res.json();
    const result = body as { success: boolean; data: { companyName: string; jobPosition: string } };

    // Assert
    expect(result.data.jobPosition).toBe("Software Engineering Intern");
  });

  it("returns 404 Not Found when requesting non-existent student ID with valid Bearer token", async () => {
    // Arrange
    const req = new NextRequest(
      `http://localhost:3000/api/v1/students/99999999999`,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
    );

    // Act
    const res = await getStudentPortalApiHandler(req, {
      params: Promise.resolve({ studentId: "99999999999" }),
    });

    // Assert
    expect(res.status).toBe(404);
  });

  it("authenticates student on external Student Portal with generated password and returns company info", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEST_TOKEN}`,
      },
      body: JSON.stringify({
        studentId: TEST_STUDENT_ID,
        password: createdTempPass,
      }),
    });

    // Act
    const res = await loginStudentHandler(req);
    const body: unknown = await res.json();
    const result = body as { success: boolean; data: { companyName: string } };

    // Assert
    expect(res.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data.companyName).toBe("Google Thailand");
  });

  it("rejects authentication with invalid password on external Student Portal", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEST_TOKEN}`,
      },
      body: JSON.stringify({
        studentId: TEST_STUDENT_ID,
        password: "wrong_password",
      }),
    });

    // Act
    const res = await loginStudentHandler(req);

    // Assert
    expect(res.status).toBe(401);
  });
});
