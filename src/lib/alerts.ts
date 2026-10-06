/**
 * Alert configuration and utilities
 * Defines thresholds and alert conditions
 */

export interface AlertConfig {
  name: string;
  condition: () => boolean;
  severity: "critical" | "warning" | "info";
  message: string;
  action?: () => void;
}

export const ALERT_THRESHOLDS = {
  ERROR_RATE: 0.05, // 5% error rate
  RESPONSE_TIME: 3000, // 3 seconds
  MEMORY_USAGE: 0.9, // 90% memory usage
  FAILED_REQUESTS: 10, // 10 failed requests in window
  AUTH_FAILURES: 5, // 5 auth failures in window
} as const;

/**
 * Alert manager
 */
export class AlertManager {
  private alerts: Map<string, AlertConfig> = new Map();
  private alertHistory: Array<{ alert: string; timestamp: number }> = [];

  /**
   * Register an alert
   */
  register(alert: AlertConfig): void {
    this.alerts.set(alert.name, alert);
  }

  /**
   * Check all alerts
   */
  checkAlerts(): void {
    for (const [name, alert] of this.alerts) {
      if (alert.condition()) {
        this.triggerAlert(name, alert);
      }
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(name: string, alert: AlertConfig): void {
    console.error(`[ALERT ${alert.severity.toUpperCase()}] ${alert.message}`);

    this.alertHistory.push({
      alert: name,
      timestamp: Date.now(),
    });

    // Execute action if defined
    if (alert.action) {
      alert.action();
    }

    // Send to monitoring service (Sentry, etc.)
    if (import.meta.env.PROD) {
      // TODO: Send to monitoring service
    }
  }

  /**
   * Get alert history
   */
  getHistory(since?: number): Array<{ alert: string; timestamp: number }> {
    if (since) {
      return this.alertHistory.filter((h) => h.timestamp >= since);
    }
    return this.alertHistory;
  }

  /**
   * Clear alert history
   */
  clearHistory(): void {
    this.alertHistory = [];
  }
}

// Export singleton
export const alertManager = new AlertManager();

// Register default alerts
alertManager.register({
  name: "high_error_rate",
  condition: () => {
    // TODO: Implement error rate tracking
    return false;
  },
  severity: "critical",
  message: "Error rate exceeds threshold",
});

alertManager.register({
  name: "slow_response",
  condition: () => {
    // TODO: Implement response time tracking
    return false;
  },
  severity: "warning",
  message: "Response time exceeds threshold",
});

alertManager.register({
  name: "high_memory",
  condition: () => {
    const perfWithMemory = performance as Performance & {
      memory?: {
        usedJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };

    if (perfWithMemory.memory) {
      const usage = perfWithMemory.memory.usedJSHeapSize / perfWithMemory.memory.jsHeapSizeLimit;
      return usage > ALERT_THRESHOLDS.MEMORY_USAGE;
    }
    return false;
  },
  severity: "warning",
  message: "Memory usage exceeds threshold",
});

// Check alerts periodically
if (typeof window !== "undefined") {
  setInterval(() => {
    alertManager.checkAlerts();
  }, 60000); // Check every minute
}
