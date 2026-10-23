import { sendError } from "../utils/response.js";

/**
 * Validates request data (body, query, or params) with a Zod schema.
 */
export function validate(schema, source = "body") {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const errorMessages = result.error.errors.map(
          (err) => `${err.path.join(".") || "field"}: ${err.message}`
        );
        return sendError(res, {
          statusCode: 400,
          message: "Validation failed",
          errors: errorMessages
        });
      }

      // Replace with parsed/transformed data
      req[source] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}
