import prisma from "../config/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Get current user profile with activity stats.
 */
export async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;

    const [user, uploadsCount, bookmarksCount, userNotes] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          semester: true,
          branch: true,
          college: true,
          studentId: true,
          createdAt: true
        }
      }),
      prisma.note.count({ where: { uploaderId: userId } }),
      prisma.bookmark.count({ where: { userId } }),
      prisma.note.findMany({
        where: { uploaderId: userId },
        select: { downloadCount: true }
      })
    ]);

    if (!user) {
      return sendError(res, { statusCode: 404, message: "User not found" });
    }

    const totalDownloadsReceived = userNotes.reduce(
      (sum, n) => sum + (n.downloadCount || 0),
      0
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "Profile retrieved successfully",
      data: {
        ...user,
        stats: {
          uploadsCount,
          bookmarksCount,
          totalDownloadsReceived
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update basic safe profile details (name, semester, branch, college, studentId).
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, semester, branch, college, studentId } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (semester !== undefined) updateData.semester = parseInt(semester, 10);
    if (branch !== undefined) updateData.branch = branch;
    if (college !== undefined) updateData.college = college;
    if (studentId !== undefined) updateData.studentId = studentId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        semester: true,
        branch: true,
        college: true,
        studentId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}
