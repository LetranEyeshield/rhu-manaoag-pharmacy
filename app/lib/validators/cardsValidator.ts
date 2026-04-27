import { z } from "zod";

export const cardsValidator = z
  .object({
    cardName: z.string().min(1, "Please Select Card Name"),
    cardDate: z.string().min(1, "Please Select Card Date"),
    initialStock: z.string().optional(),
    qtyIn: z.string().optional(),
    lotNoIn: z.string().optional(),
    expiryIn: z.string().optional(),
    qtyOut: z.string().optional(),
    lotNoOut: z.string().optional(),
    expiryOut: z.string().optional(),
    balance: z.string().optional(),
    // 🚨 THIS BLOCKS extra keys like $gt
    //Prevent MongoDB Operator Injection (VERY IMPORTANT)
    //.strict() is non-negotiable for APIs.
  })
  .strict();
