import { env } from "./env";

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean | null>;
  userId?: string;
}

class Analytics {
  private initialized = false;

  init() {
    if (this.initialized || !env.VITE_ANALYTICS_ID) return;

    // Initialize analytics service (e.g., Google Analytics, Mixpanel, etc.)
    if (typeof window !== "undefined") {
      // Example: Google Analytics 4
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${env.VITE_ANALYTICS_ID}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
      }

      gtag("js", new Date());
      gtag("config", env.VITE_ANALYTICS_ID, {
        page_title: document.title,
        page_location: window.location.href,
      });

      this.initialized = true;
    }
  }

  track(event: AnalyticsEvent) {
    if (!this.initialized) return;

    try {
      // Send to analytics service
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", event.name, {
          ...event.properties,
          user_id: event.userId,
        });
      }

      // Also log to console in development
      if (import.meta.env.DEV) {
        console.log("Analytics Event:", event);
      }
    } catch (error) {
      console.error("Analytics tracking failed:", error);
    }
  }

  page(path: string, title?: string) {
    if (!this.initialized) return;

    try {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("config", env.VITE_ANALYTICS_ID, {
          page_path: path,
          page_title: title || document.title,
        });
      }
    } catch (error) {
      console.error("Analytics page tracking failed:", error);
    }
  }

  identify(userId: string, properties?: Record<string, string | number | boolean>) {
    if (!this.initialized) return;

    try {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("config", env.VITE_ANALYTICS_ID, {
          user_id: userId,
          custom_map: properties,
        });
      }
    } catch (error) {
      console.error("Analytics identify failed:", error);
    }
  }
}

// Global analytics instance
export const analytics = new Analytics();

// Type declarations for global gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
