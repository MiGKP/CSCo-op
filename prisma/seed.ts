import { PrismaClient } from "@prisma/client";
import { generateRandomPassword, hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("Seeding initial CS co-op data...");

  // Clean existing seed if any
  await prisma.student.deleteMany({
    where: {
      studentId: {
        in: ["66011212222", "66011212223", "66011212224"],
      },
    },
  });

  const pass1 = generateRandomPassword(8);
  const pass2 = generateRandomPassword(8);
  const pass3 = generateRandomPassword(8);

  // Student 1: With complete 5-field co-op record (as requested in prompt example)
  const student1 = await prisma.student.create({
    data: {
      studentId: "66011212222",
      passwordHash: hashPassword(pass1),
      tempPassword: pass1,
      coopRecord: {
        create: {
          companyName: "บริษัท สยาม อินโนเวชั่น จำกัด (มหาชน)",
          companyProvince: "กรุงเทพมหานคร",
          jobPosition: "Software Engineer, Frontend Developer, Backend Trainee",
          companyAddress: "123 อาคารสาทรซิตี้ทาวเวอร์ ชั้น 18 ถนนสาทรใต้ แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพฯ 10120",
          detail: "ผ่านการสัมภาษณ์รอบสุดท้าย เริ่มงาน 1 มิ.ย. 2569 มีเบี้ยเลี้ยงวันละ 600 บาท และมีโน้ตบุ๊กสำหรับการทำงาน",
        },
      },
    },
  });

  // Student 2: With co-op record in Chonburi
  await prisma.student.create({
    data: {
      studentId: "66011212223",
      passwordHash: hashPassword(pass2),
      tempPassword: pass2,
      coopRecord: {
        create: {
          companyName: "Eastern Tech Logistics Co., Ltd.",
          companyProvince: "ชลบุรี",
          jobPosition: "Data Engineer Trainee, Cloud Associate, QA Tester",
          companyAddress: "88/1 หมู่ 5 นิคมอุตสาหกรรมแหลมฉบัง ตำบลทุ่งสุขลา อำเภอศรีราชา จังหวัดชลบุรี 20230",
          detail: "ปฏิบัติงานแบบ Hybrid เข้าออฟฟิศสัปดาห์ละ 3 วัน",
        },
      },
    },
  });

  // Student 3: Pending co-op form filling
  await prisma.student.create({
    data: {
      studentId: "66011212224",
      passwordHash: hashPassword(pass3),
      tempPassword: pass3,
    },
  });

  console.log("Seed completed successfully!");
  console.log(`Student 1: 66011212222 (Pass: ${pass1}) [Co-op Filled]`);
  console.log(`Student 2: 66011212223 (Pass: ${pass2}) [Co-op Filled]`);
  console.log(`Student 3: 66011212224 (Pass: ${pass3}) [Co-op Pending]`);
}

main()
  .catch((e: unknown) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
