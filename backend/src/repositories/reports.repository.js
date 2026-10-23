import prisma from "../config/prisma.js";

/**
 * Reports Repository: Encapsulates all Prisma database operations for Note Reports.
 * Note: Never sends Express HTTP responses from repository functions.
 */
export class ReportsRepository {
  /**
   * Submit a new moderation report.
   */
  static async createReport({ noteId, reporterId, reason, description = "" }) {
    return prisma.report.create({
      data: {
        noteId,
        reporterId,
        reason,
        description: description || "No additional comments provided.",
        status: "OPEN"
      },
      include: {
        note: {
          select: { id: true, title: true, subject: true, uploaderId: true }
        },
        reporter: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  /**
   * Find an existing open report for a specific note by a specific user.
   * Prevents spam / duplicate open reports.
   */
  static async findExistingOpenReport(noteId, reporterId) {
    return prisma.report.findFirst({
      where: {
        noteId,
        reporterId,
        status: "OPEN"
      }
    });
  }

  /**
   * Retrieve all reports submitted by a specific user.
   */
  static async getUserReports(reporterId) {
    return prisma.report.findMany({
      where: { reporterId },
      orderBy: { createdAt: "desc" },
      include: {
        note: {
          select: { id: true, title: true, subject: true }
        }
      }
    });
  }

  /**
   * Retrieve all reports for admin moderation with filtering and pagination.
   */
  static async getAllReports({ status, skip = 0, take = 20 } = {}) {
    const where = {};
    if (status) {
      where.status = status;
    }

    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          note: {
            select: { id: true, title: true, subject: true, uploaderId: true }
          },
          reporter: {
            select: { id: true, name: true, email: true }
          }
        }
      })
    ]);

    return { total, reports };
  }

  /**
   * Update report status (e.g. REVIEWED, RESOLVED, DISMISSED).
   */
  static async updateReportStatus(reportId, status) {
    return prisma.report.update({
      where: { id: reportId },
      data: { status },
      include: {
        note: {
          select: { id: true, title: true }
        }
      }
    });
  }
}

export default ReportsRepository;
