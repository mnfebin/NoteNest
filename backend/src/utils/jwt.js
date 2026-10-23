import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Signs a payload into a JWT token.
 */
export function signToken(payload, expiresIn = env.JWT_EXPIRES_IN) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

/**
 * Verifies a JWT token and returns decoded payload.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}
