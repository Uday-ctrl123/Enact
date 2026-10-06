import { env } from "./env";

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  extra?: Record<string, string | number | boolean | null>;
}

class ErrorMonitoring {
  private initialized = false;

  init() {
    if (this.initialized || !env.VITE_SENTRY_DSN) return;

    // Initialize error monitoring (e.g., Sentry)
    if (typeof window !== "undefined") {
      // Set up global error handlers
      window.addEventListener("error", this.handleError.bind(this));
      window.addEventListener("unhandledrejection", this.handleRejection.bind(this));

      this.initialized = true;
    }
  }

  private handleError(event: ErrorEvent) {
    this.captureException(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  }

  private handleRejection(event: PromiseRejectionEvent) {
    this.captureException(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { type: "unhandledrejection" }
    );
  }

  captureException(error: Error, extra?: Record<string, string | number | boolean | null>) {
    if (!this.initialized) {
      console.error("Error (monitoring not initialized):", error);
      return;
    }

    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      extra,
    };

    // Send to monitoring service
    this.sendReport(report);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error("Error Report:", report);
    }
  }

  captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
    extra?: Record<string, string | number | boolean | null>
  ) {
    if (!this.initialized) return;

    const report = {
      message,
      level,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      extra,
    };

    this.sendReport(report);
  }

  setUser(userId: string, email?: string, extra?: Record<string, string | number | boolean>) {
    if (!this.initialized) return;

    // Store user context for error reports
    sessionStorage.setItem(
      "monitoring_user",
      JSON.stringify({
        id: userId,
        email,
        ...extra,
      })
    );
  }

  addBreadcrumb(
    message: string,
    category?: string,
    data?: Record<string, string | number | boolean | null>
  ) {
    if (!this.initialized) return;

    const breadcrumb = {
      message,
      category: category || "default",
      timestamp: new Date().toISOString(),
      data,
    };

    // Store breadcrumbs for context
    const breadcrumbs = JSON.parse(sessionStorage.getItem("monitoring_breadcrumbs") || "[]");
    breadcrumbs.push(breadcrumb);

    // Keep only last 50 breadcrumbs
    if (breadcrumbs.length > 50) {
      breadcrumbs.shift();
    }

    sessionStorage.setItem("monitoring_breadcrumbs", JSON.stringify(breadcrumbs));
  }

  private async sendReport(report: Record<string, unknown>) {
    try {
      // Get user context
      const userContext = sessionStorage.getItem("monitoring_user");
      if (userContext) {
        report.user = JSON.parse(userContext);
      }

      // Get breadcrumbs
      const breadcrumbs = sessionStorage.getItem("monitoring_breadcrumbs");
      if (breadcrumbs) {
        report.breadcrumbs = JSON.parse(breadcrumbs);
      }

      // Send to monitoring service (Sentry, LogRocket, etc.)
      // For now, log to console in development
      if (import.meta.env.DEV) {
        console.error("Error Report:", report);
      }

      // In production, you would send to your monitoring service
      // Example: Sentry SDK would be initialized and used here
      // if (env.VITE_SENTRY_DSN) {
      //   Sentry.captureException(report);
      // }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to send error report:", error);
      }
    }
  }
}

// Global monitoring instance
export const monitoring = new ErrorMonitoring();
