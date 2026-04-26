// import DOMPurify from "dompurify";
// import { JSDOM } from "jsdom";

// const window = new JSDOM("").window;
// const purify = DOMPurify(window as any);

// export function sanitizeInput(input: string) {
//   return purify.sanitize(input);
// }

// export function sanitizeObject(obj: any): any {
//   if (typeof obj === "string") {
//     return sanitizeInput(obj);
//   }

//   // if (Array.isArray(obj)) {
//   //   return obj.map(sanitizeObject);
//   // }

//   if (Array.isArray(obj)) {
//     return obj.map((item) => sanitizeInput(item));
//   }

//   if (obj !== null && typeof obj === "object") {
//     const result: any = {};
//     for (const key in obj) {
//       result[key] = sanitizeObject(obj[key]);
//     }
//     return result;
//   }

//   return obj; // numbers, booleans, etc.
// }

export function sanitizeObject(obj: any) {
  if (!obj) return obj;

  const sanitized: any = {};

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === "string") {
      sanitized[key] = value.trim(); // basic safe
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((v) =>
        typeof v === "string" ? v.trim() : v
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}