import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";
import { env } from "../src/config/env.js";

// Check if PostgreSQL database is reachable before attempting DB integration steps
let dbAvailable = false;
if (env.DATABASE_URL && env.DATABASE_URL.length > 0) {
  try {
    await prisma.$connect();
    dbAvailable = true;
  } catch (err) {
    dbAvailable = false;
  }
}

const skipDb = dbAvailable ? false : "Live PostgreSQL connection required (set DATABASE_URL in backend/.env)";

describe("NoteNest API Comprehensive Integration Tests", () => {
  let studentToken = "";
  let studentUserId = "";
  let adminToken = "";
  let testNoteId = "";

  test("1. GET /health should return 200 OK", async () => {
    const res = await request(app).get("/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "ok");
  });

  test("2. POST /api/auth/register should create a new student user", { skip: skipDb }, async () => {
    const randomEmail = `teststudent_${Date.now()}@college.edu`;
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Student",
        email: randomEmail,
        password: "Password123!",
        semester: 4,
        branch: "Computer Science & Engineering"
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.name, "Test Student");

    studentToken = res.body.data.token;
    studentUserId = res.body.data.user.id;
  });

  test("3. POST /api/auth/register should reject duplicate email", { skip: skipDb }, async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Alex Duplicate",
        email: "alex.rivera@college.edu", // already seeded
        password: "StudentPass2026!"
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  test("4. POST /api/auth/login should authenticate student and admin", { skip: skipDb }, async () => {
    // Student login
    const studentRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "alex.rivera@college.edu",
        password: "StudentPass2026!"
      });

    assert.equal(studentRes.status, 200);
    assert.equal(studentRes.body.success, true);
    assert.ok(studentRes.body.data.token);
    assert.equal(studentRes.body.data.user.email, "alex.rivera@college.edu");

    // Admin login
    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@notenest.edu",
        password: "AdminPass2026!"
      });

    assert.equal(adminRes.status, 200);
    assert.equal(adminRes.body.data.user.role, "ADMIN");
    adminToken = adminRes.body.data.token;
  });

  test("5. GET /api/auth/me requires valid token", { skip: skipDb }, async () => {
    // Missing token
    const unauthRes = await request(app).get("/api/auth/me");
    assert.equal(unauthRes.status, 401);

    // Valid token
    const authRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${adminToken}`);
    assert.equal(authRes.status, 200);
    assert.equal(authRes.body.data.email, "admin@notenest.edu");
  });

  test("6. Non-admin cannot access /api/admin/dashboard (403)", { skip: skipDb }, async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${studentToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  test("7. Admin can access /api/admin/dashboard (200)", { skip: skipDb }, async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(typeof res.body.data.totalNotes === "number");
    assert.ok(typeof res.body.data.totalUsers === "number");
  });

  test("8. GET /api/notes retrieves approved notes with search and filters", { skip: skipDb }, async () => {
    const res = await request(app)
      .get("/api/notes?subject=Database Management Systems&page=1&limit=10");

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length > 0);

    testNoteId = res.body.data[0].id;
    assert.equal(res.body.data[0].subject, "Database Management Systems");
  });

  test("9. GET /api/notes/:id retrieves a single note", { skip: skipDb }, async () => {
    const res = await request(app).get(`/api/notes/${testNoteId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, testNoteId);
    assert.ok(res.body.data.title);
  });

  test("10. GET /api/notes/:id/download increments download count", { skip: skipDb }, async () => {
    const initialNote = await request(app).get(`/api/notes/${testNoteId}`);
    const initialDownloads = initialNote.body.data.downloads;

    const downloadRes = await request(app).get(`/api/notes/${testNoteId}/download`);
    assert.equal(downloadRes.status, 200);
    assert.equal(downloadRes.body.data.downloads, initialDownloads + 1);
  });

  test("11. Bookmarks flow: Add, List, and Delete", { skip: skipDb }, async () => {
    // Add bookmark
    const addRes = await request(app)
      .post(`/api/bookmarks/${testNoteId}`)
      .set("Authorization", `Bearer ${studentToken}`);
    assert.equal(addRes.status, 201);

    // List bookmarks
    const listRes = await request(app)
      .get("/api/bookmarks")
      .set("Authorization", `Bearer ${studentToken}`);
    assert.equal(listRes.status, 200);
    assert.ok(listRes.body.data.some((n) => n.id === testNoteId));

    // Remove bookmark
    const delRes = await request(app)
      .delete(`/api/bookmarks/${testNoteId}`)
      .set("Authorization", `Bearer ${studentToken}`);
    assert.equal(delRes.status, 200);
  });

  test("12. Profile flow: GET /api/users/me and PATCH /api/users/me", { skip: skipDb }, async () => {
    const getRes = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${studentToken}`);
    assert.equal(getRes.status, 200);
    assert.ok(getRes.body.data.stats);

    const updateRes = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        name: "Test Student Updated",
        college: "State Tech University"
      });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.data.name, "Test Student Updated");
    assert.equal(updateRes.body.data.college, "State Tech University");
  });

  test("13. Reports flow: Submit report and admin update status", { skip: skipDb }, async () => {
    const repRes = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        noteId: testNoteId,
        reason: "Test report reason",
        description: "Checking automated report filing."
      });

    assert.equal(repRes.status, 201);
    const reportId = repRes.body.data.id;

    // Admin updates report status
    const updateRep = await request(app)
      .patch(`/api/admin/reports/${reportId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "RESOLVED" });

    assert.equal(updateRep.status, 200);
    assert.equal(updateRep.body.data.status, "RESOLVED");
  });

  test("14. Admin notes moderation: PATCH status and list", { skip: skipDb }, async () => {
    // List admin notes
    const adminNotesRes = await request(app)
      .get("/api/admin/notes")
      .set("Authorization", `Bearer ${adminToken}`);
    assert.equal(adminNotesRes.status, 200);

    // Update note status
    const statusRes = await request(app)
      .patch(`/api/admin/notes/${testNoteId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "APPROVED" });
    assert.equal(statusRes.status, 200);
    assert.equal(statusRes.body.data.status, "APPROVED");
  });
});
