/**
 * Health check utilities
 * Provides system health monitoring
 */

import { supabase } from "@/integrations/supabase/client";

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    database: boolean;
    auth: boolean;
    storage: boolean;
  };
  version: string;
  uptime: number;
}

/**
 * Perform health check
 */
export async function performHealthCheck(): Promise<HealthStatus> {
  const startTime = performance.now();

  const checks = {
    database: await checkDatabase(),
    auth: await checkAuth(),
    storage: await checkStorage(),
  };

  const allHealthy = Object.values(checks).every((check) => check === true);
  const someHealthy = Object.values(checks).some((check) => check === true);

  let status: "healthy" | "degraded" | "unhealthy" = "unhealthy";
  if (allHealthy) {
    status = "healthy";
  } else if (someHealthy) {
    status = "degraded";
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    checks,
    version: import.meta.env.VITE_APP_VERSION || "1.0.0",
    uptime: performance.now() - startTime,
  };
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<boolean> {
  try {
    const { error } = await supabase.from("conversations").select("id").limit(1);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Check auth service
 */
async function checkAuth(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.getSession();
    return !error;
  } catch {
    return false;
  }
}

/**
 * Check storage service
 */
async function checkStorage(): Promise<boolean> {
  try {
    // Check if localStorage is available
    const testKey = "__health_check__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get system metrics
 */
export function getSystemMetrics() {
  const perfWithMemory = performance as Performance & {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
    timing?: {
      loadEventEnd: number;
      navigationStart: number;
      domContentLoadedEventEnd: number;
    };
  };

  return {
    memory: perfWithMemory.memory
      ? {
          used: perfWithMemory.memory.usedJSHeapSize,
          total: perfWithMemory.memory.totalJSHeapSize,
          limit: perfWithMemory.memory.jsHeapSizeLimit,
        }
      : null,
    timing: perfWithMemory.timing
      ? {
          loadTime: perfWithMemory.timing.loadEventEnd - perfWithMemory.timing.navigationStart,
          domReady:
            perfWithMemory.timing.domContentLoadedEventEnd - perfWithMemory.timing.navigationStart,
        }
      : null,
  };
}
