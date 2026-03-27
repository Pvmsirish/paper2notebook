const MAX_LENGTH = 100_000;

/**
 * XML/HTML-like tags that could be used to break prompt boundaries.
 * Only strips tags with specific dangerous names — not all angle brackets
 * (to preserve math like "x < y").
 */
const DANGEROUS_TAG_PATTERN =
  /<\/?\s*(system|paper|instructions|prompt|assistant|user|context|message|role|tool|function_call)\b[^>]*>/gi;

/**
 * Line-level patterns that indicate prompt injection attempts.
 * Each regex is tested against individual lines (case-insensitive).
 */
const INJECTION_LINE_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous\s+(instructions|directions|prompts?)/i,
  /ignore\s+(the\s+)?(above|prior|preceding)\s+(instructions|directions|prompts?)/i,
  /disregard\s+(all\s+)?(previous|prior|above|preceding)?\s*(instructions|directions|prompts?)/i,
  /you\s+are\s+now\b/i,
  /^system\s*:/i,
  /new\s+instructions\s*:/i,
  /forget\s+(all\s+)?(previous|prior|your)\s+(instructions|rules|guidelines)/i,
  /override\s+(previous|prior|system)\s+(instructions|prompt|rules)/i,
  /do\s+not\s+follow\s+(the\s+)?(previous|prior|above|system)\s+(instructions|rules)/i,
];

export interface SanitizeResult {
  sanitized: string;
  strippedCount: number;
}

/**
 * Sanitizes extracted PDF text to mitigate prompt injection.
 *
 * Layer 1 defense:
 * 1. Strips dangerous XML/HTML-like tags (system, paper, instructions, etc.)
 * 2. Removes lines matching known prompt injection patterns
 * 3. Truncates to MAX_LENGTH characters
 */
export function sanitizeInput(text: string): SanitizeResult {
  if (!text) {
    return { sanitized: "", strippedCount: 0 };
  }

  let strippedCount = 0;

  // Step 1: Strip dangerous XML/HTML tags (preserve content between them)
  let sanitized = text.replace(DANGEROUS_TAG_PATTERN, () => {
    strippedCount++;
    return "";
  });

  // Step 2: Remove lines matching injection patterns
  const lines = sanitized.split("\n");
  const cleanLines = lines.filter((line) => {
    for (const pattern of INJECTION_LINE_PATTERNS) {
      if (pattern.test(line)) {
        strippedCount++;
        return false;
      }
    }
    return true;
  });
  sanitized = cleanLines.join("\n");

  // Step 3: Truncate to max length
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.slice(0, MAX_LENGTH);
  }

  return { sanitized, strippedCount };
}
