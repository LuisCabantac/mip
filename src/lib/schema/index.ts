import z from "zod";

export const searchIPSchema = z.object({
  ip: z.union([z.ipv4(), z.ipv6()]),
});
