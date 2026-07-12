import { auth } from "../auth";
import { Role } from "@prisma/client";

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Validates the current user session and asserts they possess one of the allowed roles.
 * Throws AuthError if unauthenticated (401) or unauthorized (403).
 */
export async function assertUserRole(allowedRoles: Role[]) {
  const session = await auth();

  if (!session?.user) {
    throw new AuthError(401, "Authentication required.");
  }

  const userRole = session.user.role;
  if (!userRole || !allowedRoles.includes(userRole as Role)) {
    throw new AuthError(403, "Access denied. Insufficient permissions.");
  }

  return session;
}

/**
 * Checks if the current user possesses one of the allowed roles without throwing an error.
 */
export async function hasUserRole(allowedRoles: Role[]): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.role) return false;
  return allowedRoles.includes(session.user.role as Role);
}
