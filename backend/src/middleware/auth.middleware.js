import { verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";
import prisma from "../config/prisma.js";

/**
 * Ensures the request has a valid Bearer JWT token and attaches user to req.user.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, {
        statusCode: 401,
        message: "Authentication required. Please provide a valid Bearer token."
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return sendError(res, {
        statusCode: 401,
        message: "Invalid or expired token. Please log in again."
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user) {
      return sendError(res, {
        statusCode: 401,
        message: "User account no longer exists."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, {
      statusCode: 401,
      message: "Authentication failed",
      errors: [error.message]
    });
  }
}

/**
 * Attaches user to req.user if a valid token is provided, but does not block if unauthenticated.
 */
export async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            semester: true,
            branch: true,
            college: true
          }
        });
        if (user) {
          req.user = user;
        }
      }
    }
  } catch (error) {
    // Ignore error for optional authentication
  }
  next();
}

/**
 * Restricts access to users having one of the specified roles (e.g. ADMIN).
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, {
        statusCode: 401,
        message: "Authentication required"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, {
        statusCode: 403,
        message: "Forbidden: You do not have permission to perform this action."
      });
    }

    next();
  };
}
