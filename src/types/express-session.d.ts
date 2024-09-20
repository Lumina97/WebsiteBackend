// src/types/express-session.d.ts
import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string; // Add your custom session property here
  }
}
