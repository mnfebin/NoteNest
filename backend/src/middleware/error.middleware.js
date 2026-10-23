import { sendError } from "../utils/response.js";
import { env } from "../config/env.js";

/**
 * Handles 404 routes.
 */
export function notFoundHandler(req, res, next) {
  return sendError(res, {
    statusCode: 404,
    message: `Resource not found on endpoint: ${req.method} ${req.originalUrl}`
  });
}

/**
 * Centralized error handler.
 */
export function errorHandler(err, req, res, next) {
  console.error("💥 Unhandled Error:", err);

  const statusCode = err.statusCode || (err.status >= 100 && err.status < 600 ? err.status : 500);
  const message = err.message || "An unexpected internal server error occurred.";

  const errors = env.NODE_ENV === "development" ? [err.stack] : [];

  return sendError(res, {
    statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined
  });
}
