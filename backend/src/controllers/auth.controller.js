import prisma from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Register a new user account.
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, semester, branch, college, studentId } = req.body;

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return sendError(res, {
        statusCode: 409,
        message: "An account with this email address already exists. Please log in."
      });
    }

    const passwordHash = await hashPassword(password);

    // Default first user can be ADMIN if no users exist, or default USER
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        semester,
        branch,
        college,
        studentId
      },
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
    });

    const token = signToken({ userId: user.id, role: user.role });

    return sendSuccess(res, {
      statusCode: 201,
      message: "User registered successfully",
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Log in with email and password.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return sendError(res, {
        statusCode: 401,
        message: "Invalid email or password."
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, {
        statusCode: 401,
        message: "Invalid email or password."
      });
    }

    const token = signToken({ userId: user.id, role: user.role });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      semester: user.semester,
      branch: user.branch,
      college: user.college,
      studentId: user.studentId,
      createdAt: user.createdAt
    };

    return sendSuccess(res, {
      statusCode: 200,
      message: "Login successful",
      data: {
        user: safeUser,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Clear session. Client clears stored token.
 */
export async function logout(req, res) {
  return sendSuccess(res, {
    statusCode: 200,
    message: "Logged out successfully"
  });
}

/**
 * Retrieve the current authenticated user's profile.
 */
export async function getMe(req, res) {
  return sendSuccess(res, {
    statusCode: 200,
    message: "Current user profile retrieved",
    data: req.user
  });
}
