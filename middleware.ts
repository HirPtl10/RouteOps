import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect all routes except auth API endpoints, static assets, etc.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|truck.svg).*)"],
};
