import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const users = [
    {
      email: "admin@iiml.ac.in",
      name: "Estate Admin",
      department: "Estate Office",
      role: UserRole.ADMIN,
      phone: "+919876543210",
    },
    {
      email: "guard@iiml.ac.in",
      name: "Rajesh Kumar",
      department: "Security",
      role: UserRole.SECURITY_GUARD,
      phone: "+919876543211",
    },
    {
      email: "prof.sharma@iiml.ac.in",
      name: "Prof. Ananya Sharma",
      department: "Finance & Accounting",
      role: UserRole.HOST,
      phone: "+919876543212",
    },
    {
      email: "student@iiml.ac.in",
      name: "Rahul Mehta",
      department: "PGP Batch 2025",
      role: UserRole.HOST,
      phone: "+919876543213",
    },
    {
      email: "audit@iiml.ac.in",
      name: "Director Office Audit",
      department: "Director's Office",
      role: UserRole.AUDIT,
      phone: "+919876543214",
    },
    {
      email: "it@iiml.ac.in",
      name: "IT Administrator",
      department: "IT Department",
      role: UserRole.IT_ADMIN,
      phone: "+919876543215",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, passwordHash },
    });
  }

  const admin = await prisma.user.findUnique({
    where: { email: "admin@iiml.ac.in" },
  });

  if (admin) {
    await prisma.blacklist.upsert({
      where: { id: "seed-blacklist-1" },
      update: {},
      create: {
        id: "seed-blacklist-1",
        name: "Blocked Person",
        idDocumentType: "AADHAAR",
        idDocumentNumber: "123456789012",
        reason: "Previous security incident",
        addedById: admin.id,
      },
    });
  }

  await prisma.systemSetting.upsert({
    where: { key: "approval_timeout_minutes" },
    update: {},
    create: { key: "approval_timeout_minutes", value: "5" },
  });

  await prisma.systemSetting.upsert({
    where: { key: "overstay_buffer_minutes" },
    update: {},
    create: { key: "overstay_buffer_minutes", value: "30" },
  });

  console.log("Seed completed. Demo password for all users: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
