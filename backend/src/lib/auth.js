import { SignJWT, jwtVerify } from 'jose';

// Secret key from environment variable
// We use a fallback for development but strongly recommend a strong secret in production.
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key_change_me_in_production';
const key = new TextEncoder().encode(SECRET_KEY);

/**
 * Creates a JWT token.
 * @param {Object} payload - The user details to store inside the token.
 * @returns {Promise<string>} The signed JWT string.
 */
export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h') // Token expires in 2 hours
    .sign(key);
}

/**
 * Verifies a JWT token.
 * @param {string} token - The JWT string to verify.
 * @returns {Promise<Object|null>} The decoded payload if valid, null otherwise.
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    // If token is expired or invalid, it throws an error
    return null;
  }
}
