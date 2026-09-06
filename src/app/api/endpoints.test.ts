import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { POST as importStudentsHandler } from "@/app/api/students/import/route";
import { POST as loginStudentHandler } from "@/app/api/v1/auth/login/route";
import { POST as createCompanyHandler } from "@/app/api/companies/route";
import { GET as getCompaniesForStudentWebHandler } from "@/app/api/v1/companies/route";
import { POST as instructorLoginHandler } from "@/app/api/auth/instructor/login/route";
import { POST as instructorLogoutHandler } from "@/app/api/auth/instructor/logout/route";

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
  await prisma.company.deleteMany({
    where: { name: "Test Corp Ltd." },
  });
});

describe("CS Co-op Portal Integration", () => {
  it("imports student ID and generates random password", async () => {
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
    expect(res.status).toBe(200);
    expect(data.created[0]?.studentId).toBe(TEST_STUDENT_ID);
    expect(data.created[0]?.tempPassword).toBeDefined();
    createdTempPass = data.created[0]?.tempPassword ?? "";
  });

  it("authenticates student on external Student Portal with student ID and random password", async () => {
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
    const result = body as { success: boolean; data: { studentId: string } };

    // Assert
    expect(res.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data.studentId).toBe(TEST_STUDENT_ID);
  });

  it("allows instructor to create an independent company directory record (5 fields)", async () => {
    // Arrange
    const companyPayload = {
      name: "Test Corp Ltd.",
      province: "กรุงเทพมหานคร",
      position: "Software Engineer, DevOps Trainee",
      address: "123 Test Avenue, Bangkok",
      detail: "สวัสดิการดี",
    };

    const req = new NextRequest("http://localhost:3000/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyPayload),
    });

    // Act
    const res = await createCompanyHandler(req);
    const body: unknown = await res.json();
    const result = body as { success: boolean; data: { name: string; position: string } };

    // Assert
    expect(res.status).toBe(200);
    expect(result.data.name).toBe("Test Corp Ltd.");
    expect(result.data.position).toBe("Software Engineer, DevOps Trainee");
  });

  it("serves company directory to external student web via GET /api/v1/companies with Bearer token", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/companies", {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` },
    });

    // Act
    const res = await getCompaniesForStudentWebHandler(req);
    const body: unknown = await res.json();
    const result = body as { success: boolean; data: Array<{ name: string; position: string }> };

    // Assert
    expect(res.status).toBe(200);
    expect(result.success).toBe(true);
    const found = result.data.find((c) => c.name === "Test Corp Ltd.");
    expect(found).toBeDefined();
    expect(found?.position).toBe("Software Engineer, DevOps Trainee");
  });

  it("rejects unauthorized external requests without Bearer token", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/companies", {
      headers: { Authorization: "Bearer wrong_token" },
    });

    // Act
    const res = await getCompaniesForStudentWebHandler(req);

    // Assert
    expect(res.status).toBe(401);
  });

  it("authenticates instructor with valid credentials and sets session cookie", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/auth/instructor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "admin",
        password: "coop2026pass",
      }),
    });

    // Act
    const res = await instructorLoginHandler(req);
    const body: unknown = await res.json();
    const result = body as { success: boolean };

    // Assert
    expect(res.status).toBe(200);
    expect(result.success).toBe(true);
    expect(res.cookies.get("instructor_session")?.value).toBeDefined();
  });

  it("rejects instructor login with invalid credentials", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/auth/instructor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "admin",
        password: "wrong_password",
      }),
    });

    // Act
    const res = await instructorLoginHandler(req);

    // Assert
    expect(res.status).toBe(401);
  });

  it("logs out instructor and clears session cookie", async () => {
    // Act
    const res = await instructorLogoutHandler();
    const body: unknown = await res.json();
    const result = body as { success: boolean };

    // Assert
    expect(res.status).toBe(200);
    expect(result.success).toBe(true);
    expect(res.cookies.get("instructor_session")?.value).toBe("");
  });
});
