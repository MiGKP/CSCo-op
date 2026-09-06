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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
