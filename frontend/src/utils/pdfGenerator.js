import { jsPDF } from "jspdf";

/**
 * NoteNest — Professional Academic PDF Generation Engine
 * Uses jsPDF with precise typography metrics, automatic text-wrapping,
 * dynamic multi-page flow, running headers/footers, and page-break guarantees.
 */

export function buildNotePdfDocument(note) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 18;
  const contentWidth = pageWidth - marginX * 2; // 174mm
  const bottomThreshold = 270; // mm before triggering new page

  let currentY = 16;

  // Helper to ensure vertical space, triggering new page if needed
  function checkPageBreak(requiredHeight) {
    if (currentY + requiredHeight > bottomThreshold) {
      doc.addPage();
      currentY = 24; // Leave room for running header on page 2+
      return true;
    }
    return false;
  }

  // Helper for section headings
  function addSectionHeading(titleText) {
    checkPageBreak(16);
    currentY += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235); // Brand Blue #2563EB
    doc.text(titleText, marginX, currentY);

    // Subtle divider rule
    currentY += 2;
    doc.setDrawColor(226, 232, 240); // #E2E8F0
    doc.setLineWidth(0.4);
    doc.line(marginX, currentY, marginX + contentWidth, currentY);
    currentY += 5;
  }

  // Data Normalization
  const title = note.title || "Academic Study Notes";
  const subject = note.subject || "Computer Science & Engineering";
  const semester = note.semester ? `Semester ${note.semester}` : "B.Tech CSE";
  const topic = note.topic || "Core Curriculum Syllabus";
  const uploader = note.uploader || "Verified Student Contributor";
  const uploadDate = note.uploadDate || new Date().toISOString().split("T")[0];
  const description = note.description || "Comprehensive syllabus notes prepared for university exam preparation and rapid concept revision.";
  
  const keyConcepts = Array.isArray(note.keyConcepts) && note.keyConcepts.length > 0
    ? note.keyConcepts
    : [
        "Core theoretical definitions, theorems, and architectural system models",
        "Key mathematical formulas, step-by-step algorithms, and solved numerical problems",
        "University semester exam question patterns, model answers, and marking rubrics",
        "Practical laboratory implementations, edge-case constraints, and design tradeoffs"
      ];

  const tags = Array.isArray(note.tags) && note.tags.length > 0
    ? note.tags.join(" • ")
    : "Exam Prep • Lecture Notes • Core Syllabus • Model Answers";

  // ==========================================
  // PAGE 1: HEADER BANNER
  // ==========================================
  doc.setFillColor(37, 99, 235); // #2563EB
  doc.roundedRect(marginX, currentY, contentWidth, 22, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("NOTENEST | STUDENT NOTES SHARING PLATFORM", marginX + 6, currentY + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(219, 234, 254); // Light blue tint #DBEAFE
  doc.text("Department of Computer Science & Engineering — Verified Semester Study Material", marginX + 6, currentY + 16);

  currentY += 27;

  // Subject & Semester Pill
  doc.setFillColor(239, 246, 255); // #EFF6FF
  doc.setDrawColor(191, 219, 254); // #BFDBFE
  doc.roundedRect(marginX, currentY, contentWidth, 10, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(29, 78, 216); // #1D4ED8
  doc.text(`${subject.toUpperCase()}  |  ${semester.toUpperCase()}`, marginX + 5, currentY + 6.5);

  currentY += 15;

  // Note Title (wrapped automatically)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate #0F172A
  const titleLines = doc.splitTextToSize(title, contentWidth);
  for (const line of titleLines) {
    checkPageBreak(8);
    doc.text(line, marginX, currentY);
    currentY += 7;
  }

  currentY += 2;

  // Metadata Card
  const metaHeight = 22;
  checkPageBreak(metaHeight + 6);
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.roundedRect(marginX, currentY, contentWidth, metaHeight, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // #475569

  doc.text(`Topic / Unit: ${topic}`, marginX + 5, currentY + 6);
  doc.text(`Contributed by: ${uploader}  |  Upload Date: ${uploadDate}`, marginX + 5, currentY + 11.5);
  doc.text(`Keywords: ${tags}`, marginX + 5, currentY + 17);

  currentY += metaHeight + 6;

  // ==========================================
  // SECTION 1: EXECUTIVE SUMMARY & OVERVIEW
  // ==========================================
  addSectionHeading("1. EXECUTIVE SUMMARY & OVERVIEW");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85); // #334155

  const descLines = doc.splitTextToSize(description, contentWidth);
  for (const line of descLines) {
    checkPageBreak(6);
    doc.text(line, marginX, currentY);
    currentY += 5.2; // Clean line height, absolutely NO overlapping
  }

  currentY += 4;

  // ==========================================
  // SECTION 2: KEY CONCEPTS & CORE BLUEPRINT
  // ==========================================
  addSectionHeading("2. KEY CONCEPTS & CORE BLUEPRINT");

  for (let i = 0; i < keyConcepts.length; i++) {
    const conceptText = keyConcepts[i];
    const badgeText = `[${i + 1}]`;

    // Wrap concept text with left margin indentation for the badge
    const badgeWidth = 10;
    const itemContentWidth = contentWidth - badgeWidth;
    const itemLines = doc.splitTextToSize(conceptText, itemContentWidth);
    const itemHeight = Math.max(7, itemLines.length * 5.2 + 3);

    checkPageBreak(itemHeight);

    // Number Badge
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(marginX, currentY - 3.8, 8, 5.5, 1, 1, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235);
    doc.text(badgeText, marginX + 1.2, currentY);

    // Item Body Lines
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);

    let lineY = currentY;
    for (const line of itemLines) {
      doc.text(line, marginX + badgeWidth, lineY);
      lineY += 5.2;
    }

    currentY = lineY + 2.5; // Gap between list items
  }

  currentY += 2;

  // ==========================================
  // SECTION 3: REVISION GUIDELINES & STUDY CHECKLIST
  // ==========================================
  addSectionHeading("3. REVISION GUIDELINES & MODEL PROBLEM APPROACH");

  const studyGuidelines = [
    "Master core theoretical definitions and primary architectural diagrams before attempting derivation steps.",
    "Formulate step-by-step algorithms, verify edge cases (null pointers, boundary indices, overflow limits).",
    "Practice university previous-year question papers (last 3-5 iterations) mapped to this specific syllabus unit.",
    "Draft concise summaries of proofs, standard equations, and time/space complexity Big-O upper bounds.",
    "For multi-part descriptive questions, structure answers with clear headings, schematic diagrams, and brief bullet conclusions."
  ];

  for (const guide of studyGuidelines) {
    const bulletLines = doc.splitTextToSize(guide, contentWidth - 8);
    const itemHeight = bulletLines.length * 5.2 + 2;

    checkPageBreak(itemHeight);

    // Bullet Symbol
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text("•", marginX + 1.5, currentY);

    // Bullet text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    let lineY = currentY;
    for (const line of bulletLines) {
      doc.text(line, marginX + 7, lineY);
      lineY += 5;
    }
    currentY = lineY + 1.5;
  }

  currentY += 3;

  // ==========================================
  // SECTION 4: EXAMINATION PREPARATION TIPS
  // ==========================================
  addSectionHeading("4. EXAMINATION PREPARATION & ANSWER STRUCTURING");

  const examTips = [
    "High-Yield Diagrams: Draw neat, labeled diagrams for all system architecture and flowchart questions to secure full presentation marks.",
    "Numerical Precision: Show every intermediate substitution step and always state explicit engineering units in final calculations.",
    "Time Allocation: Allocate 1.5 minutes per mark (e.g., maximum 15 minutes for a 10-mark long question) during mid-term and semester finals."
  ];

  for (const tip of examTips) {
    const tipLines = doc.splitTextToSize(tip, contentWidth - 8);
    const itemHeight = tipLines.length * 5 + 2;

    checkPageBreak(itemHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(16, 185, 129); // Success green bullet #10B981
    doc.text("✓", marginX + 1.5, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    let lineY = currentY;
    for (const line of tipLines) {
      doc.text(line, marginX + 7, lineY);
      lineY += 5;
    }
    currentY = lineY + 2;
  }

  currentY += 4;

  // ==========================================
  // SECTION 5: ACADEMIC INTEGRITY & VERIFICATION
  // ==========================================
  checkPageBreak(20);
  doc.setFillColor(241, 245, 249); // #F1F5F9
  doc.setDrawColor(203, 213, 225); // #CBD5E1
  doc.roundedRect(marginX, currentY, contentWidth, 14, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Academic Verification & Quality Guarantee", marginX + 5, currentY + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Reviewed by NoteNest Student Community. Content is for academic study and non-commercial educational purposes only.", marginX + 5, currentY + 10);

  // ==========================================
  // RUNNING HEADERS & RUNNING FOOTERS (ALL PAGES)
  // ==========================================
  const totalPages = doc.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Running Header (only on page 2 and later)
    if (p > 1) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // #94A3B8
      doc.text("NoteNest — Academic Study Notes", marginX, 10);
      doc.text(subject, marginX + contentWidth, 10, { align: "right" });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginX, 12, marginX + contentWidth, 12);
    }

    // Running Footer (on every page)
    const footerY = 287;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 3, marginX + contentWidth, footerY - 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("NoteNest Academic Repository — College Student Study Materials", marginX, footerY);
    doc.text(`Page ${p} of ${totalPages}`, marginX + contentWidth, footerY, { align: "right" });
  }

  return doc;
}

/**
 * Open the generated note PDF in a new browser tab
 */
export function openNotePdf(note) {
  if (!note) return;

  if (note.fileUrl && note.fileUrl.startsWith("http") && !note.fileUrl.includes("placeholder")) {
    window.open(note.fileUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const doc = buildNotePdfDocument(note);
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 60000);
}

/**
 * Download the note as a genuine, readable .pdf file to disk
 */
export function downloadNotePdf(note) {
  if (!note) return;

  const rawName = note.fileName || `${(note.title || "Note").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  const fileName = rawName.replace(/\.txt$/, ".pdf").endsWith(".pdf")
    ? rawName.replace(/\.txt$/, ".pdf")
    : `${rawName}.pdf`;

  if (note.fileUrl && note.fileUrl.startsWith("http") && !note.fileUrl.includes("placeholder")) {
    const link = document.createElement("a");
    link.href = note.fileUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const doc = buildNotePdfDocument(note);
  doc.save(fileName);
}
