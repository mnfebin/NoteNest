/**
 * Formats and sends standard API success responses.
 */
export function sendSuccess(res, { statusCode = 200, message = "Success", data = null, meta = undefined }) {
  const payload = {
    success: true,
    message,
    data
  };
  if (meta !== undefined) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}

/**
 * Formats and sends standard API error responses.
 */
export function sendError(res, { statusCode = 400, message = "Invalid request", errors = [] }) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  });
}
