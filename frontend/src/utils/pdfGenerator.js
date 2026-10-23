/**
 * NoteNest — Academic PDF Document Generator
 * Generates standards-compliant PDF 1.4 documents client-side.
 * Opens natively in all modern browser PDF readers and Adobe Acrobat.
 */

function sanitizeText(str) {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n]+/g, " ");
}

/**
 * Wrap long text into multiple lines for PDF rendering
 */
function wrapText(text, maxCharsPerLine = 75) {
  if (!text) return [];
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Generate a complete, valid binary PDF Blob for a Note
 */
export function generateNotePdfBlob(note) {
  const title = note.title || "Academic Lecture Notes";
  const subject = note.subject || "Computer Science & Engineering";
  const semester = note.semester ? `Semester ${note.semester}` : "B.Tech CSE";
  const topic = note.topic || "Core Syllabus";
  const uploader = note.uploader || "Verified Student Contributor";
  const uploadDate = note.uploadDate || new Date().toISOString().split("T")[0];
  const description = note.description || "Comprehensive syllabus notes prepared for university exam preparation.";
  const keyConcepts = Array.isArray(note.keyConcepts) && note.keyConcepts.length > 0
    ? note.keyConcepts
    : [
        "Core theoretical definitions and architectural models",
        "Key formulas, step-by-step algorithms, and solved numericals",
        "University semester exam pattern mappings and model questions"
      ];
  const tags = Array.isArray(note.tags) ? note.tags.join(", ") : "Lecture Notes, Exam Revision";

  // Stream content instructions in PDF PostScript operators
  const streamCommands = [];

  // Top Header Banner
  streamCommands.push("0.15 0.39 0.92 rg"); // Brand Blue fill
  streamCommands.push("40 770 515 50 re f"); // Header rectangle
  streamCommands.push("1 1 1 rg"); // White text
  streamCommands.push("BT /F1 16 Tf 55 795 Td (NOTENEST  |  STUDENT NOTES SHARING PLATFORM) Tj ET");
  streamCommands.push("BT /F2 10 Tf 55 780 Td (Department of Computer Science & Engineering - Verified Study Material) Tj ET");

  // Subject & Semester Sub-banner
  streamCommands.push("0.94 0.96 0.99 rg"); // Light blue bg
  streamCommands.push("40 720 515 35 re f");
  streamCommands.push("0.1 0.2 0.4 rg"); // Dark text
  streamCommands.push(`BT /F1 12 Tf 55 735 Td (${sanitizeText(subject.toUpperCase())}  --  ${sanitizeText(semester)}) Tj ET`);

  // Document Title
  streamCommands.push("0.06 0.09 0.16 rg");
  const titleLines = wrapText(title, 60);
  let currentY = 690;
  streamCommands.push("BT /F1 15 Tf");
  for (const line of titleLines) {
    streamCommands.push(`50 ${currentY} Td (${sanitizeText(line)}) Tj`);
    currentY -= 20;
    streamCommands.push(`-50 -${currentY} Td`); // reset relative
  }
  streamCommands.push("ET");

  // Metadata block
  currentY -= 10;
  streamCommands.push("0.89 0.91 0.94 rg");
  streamCommands.push(`40 ${currentY - 45} 515 50 re f`);
  streamCommands.push("0.28 0.33 0.41 rg");
  streamCommands.push("BT /F2 9 Tf");
  streamCommands.push(`55 ${currentY - 12} Td (Topic / Unit: ${sanitizeText(topic)}) Tj`);
  streamCommands.push(`0 -14 Td (Contributed by: ${sanitizeText(uploader)}  |  Upload Date: ${sanitizeText(uploadDate)}) Tj`);
  streamCommands.push(`0 -14 Td (Keywords: ${sanitizeText(tags)}) Tj`);
  streamCommands.push("ET");

  // Section 1: Syllabus Summary
  currentY -= 75;
  streamCommands.push("0.15 0.39 0.92 rg");
  streamCommands.push(`BT /F1 12 Tf 50 ${currentY} Td (1. EXECUTIVE SUMMARY & OVERVIEW) Tj ET`);
  streamCommands.push("0.85 0.88 0.93 rg");
  streamCommands.push(`50 ${currentY - 4} 495 1 re f`);

  currentY -= 20;
  streamCommands.push("0.15 0.18 0.24 rg");
  streamCommands.push("BT /F2 10 Tf");
  const descLines = wrapText(description, 78);
  for (const line of descLines) {
    streamCommands.push(`50 ${currentY} Td (${sanitizeText(line)}) Tj`);
    currentY -= 15;
    streamCommands.push(`-50 -${currentY} Td`);
  }
  streamCommands.push("ET");

  // Section 2: Key Concepts & Exam Blueprint
  currentY -= 15;
  streamCommands.push("0.15 0.39 0.92 rg");
  streamCommands.push(`BT /F1 12 Tf 50 ${currentY} Td (2. KEY CONCEPTS & CORE EXAMINATION TOPICS) Tj ET`);
  streamCommands.push("0.85 0.88 0.93 rg");
  streamCommands.push(`50 ${currentY - 4} 495 1 re f`);

  currentY -= 20;
  streamCommands.push("0.15 0.18 0.24 rg");
  for (let i = 0; i < keyConcepts.length; i++) {
    const concept = keyConcepts[i];
    const conceptLines = wrapText(`[${i + 1}]  ${concept}`, 74);
    streamCommands.push("BT /F2 10 Tf");
    for (const line of conceptLines) {
      streamCommands.push(`55 ${currentY} Td (${sanitizeText(line)}) Tj`);
      currentY -= 15;
      streamCommands.push(`-55 -${currentY} Td`);
    }
    streamCommands.push("ET");
    currentY -= 3;
  }

  // Section 3: Study Notes & Formula Cheatsheet
  currentY -= 10;
  streamCommands.push("0.15 0.39 0.92 rg");
  streamCommands.push(`BT /F1 12 Tf 50 ${currentY} Td (3. REVISION GUIDELINES & MODEL PROBLEM APPROACH) Tj ET`);
  streamCommands.push("0.85 0.88 0.93 rg");
  streamCommands.push(`50 ${currentY - 4} 495 1 re f`);

  currentY -= 20;
  const guidelines = [
    "* Review standard definitions, time/space complexity bounds, and core architectural diagrams first.",
    "* Solve the previous 3 years semester question papers corresponding to this unit.",
    "* Pay close attention to boundary cases, corner constraints, and proof steps in long-answer questions."
  ];

  streamCommands.push("0.2 0.25 0.3 rg");
  for (const guide of guidelines) {
    streamCommands.push("BT /F2 9 Tf");
    streamCommands.push(`55 ${currentY} Td (${sanitizeText(guide)}) Tj ET`);
    currentY -= 15;
  }

  // Footer Watermark
  streamCommands.push("0.85 0.88 0.93 rg");
  streamCommands.push("40 45 515 1 re f");
  streamCommands.push("0.5 0.55 0.65 rg");
  streamCommands.push("BT /F2 8 Tf 50 30 Td (NoteNest Academic Sharing Platform - Generated for college student educational use only - Page 1 of 1) Tj ET");

  const contentStream = streamCommands.join("\n");
  const streamLength = contentStream.length;

  // Construct PDF Objects with cross-references
  const objects = [];
  objects.push("%PDF-1.4\n%âãÏÓ\n"); // Standard binary marker for PDF viewers

  // Object 1: Catalog
  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  // Object 2: Pages
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  // Object 3: Page (A4 Dimensions: 595.28 x 841.89)
  const obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n";
  // Object 4: Font Bold
  const obj4 = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n";
  // Object 5: Font Regular
  const obj5 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  // Object 6: Stream
  const obj6 = `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`;

  const headerLength = objects[0].length;
  const offsets = [0];
  let offset = headerLength;

  const objs = [obj1, obj2, obj3, obj4, obj5, obj6];
  for (const obj of objs) {
    offsets.push(offset);
    offset += obj.length;
  }

  // Cross-reference table
  let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objs.length; i++) {
    xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }

  const trailer = `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`;

  const pdfFullString = objects[0] + objs.join("") + xref + trailer;

  return new Blob([pdfFullString], { type: "application/pdf" });
}

/**
 * Open the note PDF in a new browser tab for live reading/preview
 */
export function openNotePdf(note) {
  if (!note) return;

  // If there's an existing live remote URL ending in .pdf or Supabase signed URL
  if (note.fileUrl && note.fileUrl.startsWith("http") && !note.fileUrl.includes("placeholder")) {
    window.open(note.fileUrl, "_blank", "noopener,noreferrer");
    return;
  }

  // Otherwise generate genuine PDF Blob and open in browser PDF viewer
  const blob = generateNotePdfBlob(note);
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");

  // Revoke object URL after delay
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 60000);
}

/**
 * Download the note as a real, valid .pdf file to disk
 */
export function downloadNotePdf(note) {
  if (!note) return;

  const fileName = (note.fileName || `${(note.title || "Note").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`).replace(/\.txt$/, ".pdf");
  const finalFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;

  if (note.fileUrl && note.fileUrl.startsWith("http") && !note.fileUrl.includes("placeholder")) {
    const link = document.createElement("a");
    link.href = note.fileUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Generate real PDF Blob and trigger download
  const blob = generateNotePdfBlob(note);
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = finalFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 30000);
}
