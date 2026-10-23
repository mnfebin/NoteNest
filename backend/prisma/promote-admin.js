import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function promoteAdmin() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.error("❌ Usage: node prisma/promote-admin.js <email>");
    console.error("👉 Example: node prisma/promote-admin.js alex.rivera@college.edu");
    process.exit(1);
  }

  const cleanEmail = targetEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail }
  });

  if (!user) {
    console.error(`❌ User with email "${cleanEmail}" was not found in the database.`);
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`ℹ️ User "${user.name}" (${user.email}) is already an ADMIN.`);
    process.exit(0);
  }

  const updated = await prisma.user.update({
    where: { email: cleanEmail },
    data: { role: "ADMIN" }
  });

  console.log(`✅ Success! User "${updated.name}" (${updated.email}) has been promoted to ADMIN.`);
}

promoteAdmin()
  .catch((e) => {
    console.error("❌ Error promoting user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
