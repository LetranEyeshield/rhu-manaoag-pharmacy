import { z } from "zod";

export const PatientValidator = z.object({
  firstName: z.string().min(10, "First name is required").max(50),
  middleName: z.string().optional(),
  lastName: z.string().min(10, "Last name is required").max(50),
  birthday: z.string().min(10, "Birthday is required"),
  //age: z.number().int().positive("Age must be a positive integer").optional(),
  age: z.coerce.number().int().min(0, "Age must be 0 or greater").optional(),
  address: z.string().min(10, "Address is required").max(200),
  medicines: z.array(z.string()).min(1, "Please select at least one medicine").max(50).max(20),
  // 🚨 THIS BLOCKS extra keys like $gt
  //Prevent MongoDB Operator Injection (VERY IMPORTANT)
  //.strict() is non-negotiable for APIs.
}).strict();