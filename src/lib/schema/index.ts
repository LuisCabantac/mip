import z from "zod";

export const searchIPSchema = z.object({
  ip: z.union([z.ipv4(), z.ipv6()]),
});

export const geolocationDataSchema = z.object({
  ip: z.string(),
  hostname: z.string(),
  city: z.string(),
  region: z.string(),
  country: z.string(),
  loc: z.string(),
  org: z.string(),
  postal: z.string(),
  timezone: z.string(),
  asn: z.string(),
  as_name: z.string(),
  as_domain: z.string(),
  country_code: z.string(),
  continent_code: z.string(),
  continent: z.string(),
});

export type GeolocationData = z.infer<typeof geolocationDataSchema>;

export const signInSchema = z.object({
  email: z.string(),
  password: z.string(),
  redirect: z.string().optional(),
});

export type Credentials = z.infer<typeof signInSchema>;
