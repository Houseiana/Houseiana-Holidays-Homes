/**
 * Secure password validation following OWASP guidelines
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Maximum length check (prevent DoS attacks)
  if (password.length > 128) {
    errors.push('Password must be no more than 128 characters long');
  }

  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // At least one digit
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // At least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  }

  // Check for common weak patterns
  const commonPatterns = [
    /(.)\1{2,}/, // Three or more consecutive identical characters
    /123456/,    // Sequential numbers
    /abcdef/,    // Sequential letters
    /qwerty/i,   // Keyboard patterns
    /password/i, // Contains "password"
    /admin/i,    // Contains "admin"
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common weak patterns. Please choose a more secure password');
      break; // Only show this error once
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getPasswordStrengthScore(password: string): number {
  let score = 0;

  // Length bonus (up to 20 points)
  score += Math.min(password.length * 2, 20);

  // Character variety bonus
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

  // Additional complexity bonus
  if (password.length >= 12) score += 10;
  if (/[^\w\s]/.test(password)) score += 5; // Extra special chars

  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score -= 20;
  if (/123|abc|qwe/i.test(password)) score -= 15;

  return Math.max(0, Math.min(100, score));
}

export function getPasswordStrengthLabel(score: number): string {
  if (score < 30) return 'Very Weak';
  if (score < 50) return 'Weak';
  if (score < 70) return 'Fair';
  if (score < 85) return 'Good';
  return 'Strong';
}