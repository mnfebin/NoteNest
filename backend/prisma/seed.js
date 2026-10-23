import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting NoteNest database seeding...");

  // 1. Clean existing records if resetting
  await prisma.report.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🧹 Cleaned existing tables.");

  // 2. Hash common passwords
  const adminPasswordHash = await bcrypt.hash("AdminPass2026!", 10);
  const studentPasswordHash = await bcrypt.hash("StudentPass2026!", 10);

  // 3. Create Administrator User
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin Reviewer",
      email: "admin@notenest.edu",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      semester: 4,
      branch: "Computer Science & Engineering",
      college: "National Institute of Technology",
      studentId: "ADM-2026-001"
    }
  });

  // 4. Create Main Student User (matching frontend default profile: Alex Rivera)
  const alexUser = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "alex.rivera@college.edu",
      passwordHash: studentPasswordHash,
      role: "USER",
      semester: 4,
      branch: "Computer Science & Engineering",
      college: "National Institute of Technology",
      studentId: "CSE-2024-082"
    }
  });

  // 5. Create Additional Peer Student Contributors
  const aarav = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "aarav.sharma@college.edu",
      passwordHash: studentPasswordHash,
      role: "USER",
      semester: 4,
      branch: "Computer Science & Engineering",
      college: "National Institute of Technology",
      studentId: "CSE-2024-014"
    }
  });

  const priya = await prisma.user.create({
    data: {
      name: "Priya Nair",
      email: "priya.nair@college.edu",
      passwordHash: studentPasswordHash,
      role: "USER",
      semester: 4,
      branch: "Computer Science & Engineering",
      college: "National Institute of Technology",
      studentId: "CSE-2024-045"
    }
  });

  const rohan = await prisma.user.create({
    data: {
      name: "Rohan Varma",
      email: "rohan.varma@college.edu",
      passwordHash: studentPasswordHash,
      role: "USER",
      semester: 3,
      branch: "Computer Science & Engineering",
      college: "National Institute of Technology",
      studentId: "CSE-2024-061"
    }
  });

  const sneha = await prisma.user.create({
    data: {
      name: "Sneha Mukherjee",
      email: "sneha.m@college.edu",
      passwordHash: studentPasswordHash,
      role: "USER",
      semester: 5,
      branch: "Computer Science & Engineering",
      college: "National Institute of Technology",
      studentId: "CSE-2023-089"
    }
  });

  console.log("👤 Created 6 seed user accounts (1 Admin, 5 Students).");

  // 6. Create Approved Study Notes (matching curriculum in frontend dataset)
  const note1 = await prisma.note.create({
    data: {
      title: "DBMS Unit 1 — Introduction to Databases & ER Modeling",
      description: "Comprehensive handwritten revision notes covering database architectures (1-tier, 2-tier, 3-tier), Entity-Relationship (ER) diagrams, weak entities, participation constraints, and relational schema conversions with solved university exam problems.",
      subject: "Database Management Systems",
      semester: 4,
      topic: "ER Diagrams & Relational Algebra",
      uploaderId: aarav.id,
      fileName: "DBMS_Unit1_ER_Modeling.pdf",
      fileKey: "notes/seed-DBMS_Unit1_ER_Modeling.pdf",
      fileUrl: "https://notenest-storage.supabase.co/storage/v1/object/public/notes/DBMS_Unit1_ER_Modeling.pdf",
      fileSize: "4.2 MB",
      fileType: "PDF",
      mimeType: "application/pdf",
      downloadCount: 342,
      previewPages: 18,
      status: "APPROVED",
      tags: ["ER Model", "Relational Algebra", "Schemas", "Exam Prep"],
      keyConcepts: [
        "Three-schema architecture and data independence",
        "Entity types, attributes, and key constraints",
        "Specialization, generalization, and aggregation in Extended ER",
        "Relational algebra fundamental operators (Select, Project, Join, Union)"
      ]
    }
  });

  const note2 = await prisma.note.create({
    data: {
      title: "Operating Systems — Virtual Memory & Page Replacement",
      description: "Detailed exam-oriented lecture notes covering paging, segmentation, page fault handling, FIFO, LRU, Optimal page replacement algorithms with step-by-step trace tables, and thrashing prevention mechanisms.",
      subject: "Operating Systems",
      semester: 4,
      topic: "Memory Management",
      uploaderId: priya.id,
      fileName: "OS_Virtual_Memory_Paging.pdf",
      fileKey: "notes/seed-OS_Virtual_Memory_Paging.pdf",
      fileUrl: "https://notenest-storage.supabase.co/storage/v1/object/public/notes/OS_Virtual_Memory_Paging.pdf",
      fileSize: "3.8 MB",
      fileType: "PDF",
      mimeType: "application/pdf",
      downloadCount: 418,
      previewPages: 14,
      status: "APPROVED",
      tags: ["Paging", "LRU Algorithm", "Virtual Memory", "Thrashing"],
      keyConcepts: [
        "Hardware address translation with Translation Lookaside Buffer (TLB)",
        "Internal vs External Fragmentation solutions",
        "Belady's Anomaly demonstrated with FIFO algorithm",
        "Working set model and page fault frequency metrics"
      ]
    }
  });

  const note3 = await prisma.note.create({
    data: {
      title: "Data Structures — Trees, AVL Rotations & Graph Traversals",
      description: "High-yield diagrams and C++ implementations for Binary Search Trees, AVL balance factors with Left-Left, Right-Right, Left-Right, Right-Left rotations, BFS, DFS, and shortest path Dijkstra formulations.",
      subject: "Data Structures",
      semester: 3,
      topic: "Non-Linear Data Structures",
      uploaderId: rohan.id,
      fileName: "DS_AVL_Trees_Graphs.pdf",
      fileKey: "notes/seed-DS_AVL_Trees_Graphs.pdf",
      fileUrl: "https://notenest-storage.supabase.co/storage/v1/object/public/notes/DS_AVL_Trees_Graphs.pdf",
      fileSize: "5.6 MB",
      fileType: "PDF",
      mimeType: "application/pdf",
      downloadCount: 620,
      previewPages: 22,
      status: "APPROVED",
      tags: ["AVL Trees", "Graphs", "BFS/DFS", "Dijkstra"],
      keyConcepts: [
        "Binary search tree insertion, deletion, and searching amortized times",
        "Height balancing properties and AVL rotation logic",
        "Adjacency matrix vs Adjacency list representation",
        "Topological sorting algorithms for directed acyclic graphs"
      ]
    }
  });

  const note4 = await prisma.note.create({
    data: {
      title: "Computer Networks — The OSI 7-Layer Architecture & TCP/IP",
      description: "Visual breakdown of every layer in the OSI reference model compared directly to the 4-layer TCP/IP stack. Includes packet headers, encapsulation diagrams, port numbers, and protocol mappings (DNS, HTTP, TCP, UDP, IP, ARP).",
      subject: "Computer Networks",
      semester: 5,
      topic: "Network Models & Protocols",
      uploaderId: sneha.id,
      fileName: "CN_OSI_TCPIP_Protocols.pdf",
      fileKey: "notes/seed-CN_OSI_TCPIP_Protocols.pdf",
      fileUrl: "https://notenest-storage.supabase.co/storage/v1/object/public/notes/CN_OSI_TCPIP_Protocols.pdf",
      fileSize: "4.9 MB",
      fileType: "PDF",
      mimeType: "application/pdf",
      downloadCount: 289,
      previewPages: 16,
      status: "APPROVED",
      tags: ["OSI Model", "TCP/IP", "Encapsulation", "Protocols"],
      keyConcepts: [
        "Encapsulation and decapsulation walkthrough from application to physical layer",
        "Flow control, congestion control, and 3-way handshake in TCP",
        "IP addressing, subnetting masks, and Classless Inter-Domain Routing (CIDR)",
        "Address Resolution Protocol (ARP) frame structures"
      ]
    }
  });

  const note5 = await prisma.note.create({
    data: {
      title: "DBMS Unit 3 — SQL Queries, Subqueries & Relational Joins",
      description: "Exhaustive SQL revision cheat sheet with nested correlated subqueries, LEFT/RIGHT/FULL OUTER JOINs, GROUP BY HAVING aggregations, window functions, and triggers.",
      subject: "Database Management Systems",
      semester: 4,
      topic: "SQL Queries & Normalization",
      uploaderId: alexUser.id,
      fileName: "DBMS_Advanced_SQL_Queries.pdf",
      fileKey: "notes/seed-DBMS_Advanced_SQL_Queries.pdf",
      fileUrl: "https://notenest-storage.supabase.co/storage/v1/object/public/notes/DBMS_Advanced_SQL_Queries.pdf",
      fileSize: "3.4 MB",
      fileType: "PDF",
      mimeType: "application/pdf",
      downloadCount: 512,
      previewPages: 12,
      status: "APPROVED",
      tags: ["SQL", "Joins", "Subqueries", "Aggregations"],
      keyConcepts: [
        "Correlated vs Uncorrelated subqueries execution order",
        "Inner, Left Outer, Right Outer, and Cross join syntax differences",
        "HAVING clause vs WHERE clause filtering mechanics",
        "Primary key vs Unique constraint semantic behavior in DDL"
      ]
    }
  });

  const note6 = await prisma.note.create({
    data: {
      title: "Operating Systems — CPU Scheduling Algorithms with Solved Gantt Charts",
      description: "Solved numerical question bank for FCFS, Shortest Job First (Preemptive & Non-preemptive SRTF), Priority scheduling, and Round Robin (RR) with turnaround time and waiting time calculations.",
      subject: "Operating Systems",
      semester: 4,
      topic: "CPU Scheduling",
      uploaderId: priya.id,
      fileName: "OS_CPU_Scheduling_Gantt_Charts.pdf",
      fileKey: "notes/seed-OS_CPU_Scheduling_Gantt_Charts.pdf",
      fileUrl: "https://notenest-storage.supabase.co/storage/v1/object/public/notes/OS_CPU_Scheduling_Gantt_Charts.pdf",
      fileSize: "2.9 MB",
      fileType: "PDF",
      mimeType: "application/pdf",
      downloadCount: 540,
      previewPages: 11,
      status: "APPROVED",
      tags: ["CPU Scheduling", "Gantt Charts", "Round Robin", "SJF"],
      keyConcepts: [
        "Turnaround Time (Completion Time - Arrival Time) formula derivation",
        "Waiting Time (Turnaround Time - Burst Time) step calculations",
        "Context switch overhead in Round Robin time slicing",
        "Starvation in Priority scheduling and aging mitigation technique"
      ]
    }
  });

  // Create a PENDING note for testing admin approval
  await prisma.note.create({
    data: {
      title: "Full Stack Development — Express.js Middleware & JWT Auth Guide",
      description: "Practical guide explaining Express middleware chains, bcrypt hashing, and JWT tokens in college web engineering projects.",
      subject: "Full Stack Development",
      semester: 5,
      topic: "Web Backend Architecture",
      uploaderId: alexUser.id,
      fileName: "FullStack_Express_JWT_Auth.pdf",
      fileKey: "notes/seed-FullStack_Express_JWT_Auth.pdf",
      fileUrl: "https://notenest-storage.supabase.co/storage/v1/object/public/notes/FullStack_Express_JWT_Auth.pdf",
      fileSize: "3.7 MB",
      fileType: "PDF",
      mimeType: "application/pdf",
      downloadCount: 45,
      previewPages: 10,
      status: "PENDING",
      tags: ["Express.js", "JWT", "Authentication", "Full Stack"],
      keyConcepts: [
        "Request-Response cycle and middleware chaining",
        "Bearer tokens in HTTP authorization headers",
        "Bcrypt salt rounds and password hashing"
      ]
    }
  });

  console.log("📚 Created approved and pending academic study notes.");

  // 7. Seed Bookmarks for Alex Rivera (note1 and note3)
  await prisma.bookmark.create({
    data: {
      userId: alexUser.id,
      noteId: note1.id
    }
  });

  await prisma.bookmark.create({
    data: {
      userId: alexUser.id,
      noteId: note3.id
    }
  });

  console.log("🔖 Created sample bookmarks.");

  // 8. Seed Reports for Admin moderation
  await prisma.report.create({
    data: {
      noteId: note4.id,
      reporterId: alexUser.id,
      reason: "Missing diagrams in Section 4 (Transport layer header)",
      description: "Page 9 seems to have a truncated diagram of the TCP segment header.",
      status: "OPEN"
    }
  });

  await prisma.report.create({
    data: {
      noteId: note6.id,
      reporterId: rohan.id,
      reason: "Calculation error in Question 3",
      description: "The average turnaround time in question 3 Round Robin quantum=2 was calculated as 8.5ms instead of 9.25ms.",
      status: "OPEN"
    }
  });

  console.log("⚠️ Created sample moderation reports.");
  console.log("✨ NoteNest database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
