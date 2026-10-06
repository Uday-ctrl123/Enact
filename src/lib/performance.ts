// Performance monitoring utilities

// Type definitions for Web Vitals
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure page load performance
  measurePageLoad() {
    if (typeof window !== "undefined" && "performance" in window) {
      window.addEventListener("load", () => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;

        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          download: navigation.responseEnd - navigation.responseStart,
          domParse: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          domReady: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          pageLoad: navigation.loadEventEnd - navigation.fetchStart,
        };

        if (import.meta.env.DEV) {
          console.log("Performance Metrics:", metrics);
        }

        // Send to analytics service in production
        if (import.meta.env.PROD) {
          this.sendMetrics(metrics);
        }
      });
    }
  }

  // Measure Core Web Vitals
  measureWebVitals() {
    if (typeof window !== "undefined") {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          if (import.meta.env.DEV) {
            console.log("LCP:", lastEntry.startTime);
          }
          this.metrics.set("lcp", lastEntry.startTime);
        }
      }).observe({ entryTypes: ["largest-contentful-paint"] });

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          const fid = fidEntry.processingStart - fidEntry.startTime;
          if (import.meta.env.DEV) {
            console.log("FID:", fid);
          }
          this.metrics.set("fid", fid);
        });
      }).observe({ entryTypes: ["first-input"] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as LayoutShift;
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
          }
        });
        if (import.meta.env.DEV) {
          console.log("CLS:", clsValue);
        }
        this.metrics.set("cls", clsValue);
      }).observe({ entryTypes: ["layout-shift"] });
    }
  }

  // Measure custom timing
  startTiming(label: string) {
    if (typeof window !== "undefined" && "performance" in window) {
      performance.mark(`${label}-start`);
    }
  }

  endTiming(label: string) {
    if (typeof window !== "undefined" && "performance" in window) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);

      const measure = performance.getEntriesByName(label)[0];
      if (measure) {
        if (import.meta.env.DEV) {
          console.log(`${label} took ${measure.duration}ms`);
        }
        this.metrics.set(label, measure.duration);
      }
    }
  }

  private sendMetrics(metrics: Record<string, number>) {
    // In production, send to analytics service (Google Analytics, etc.)
    // For now, log in development only
    if (import.meta.env.DEV) {
      console.log("Performance Metrics to send:", {
        metrics,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }

    // Example: Send to Google Analytics if configured
    // if (window.gtag) {
    //   window.gtag('event', 'performance_metrics', { metrics });
    // }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}

// Initialize performance monitoring
export const performanceMonitor = PerformanceMonitor.getInstance();
