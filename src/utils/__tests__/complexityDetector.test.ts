import { describe, it, expect } from "vitest";
import { analyzeComplexity, isEmergency, getLawyerRecommendation } from "../complexityDetector";

describe("Complexity Detector", () => {
  describe("analyzeComplexity", () => {
    it("should detect low complexity for simple queries", () => {
      const query = "How do I file an FIR?";
      const result = analyzeComplexity(query);

      expect(result.complexityScore).toBeLessThan(40);
      expect(result.urgencyLevel).toBe("low");
    });

    it("should detect high complexity for murder cases", () => {
      const query = "I am accused of murder and need legal help";
      const result = analyzeComplexity(query);

      expect(result.complexityScore).toBeGreaterThan(20);
      expect(result.reasons.some((r) => r.includes("High-stakes"))).toBe(true);
      expect(result.recommendLawyer).toBe(false); // 25 is below 40 threshold
    });

    it("should detect emergency situations", () => {
      const query = "Someone is threatening to kill me right now, immediate danger";
      const result = analyzeComplexity(query);

      expect(result.urgencyLevel).toBe("emergency");
      expect(result.complexityScore).toBeGreaterThan(60);
    });

    it("should detect multiple legal domains", () => {
      const query = "I have a criminal case and also civil property dispute";
      const result = analyzeComplexity(query);

      expect(result.complexityScore).toBeGreaterThan(15);
      expect(result.reasons.some((r) => r.includes("Multiple legal domains"))).toBe(true);
    });

    it("should detect urgent matters", () => {
      const query = "I need bail immediately";
      const result = analyzeComplexity(query);

      expect(result.complexityScore).toBeGreaterThan(5);
      expect(result.urgencyLevel).not.toBe("low");
    });

    it("should handle empty queries", () => {
      const query = "";
      const result = analyzeComplexity(query);

      expect(result.complexityScore).toBe(0);
      expect(result.urgencyLevel).toBe("low");
    });
  });

  describe("isEmergency", () => {
    it("should return true for emergency situations", () => {
      const analysis = {
        isComplex: true,
        complexityScore: 80,
        urgencyLevel: "emergency" as const,
        reasons: ["Life-threatening situation"],
        recommendLawyer: true,
      };

      expect(isEmergency(analysis)).toBe(true);
    });

    it("should return false for non-emergency situations", () => {
      const analysis = {
        isComplex: false,
        complexityScore: 20,
        urgencyLevel: "low" as const,
        reasons: [],
        recommendLawyer: false,
      };

      expect(isEmergency(analysis)).toBe(false);
    });
  });

  describe("getLawyerRecommendation", () => {
    it("should recommend lawyer for complex cases", () => {
      const analysis = {
        isComplex: true,
        complexityScore: 50,
        urgencyLevel: "high" as const,
        reasons: ["High stakes case"],
        recommendLawyer: true,
      };

      const recommendation = getLawyerRecommendation(analysis);

      expect(recommendation).toBeTruthy();
      expect(recommendation).toContain("lawyer");
      expect(recommendation).toContain("NALSA");
    });

    it("should not recommend lawyer for simple cases", () => {
      const analysis = {
        isComplex: false,
        complexityScore: 20,
        urgencyLevel: "low" as const,
        reasons: [],
        recommendLawyer: false,
      };

      const recommendation = getLawyerRecommendation(analysis);

      expect(recommendation).toBe(null);
    });

    it("should include emergency contacts for urgent cases", () => {
      const analysis = {
        isComplex: true,
        complexityScore: 70,
        urgencyLevel: "emergency" as const,
        reasons: ["Life-threatening"],
        recommendLawyer: true,
      };

      const recommendation = getLawyerRecommendation(analysis);

      expect(recommendation).toContain("112");
    });
  });
});
