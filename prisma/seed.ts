import { prisma } from "../src/lib/prisma";
import { generateRandomPassword, hashPassword } from "../src/lib/auth";

async function main(): Promise<void> {
  console.log("Seeding initial CS co-op data...");

  // 1. Clean existing seed data
  await prisma.student.deleteMany({
    where: {
      studentId: {
        in: ["66011212222", "66011212223", "66011212224"],
      },
    },
  });

  await prisma.company.deleteMany({});

  // 2. Create student accounts (User & Random Passwords)
  const pass1 = generateRandomPassword(8);
  const pass2 = generateRandomPassword(8);
  const pass3 = generateRandomPassword(8);

  await prisma.student.createMany({
    data: [
      {
        studentId: "66011212222",
        passwordHash: hashPassword(pass1),
        tempPassword: pass1,
      },
      {
        studentId: "66011212223",
        passwordHash: hashPassword(pass2),
        tempPassword: pass2,
      },
      {
        studentId: "66011212224",
        passwordHash: hashPassword(pass3),
        tempPassword: pass3,
      },
    ],
  });

  // 3. Create independent Company directory (5 fields for students to browse)
  await prisma.company.createMany({
    data: [
      {
        name: "บริษัท สยาม อินโนเวชั่น จำกัด (มหาชน)",
        province: "กรุงเทพมหานคร",
        position: "Software Engineer, Frontend Developer, Backend Trainee",
        address: "123 อาคารสาทรซิตี้ทาวเวอร์ ชั้น 18 ถนนสาทรใต้ แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพฯ 10120",
        detail: "เบี้ยเลี้ยง 600 บาท/วัน, มีอุปกรณ์โน้ตบุ๊กให้, เข้าออฟฟิศแบบ Hybrid สัปดาห์ละ 2 วัน",
      },
      {
        name: "Eastern Tech Logistics Co., Ltd.",
        province: "ชลบุรี",
        position: "Data Engineer Trainee, Cloud Associate, QA Tester",
        address: "88/1 หมู่ 5 นิคมอุตสาหกรรมแหลมฉบัง ตำบลทุ่งสุขลา อำเภอศรีราชา จังหวัดชลบุรี 20230",
        detail: "มีรถรับส่งพนักงานและหอพักใกล้เคียง แนะนำสำหรับนิสิตสนใจด้าน Cloud และ Data",
      },
      {
        name: "Lanna Creative Digital Co., Ltd.",
        province: "เชียงใหม่",
        position: "Mobile App Developer (Flutter/iOS), Full Stack Trainee",
        address: "456/7 ถนนนิมมานเหมินท์ ซอย 9 ตำบลสุเทพ อำเภอเมือง จังหวัดเชียงใหม่ 50200",
        detail: "ทำงานแบบ Remote เป็นหลัก บรรยากาศแบบ Startup รุ่นพี่ชมว่าพี่เลี้ยงดูแลดีมาก",
      },
    ],
  });

  console.log("Seed completed successfully!");
  console.log(`Student 1: 66011212222 (Pass: ${pass1})`);
  console.log(`Student 2: 66011212223 (Pass: ${pass2})`);
  console.log(`Student 3: 66011212224 (Pass: ${pass3})`);
  console.log("Companies seeded: 3 companies");
}

main()
  .catch((e: unknown) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
