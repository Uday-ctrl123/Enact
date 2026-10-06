/**
 * API response validation using Zod
 * Ensures type safety for API responses
 */

import { z } from "zod";

// Conversation schema
export const conversationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  user_id: z.string().uuid(),
  is_pinned: z.boolean().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export type ConversationResponse = z.infer<typeof conversationSchema>;

// Message schema
export const messageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  content: z.string().min(1),
  role: z.enum(["user", "assistant", "system"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

export type MessageResponse = z.infer<typeof messageSchema>;

// User schema
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

export type UserResponse = z.infer<typeof userSchema>;

// Error response schema
export const errorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.any().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  hasMore: z.boolean(),
});

export type PaginationResponse = z.infer<typeof paginationSchema>;

/**
 * Validate API response against schema
 */
export function validateResponse<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Validate array of responses
 */
export function validateArrayResponse<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T[] } | { success: false; error: z.ZodError } {
  const arraySchema = z.array(schema);
  const result = arraySchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Create paginated response schema
 */
export function createPaginatedSchema<T>(itemSchema: z.ZodSchema<T>) {
  return z.object({
    data: z.array(itemSchema),
    pagination: paginationSchema,
  });
}
