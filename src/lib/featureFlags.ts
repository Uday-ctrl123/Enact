/**
 * Feature flags system
 * Allows toggling features without deployment
 */

import { FEATURES } from "./constants";

export type FeatureFlag = keyof typeof FEATURES;

interface FeatureFlagConfig {
  enabled: boolean;
  rolloutPercentage?: number;
  allowedUsers?: string[];
  allowedEnvironments?: string[];
}

/**
 * Feature flags manager
 */
export class FeatureFlagsManager {
  private flags: Map<string, FeatureFlagConfig> = new Map();
  private userId: string | null = null;

  constructor() {
    // Initialize with default flags from constants
    Object.entries(FEATURES).forEach(([key, value]) => {
      this.flags.set(key, { enabled: value });
    });

    // Load overrides from localStorage
    this.loadOverrides();
  }

  /**
   * Set user ID for user-specific flags
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Check if feature is enabled
   */
  isEnabled(flag: string): boolean {
    const config = this.flags.get(flag);

    if (!config) return false;
    if (!config.enabled) return false;

    // Check environment
    if (config.allowedEnvironments && config.allowedEnvironments.length > 0) {
      const env = import.meta.env.MODE || "production";
      if (!config.allowedEnvironments.includes(env)) {
        return false;
      }
    }

    // Check user allowlist
    if (config.allowedUsers && config.allowedUsers.length > 0) {
      if (!this.userId || !config.allowedUsers.includes(this.userId)) {
        return false;
      }
    }

    // Check rollout percentage
    if (config.rolloutPercentage !== undefined && config.rolloutPercentage < 100) {
      if (!this.userId) return false;

      // Deterministic hash-based rollout
      const hash = this.hashUserId(this.userId);
      const percentage = (hash % 100) + 1;

      return percentage <= config.rolloutPercentage;
    }

    return true;
  }

  /**
   * Enable a feature flag
   */
  enable(flag: string, config?: Partial<FeatureFlagConfig>): void {
    const existing = this.flags.get(flag) || { enabled: false };
    this.flags.set(flag, {
      ...existing,
      ...config,
      enabled: true,
    });
    this.saveOverrides();
  }

  /**
   * Disable a feature flag
   */
  disable(flag: string): void {
    const existing = this.flags.get(flag);
    if (existing) {
      this.flags.set(flag, { ...existing, enabled: false });
      this.saveOverrides();
    }
  }

  /**
   * Set rollout percentage
   */
  setRolloutPercentage(flag: string, percentage: number): void {
    const existing = this.flags.get(flag);
    if (existing) {
      this.flags.set(flag, { ...existing, rolloutPercentage: percentage });
      this.saveOverrides();
    }
  }

  /**
   * Get all flags
   */
  getAllFlags(): Record<string, FeatureFlagConfig> {
    const result: Record<string, FeatureFlagConfig> = {};
    this.flags.forEach((config, key) => {
      result[key] = config;
    });
    return result;
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.flags.clear();
    Object.entries(FEATURES).forEach(([key, value]) => {
      this.flags.set(key, { enabled: value });
    });
    localStorage.removeItem("feature_flags_overrides");
  }

  /**
   * Hash user ID for deterministic rollout
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Load overrides from localStorage
   */
  private loadOverrides(): void {
    try {
      const stored = localStorage.getItem("feature_flags_overrides");
      if (stored) {
        const overrides = JSON.parse(stored);
        Object.entries(overrides).forEach(([key, config]) => {
          this.flags.set(key, config as FeatureFlagConfig);
        });
      }
    } catch (error) {
      console.error("Failed to load feature flag overrides:", error);
    }
  }

  /**
   * Save overrides to localStorage
   */
  private saveOverrides(): void {
    try {
      const overrides: Record<string, FeatureFlagConfig> = {};
      this.flags.forEach((config, key) => {
        // Only save if different from default
        const defaultValue = FEATURES[key as FeatureFlag];
        if (defaultValue === undefined || config.enabled !== defaultValue) {
          overrides[key] = config;
        }
      });
      localStorage.setItem("feature_flags_overrides", JSON.stringify(overrides));
    } catch (error) {
      console.error("Failed to save feature flag overrides:", error);
    }
  }
}

// Export singleton
export const featureFlags = new FeatureFlagsManager();

// Helper hook for React components
export function useFeatureFlag(flag: string): boolean {
  return featureFlags.isEnabled(flag);
}
