/**
 * Complexity Detector - Identifies complex legal cases that need lawyer consultation
 */

interface ComplexityAnalysis {
  isComplex: boolean;
  complexityScore: number; // 0-100
  reasons: string[];
  recommendLawyer: boolean;
  urgencyLevel: "low" | "medium" | "high" | "emergency";
}

// Keywords indicating complex legal situations
const COMPLEXITY_INDICATORS = {
  multipleLegalDomains: [
    /criminal.*civil/i,
    /property.*family/i,
    /constitutional.*criminal/i,
    /tax.*criminal/i,
  ],
  highStakes: [
    /murder|homicide|death/i,
    /rape|sexual assault/i,
    /kidnapping|abduction/i,
    /terrorism|sedition/i,
    /life imprisonment/i,
    /death penalty|capital punishment/i,
    /crore|lakh rupees/i,
    /property worth/i,
  ],
  multipleParties: [
    /multiple defendants/i,
    /class action/i,
    /joint family dispute/i,
    /partnership dispute/i,
    /corporate/i,
  ],
  precedentSetting: [
    /constitutional validity/i,
    /supreme court/i,
    /high court/i,
    /landmark case/i,
    /public interest litigation|PIL/i,
  ],
  technicalComplexity: [
    /intellectual property|IP|patent|trademark|copyright/i,
    /cyber crime|hacking|data breach/i,
    /securities|stock market|SEBI/i,
    /international law/i,
    /arbitration/i,
    /merger|acquisition/i,
  ],
  urgentMatters: [
    /arrest warrant/i,
    /police custody/i,
    /bail/i,
    /anticipatory bail/i,
    /injunction/i,
    /stay order/i,
    /tomorrow|today|urgent/i,
  ],
};

// Emergency keywords
const EMERGENCY_KEYWORDS = [
  /immediate danger/i,
  /life threatening/i,
  /being attacked/i,
  /kidnapped/i,
  /held captive/i,
  /suicide/i,
  /self harm/i,
];

/**
 * Analyzes query complexity and determines if lawyer consultation is needed
 */
export function analyzeComplexity(query: string): ComplexityAnalysis {
  let complexityScore = 0;
  const reasons: string[] = [];
  let urgencyLevel: "low" | "medium" | "high" | "emergency" = "low";

  // Check for emergency situations
  for (const pattern of EMERGENCY_KEYWORDS) {
    if (pattern.test(query)) {
      return {
        isComplex: true,
        complexityScore: 100,
        reasons: ["Emergency situation detected"],
        recommendLawyer: true,
        urgencyLevel: "emergency",
      };
    }
  }

  // Check for multiple legal domains
  for (const pattern of COMPLEXITY_INDICATORS.multipleLegalDomains) {
    if (pattern.test(query)) {
      complexityScore += 20;
      reasons.push("Multiple legal domains involved");
      break;
    }
  }

  // Check for high stakes
  for (const pattern of COMPLEXITY_INDICATORS.highStakes) {
    if (pattern.test(query)) {
      complexityScore += 25;
      reasons.push("High-stakes legal matter");
      urgencyLevel = "high";
      break;
    }
  }

  // Check for multiple parties
  for (const pattern of COMPLEXITY_INDICATORS.multipleParties) {
    if (pattern.test(query)) {
      complexityScore += 15;
      reasons.push("Multiple parties involved");
      break;
    }
  }

  // Check for precedent-setting cases
  for (const pattern of COMPLEXITY_INDICATORS.precedentSetting) {
    if (pattern.test(query)) {
      complexityScore += 30;
      reasons.push("Precedent-setting or constitutional matter");
      break;
    }
  }

  // Check for technical complexity
  for (const pattern of COMPLEXITY_INDICATORS.technicalComplexity) {
    if (pattern.test(query)) {
      complexityScore += 20;
      reasons.push("Technically complex legal area");
      break;
    }
  }

  // Check for urgent matters
  for (const pattern of COMPLEXITY_INDICATORS.urgentMatters) {
    if (pattern.test(query)) {
      complexityScore += 10;
      if (urgencyLevel === "low") urgencyLevel = "medium";
      reasons.push("Time-sensitive matter");
      break;
    }
  }

  // Determine if lawyer is recommended
  const recommendLawyer = complexityScore >= 40;

  // Adjust urgency based on complexity
  if (complexityScore >= 70 && urgencyLevel !== "emergency") {
    urgencyLevel = "high";
  } else if (complexityScore >= 40 && urgencyLevel === "low") {
    urgencyLevel = "medium";
  }

  return {
    isComplex: complexityScore >= 40,
    complexityScore,
    reasons,
    recommendLawyer,
    urgencyLevel,
  };
}

/**
 * Generates lawyer recommendation message based on complexity
 */
export function getLawyerRecommendation(analysis: ComplexityAnalysis): string | null {
  if (!analysis.recommendLawyer) {
    return null;
  }

  let message = "\n\n---\n\n## 👨‍⚖️ Professional Legal Consultation Recommended\n\n";

  if (analysis.urgencyLevel === "emergency") {
    message += "🚨 **URGENT**: This is an emergency situation. ";
    message += "Please contact emergency services immediately:\n";
    message += "- Police Emergency: **112**\n";
    message += "- Women Helpline: **181**\n";
    message += "- Child Helpline: **1098**\n\n";
  }

  message +=
    "Based on your situation, I strongly recommend consulting with a professional lawyer because:\n\n";

  analysis.reasons.forEach((reason, index) => {
    message += `${index + 1}. ${reason}\n`;
  });

  message += "\n### 📞 How to Get Legal Help:\n\n";
  message += "**Free Legal Aid Services:**\n";
  message += "- National Legal Services Authority (NALSA): **1800-110-116**\n";
  message += "- District Legal Services Authority (DLSA): Visit your local district court\n";
  message += "- State Legal Services Authority (SLSA): Contact your state legal services\n\n";

  message += "**Eligibility for Free Legal Aid:**\n";
  message += "- Women, children, persons with disabilities\n";
  message += "- SC/ST community members\n";
  message += "- Annual income below ₹3 lakhs\n";
  message += "- Victims of trafficking, mass disasters\n\n";

  message += "**Finding a Lawyer:**\n";
  message += "- Bar Council of India: https://www.barcouncilofindia.org/\n";
  message += "- State Bar Council: Contact your state bar association\n";
  message += "- Legal Aid Clinics: Available at most district courts\n\n";

  if (analysis.urgencyLevel === "high") {
    message += "⚠️ **Time is critical** - Please seek legal consultation as soon as possible.\n";
  }

  return message;
}

/**
 * Checks if immediate emergency response is needed
 */
export function isEmergency(analysis: ComplexityAnalysis): boolean {
  return analysis.urgencyLevel === "emergency";
}
