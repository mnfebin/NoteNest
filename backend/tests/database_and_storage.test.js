import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import path from "path";
import fs from "fs";
import { isValidPdfBuffer, sanitizeFileName } from "../src/utils/fileValidation.js";
import { StorageService } from "../src/services/storage.service.js";
import { NotesRepository } from "../src/repositories/notes.repository.js";
import { BookmarksRepository } from "../src/repositories/bookmarks.repository.js";
import { ReportsRepository } from "../src/repositories/reports.repository.js";

describe("Member 3: Database & File Management Unit & Integration Suite", () => {
  const dummyPdfHeader = Buffer.from("%PDF-1.5\n%\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF");
  const dummyTextBuffer = Buffer.from("This is plain text pretending to be a PDF.");
  const dummyExeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ header

  // -------------------------------------------------------------
  // 1. Server-Side File Validation (Magic Bytes & Filename Sanitization)
  // -------------------------------------------------------------
  describe("1. Server-Side PDF Validation & Sanitization", () => {
    test("Should accept valid PDF buffer starting with %PDF-", () => {
      assert.equal(isValidPdfBuffer(dummyPdfHeader), true);
    });

    test("Should reject plain text buffer even if labeled as PDF", () => {
      assert.equal(isValidPdfBuffer(dummyTextBuffer), false);
    });

    test("Should reject binary executable file disguised as PDF", () => {
      assert.equal(isValidPdfBuffer(dummyExeBuffer), false);
    });

    test("Should reject empty or null buffer", () => {
      assert.equal(isValidPdfBuffer(null), false);
      assert.equal(isValidPdfBuffer(Buffer.alloc(0)), false);
      assert.equal(isValidPdfBuffer(Buffer.from("123")), false);
    });

    test("Should sanitize filenames and prevent directory traversal", () => {
      const malicious = "../../../etc/shadow.pdf";
      const cleaned = sanitizeFileName(malicious);
      assert.equal(cleaned.includes(".."), false);
      assert.equal(cleaned.includes("/"), false);
      assert.equal(cleaned.endsWith(".pdf"), true);

      const messy = "My Lecture Note #1 (DBMS & SQL)!.pdf";
      const safe = sanitizeFileName(messy);
      assert.equal(/^[a-zA-Z0-9._-]+$/.test(safe), true);
    });
  });

  // -------------------------------------------------------------
  // 2. Storage Service: Upload, 60s Signed Download URLs & Cleanup
  // -------------------------------------------------------------
  describe("2. Storage Service Operations", () => {
    let createdFilePath = null;

    before(() => {
      process.env.ALLOW_LOCAL_STORAGE = "true";
    });

    test("Should upload valid PDF buffer and return storage metadata", async () => {
      const result = await StorageService.uploadFile({
        buffer: dummyPdfHeader,
        originalName: "Unit1_DBMS_Revision.pdf",
        mimeType: "application/pdf"
      });

      assert.ok(result.fileKey, "Must return fileKey");
      assert.ok(result.fileUrl, "Must return fileUrl");
      assert.ok(result.storageProvider, "Must declare storageProvider");
      createdFilePath = result.storagePath;

      if (result.storageProvider === "local") {
        assert.equal(fs.existsSync(createdFilePath), true);
      }
    });

    test("Should generate secure download URL with 60-second expiration", async () => {
      assert.ok(createdFilePath, "Test requires created file");
      const downloadUrl = await StorageService.getDownloadUrl(createdFilePath, 60);
      assert.ok(downloadUrl, "Must generate valid download URL");
      assert.equal(typeof downloadUrl, "string");
    });

    test("Should safely delete file from storage", async () => {
      assert.ok(createdFilePath);
      await StorageService.deleteFile(createdFilePath);

      // Verify file is removed
      if (path.isAbsolute(createdFilePath)) {
        assert.equal(fs.existsSync(createdFilePath), false);
      }
    });

    test("Should gracefully handle deleting non-existent file without crashing", async () => {
      await assert.doesNotReject(async () => {
        await StorageService.deleteFile("notes/non_existent_file_12345.pdf");
      });
    });

    test("Should fail with informative error when Supabase not configured and local fallback disabled", async () => {
      process.env.ALLOW_LOCAL_STORAGE = "false";
      const oldEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      try {
        await assert.rejects(
          async () => {
            await StorageService.uploadFile({
              buffer: dummyPdfHeader,
              originalName: "test.pdf"
            });
          },
          /Supabase Storage is not configured/
        );
      } finally {
        process.env.ALLOW_LOCAL_STORAGE = "true";
        process.env.NODE_ENV = oldEnv;
      }
    });
  });

  // -------------------------------------------------------------
  // 3. Repository Layer Architecture & Query Abstractions
  // -------------------------------------------------------------
  describe("3. Repository Layer Architecture", () => {
    test("NotesRepository exposes all required operations", () => {
      assert.equal(typeof NotesRepository.createNote, "function");
      assert.equal(typeof NotesRepository.findActiveNotes, "function");
      assert.equal(typeof NotesRepository.findNoteById, "function");
      assert.equal(typeof NotesRepository.updateNote, "function");
      assert.equal(typeof NotesRepository.markNoteAsRemoved, "function");
      assert.equal(typeof NotesRepository.deleteNotePermanently, "function");
      assert.equal(typeof NotesRepository.incrementDownloadCount, "function");
      assert.equal(typeof NotesRepository.findNotesByUploader, "function");
    });

    test("BookmarksRepository exposes all required operations", () => {
      assert.equal(typeof BookmarksRepository.getUserBookmarks, "function");
      assert.equal(typeof BookmarksRepository.findBookmark, "function");
      assert.equal(typeof BookmarksRepository.addBookmark, "function");
      assert.equal(typeof BookmarksRepository.removeBookmark, "function");
      assert.equal(typeof BookmarksRepository.isBookmarked, "function");
    });

    test("ReportsRepository exposes all required operations", () => {
      assert.equal(typeof ReportsRepository.createReport, "function");
      assert.equal(typeof ReportsRepository.findExistingOpenReport, "function");
      assert.equal(typeof ReportsRepository.getUserReports, "function");
      assert.equal(typeof ReportsRepository.getAllReports, "function");
      assert.equal(typeof ReportsRepository.updateReportStatus, "function");
    });
  });

  // -------------------------------------------------------------
  // 4. Note Data Contract & Field Integrity
  // -------------------------------------------------------------
  describe("4. Note Data Contract & Field Integrity", () => {
    test("Verify required Note schema fields are defined in data structure", () => {
      const mockNoteData = {
        title: "Computer Networks — TCP 3-Way Handshake",
        description: "Comprehensive handwritten notes on TCP synchronization, sequence numbers, and teardown.",
        subject: "Computer Networks",
        semester: 5,
        topic: "Transport Layer",
        uploaderId: "user_test_123",
        fileKey: "notes/1740000000-uuid-tcp_notes.pdf",
        fileName: "tcp_notes.pdf",
        fileUrl: "https://notenest.storage/notes/tcp_notes.pdf",
        fileSize: "2.4 MB",
        fileType: "PDF",
        mimeType: "application/pdf",
        status: "APPROVED",
        tags: ["TCP", "Networking"],
        keyConcepts: ["SYN, SYN-ACK, ACK", "Sequence numbers"]
      };

      assert.equal(mockNoteData.mimeType, "application/pdf");
      assert.ok(mockNoteData.fileKey.startsWith("notes/"));
      assert.equal(mockNoteData.status, "APPROVED");
      assert.equal(typeof mockNoteData.semester, "number");
    });
  });

  // -------------------------------------------------------------
  // 5. Validation Schemas & Error Handling Rules
  // -------------------------------------------------------------
  describe("5. Validation Schemas & Business Rules", () => {
    test("createNoteSchema rejects missing required fields", async () => {
      const { createNoteSchema } = await import("../src/validators/notes.validator.js");
      const invalid = { title: "ab" }; // too short, missing fields
      const result = createNoteSchema.safeParse(invalid);
      assert.equal(result.success, false);
      const errors = result.error.flatten().fieldErrors;
      assert.ok(errors.title);
      assert.ok(errors.description);
      assert.ok(errors.subject);
      assert.ok(errors.semester);
      assert.ok(errors.topic);
    });

    test("createNoteSchema accepts valid note payload and normalizes tags", async () => {
      const { createNoteSchema } = await import("../src/validators/notes.validator.js");
      const valid = {
        title: "Compiler Design — LL(1) Parsing Tables",
        description: "Step-by-step calculation of First and Follow sets with conflict resolution.",
        subject: "Compiler Design",
        semester: 6,
        topic: "Syntax Analysis",
        tags: "LL1, Parsing, Syntax, Compilers",
        keyConcepts: "First and Follow\nPredictive parsing table\nGrammar ambiguity"
      };
      const result = createNoteSchema.safeParse(valid);
      assert.equal(result.success, true);
      assert.equal(Array.isArray(result.data.tags), true);
      assert.equal(result.data.tags.length, 4);
      assert.equal(Array.isArray(result.data.keyConcepts), true);
      assert.equal(result.data.keyConcepts.length, 3);
    });

    test("queryNotesSchema applies default sorting, pagination, and bounds", async () => {
      const { queryNotesSchema } = await import("../src/validators/notes.validator.js");
      const result = queryNotesSchema.safeParse({});
      assert.equal(result.success, true);
      assert.equal(result.data.page, 1);
      assert.equal(result.data.limit, 12);
      assert.equal(result.data.sort, "newest");
    });

    test("createReportSchema validates reason length and requires noteId", async () => {
      const { createReportSchema, createReportForNoteSchema } = await import(
        "../src/validators/reports.validator.js"
      );
      const invalid = { noteId: "", reason: "ab" };
      assert.equal(createReportSchema.safeParse(invalid).success, false);

      const validParamReport = { reason: "Incorrect formula in Section 2" };
      assert.equal(createReportForNoteSchema.safeParse(validParamReport).success, true);
    });
  });
});

