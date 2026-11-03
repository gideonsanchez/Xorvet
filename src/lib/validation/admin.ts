import { z } from "zod";

export const providerFields = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(280).default(""),
  url: z
    .string()
    .trim()
    .url()
    .refine((u) => new URL(u).protocol === "https:", "Only https destinations are allowed"),
  sortOrder: z.number().int().min(0).max(1000).default(100),
});
