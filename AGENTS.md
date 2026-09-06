# AGENTS.md

## Project Overview
CS Co-op Instructor Portal (ระบบบริหารข้อมูลการฝึกสหกิจศึกษาภาควิชาวิทยาการคอมพิวเตอร์ สำหรับอาจารย์)
Next.js 15 (App Router), TypeScript strict, Tailwind CSS, Prisma ORM, PostgreSQL (Neon ready) / SQLite local fallback.

## Coding Standards
1. Think before code (problem, simplest solution, edge cases).
2. No placeholder code (TODO/FIXME forbidden in final output).
3. Explain non-obvious design decisions in brief comments.
4. TypeScript Strictness:
   - Explicit return types on all functions
   - Avoid `any`, use `unknown` + narrowing
   - Prefer `interface` over `type` for object shapes
   - Strict null checks
5. API Standards:
   - Validate input with Zod
   - Error format: `{ error: string, code: string }`
   - Never leak internal stack traces
   - Document request/response shapes
6. Caveman tone for communication: short, dense, no filler.
