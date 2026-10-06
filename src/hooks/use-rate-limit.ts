import { useRef } from "react";
import { RateLimiter } from "@/lib/security";

/**
 * Hook to use rate limiting in components
 * @param maxRequests Maximum number of requests allowed
 * @param windowMs Time window in milliseconds
 * @returns Object with isAllowed function and getRemainingRequests function
 */
export function useRateLimit(maxRequests: number = 10, windowMs: number = 60000) {
  const rateLimiterRef = useRef<RateLimiter>(new RateLimiter(maxRequests, windowMs));

  const isAllowed = (identifier: string): boolean => {
    return rateLimiterRef.current.isAllowed(identifier);
  };

  const getRemainingRequests = (identifier: string): number => {
    return rateLimiterRef.current.getRemainingRequests(identifier);
  };

  return { isAllowed, getRemainingRequests };
}
