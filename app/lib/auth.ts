// import jwt from "jsonwebtoken";

// export function getUserFromRequest(request: Request) {
//   const authHeader = request.headers.get("authorization");

//   if (!authHeader) return null;

//   const token = authHeader.replace("Bearer ", "");

//   try {
//     return jwt.verify(token, process.env.JWT_SECRET!);
//   } catch {
//     return null;
//   }
// }


import { getToken } from "next-auth/jwt";

export async function getUserFromRequest(request: Request) {
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  return token; // 👈 this becomes ctx.user
}