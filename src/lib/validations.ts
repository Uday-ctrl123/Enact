import { z } from "zod";

export const authSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password must be less than 128 characters" }),
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Full name is required" })
    .max(100, { message: "Full name must be less than 100 characters" })
    .optional(),
});

export const chatMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(5000, { message: "Message must be less than 5000 characters" }),
});

export const searchQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(3, { message: "Search query must be at least 3 characters" })
    .max(500, { message: "Search query must be less than 500 characters" }),
});

export type AuthFormData = z.infer<typeof authSchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
export type SearchQueryData = z.infer<typeof searchQuerySchema>;
