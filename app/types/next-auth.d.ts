// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      // role?: string; // optional
    };
  }

  interface User {
    id: string;
    name: string;
    // role?: string; // optional
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    // role?: string; // optional
  }
}
