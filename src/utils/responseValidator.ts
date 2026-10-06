/**
 * Response Validator - Checks AI responses for bias and quality
 */

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  score: number; // 0-100
}

interface ValidationIssue {
  type: "bias" | "formatting" | "quality";
  severity: "low" | "medium" | "high";
  message: string;
  suggestion: string;
}

// Bias detection keywords and patterns
const BIAS_INDICATORS = {
  gender: [
    /\b(women are|men are|girls are|boys are)\b/i,
    /\b(typical woman|typical man)\b/i,
    /\b(like a woman|like a man)\b/i,
    /\b(emotional woman|aggressive man)\b/i,
  ],
  caste: [
    /\b(upper caste|lower caste|scheduled caste|SC|ST|OBC)\b/i,
    /\b(brahmin|dalit|shudra)\b/i,
  ],
  religion: [/\b(muslims are|hindus are|christians are)\b/i, /\b(typical muslim|typical hindu)\b/i],
  region: [
    /\b(north indians are|south indians are)\b/i,
    /\b(typical northerner|typical southerner)\b/i,
  ],
  economic: [
    /\b(poor people|rich people)\s+(are|can't|don't)\b/i,
    /\b(you probably can't afford)\b/i,
  ],
  stereotypes: [
    /\b(all|every|always|never)\s+(women|men|muslims|hindus|poor|rich)\b/i,
    /\b(naturally|obviously|typically)\s+(emotional|aggressive|submissive)\b/i,
  ],
};

// Step-by-step formatting requirements
const STEP_PATTERNS = {
  hasSteps: /Step \d+:/i,
  hasNumbering: /\d+\./,
  hasActionItems: /✓|📍|👤|📄|⏰|💰|🔄|⚠️/,
};

// Quality indicators
const QUALITY_INDICATORS = {
  hasSections: /##\s+\d+\./,
  hasCitations: /BNS|BSA|BNSS|Section \d+/i,
  hasEmergencyContacts: /\b(181|1098|1930|112|1800-599-0019)\b/,
  hasLegalAid: /NALSA|DLSA|SLSA|legal aid/i,
};

/**
 * Validates an AI response for bias, formatting, and quality
 */
export function validateResponse(response: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  let score = 100;

  // Check for bias indicators
  for (const [category, patterns] of Object.entries(BIAS_INDICATORS)) {
    for (const pattern of patterns) {
      if (pattern.test(response)) {
        issues.push({
          type: "bias",
          severity: "high",
          message: `Potential ${category} bias detected`,
          suggestion: `Remove stereotypical language and provide neutral guidance`,
        });
        score -= 20;
      }
    }
  }

  // Check for step-by-step formatting
  if (!STEP_PATTERNS.hasSteps.test(response)) {
    issues.push({
      type: "formatting",
      severity: "medium",
      message: "Missing step-by-step format",
      suggestion: "Response should include numbered steps (Step 1:, Step 2:, etc.)",
    });
    score -= 15;
  }

  if (!STEP_PATTERNS.hasActionItems.test(response)) {
    issues.push({
      type: "formatting",
      severity: "low",
      message: "Missing action item indicators",
      suggestion: "Include icons for clarity (✓, 📍, 👤, 📄, etc.)",
    });
    score -= 5;
  }

  // Check for quality indicators
  if (!QUALITY_INDICATORS.hasSections.test(response)) {
    issues.push({
      type: "formatting",
      severity: "medium",
      message: "Missing section headers",
      suggestion: "Use numbered section headers (## 1., ## 2., etc.)",
    });
    score -= 10;
  }

  if (!QUALITY_INDICATORS.hasCitations.test(response)) {
    issues.push({
      type: "quality",
      severity: "medium",
      message: "Missing legal citations",
      suggestion: "Include specific BNS/BSA/BNSS section references",
    });
    score -= 10;
  }

  // Check response length (should be comprehensive)
  if (response.length < 500) {
    issues.push({
      type: "quality",
      severity: "medium",
      message: "Response too brief",
      suggestion: "Provide more detailed guidance",
    });
    score -= 10;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    isValid: score >= 70 && issues.filter((i) => i.severity === "high").length === 0,
    issues,
    score,
  };
}

/**
 * Checks if a response needs regeneration due to bias
 */
export function needsRegeneration(validation: ValidationResult): boolean {
  return validation.issues.some((issue) => issue.type === "bias" && issue.severity === "high");
}

/**
 * Generates feedback message for invalid responses
 */
export function getValidationFeedback(validation: ValidationResult): string {
  if (validation.isValid) {
    return "Response meets quality standards";
  }

  const highSeverityIssues = validation.issues.filter((i) => i.severity === "high");
  if (highSeverityIssues.length > 0) {
    return `Critical issues detected: ${highSeverityIssues.map((i) => i.message).join(", ")}`;
  }

  return `Quality score: ${validation.score}/100. ${validation.issues.length} issues found.`;
}

/**
 * Logs validation results for monitoring
 */
export function logValidation(conversationId: string, validation: ValidationResult): void {
  if (!validation.isValid) {
    console.warn("Response validation failed:", {
      conversationId,
      score: validation.score,
      issues: validation.issues,
    });
  }
}
