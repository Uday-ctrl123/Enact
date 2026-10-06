/**
 * Password validation utilities
 * Implements strong password requirements
 */

import { INPUT_LIMITS } from "./constants";

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

/**
 * Common passwords to reject
 * In production, this should be a larger list or use a service like HaveIBeenPwned
 */
const COMMON_PASSWORDS = [
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "monkey",
  "1234567",
  "letmein",
  "trustno1",
  "dragon",
  "baseball",
  "iloveyou",
  "master",
  "sunshine",
  "ashley",
  "bailey",
  "passw0rd",
  "shadow",
  "123123",
  "654321",
];

/**
 * Validate password strength and requirements
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strength: "weak" | "medium" | "strong" = "weak";

  // Check minimum length
  if (password.length < INPUT_LIMITS.MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${INPUT_LIMITS.MIN_PASSWORD_LENGTH} characters long`);
  }

  // Check maximum length
  if (password.length > INPUT_LIMITS.MAX_PASSWORD_LENGTH) {
    errors.push(`Password must not exceed ${INPUT_LIMITS.MAX_PASSWORD_LENGTH} characters`);
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // Check for number
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Check against common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push("Password is too common. Please choose a more unique password");
  }

  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push("Password should not contain repeated characters");
  }

  // Calculate strength
  if (errors.length === 0) {
    let strengthScore = 0;

    if (password.length >= 12) strengthScore++;
    if (password.length >= 16) strengthScore++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strengthScore++;
    if (/\d/.test(password)) strengthScore++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strengthScore++;
    if (!/(.)\1{2,}/.test(password)) strengthScore++;

    if (strengthScore >= 5) {
      strength = "strong";
    } else if (strengthScore >= 3) {
      strength = "medium";
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Check if password has been breached
 * This is a placeholder - in production, integrate with HaveIBeenPwned API
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  // TODO: Implement HaveIBeenPwned API integration
  // For now, just check against common passwords
  return COMMON_PASSWORDS.includes(password.toLowerCase());
}

/**
 * Generate a strong random password
 */
export function generateStrongPassword(length: number = 16): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const all = uppercase + lowercase + numbers + special;

  let password = "";

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
