export interface ScanResult {
  warnings: string[];
}

/**
 * Dangerous patterns to scan for in generated Python code.
 * Each entry has a regex pattern and a human-readable description.
 */
const DANGEROUS_PATTERNS: { pattern: RegExp; description: string }[] = [
  { pattern: /\bos\.system\s*\(/, description: "os.system() — shell command execution" },
  { pattern: /\bos\.popen\s*\(/, description: "os.popen() — shell command execution" },
  { pattern: /\bos\.exec\w*\s*\(/, description: "os.exec*() — process execution" },
  { pattern: /\bos\.remove\s*\(/, description: "os.remove() — file deletion" },
  { pattern: /\bos\.unlink\s*\(/, description: "os.unlink() — file deletion" },
  { pattern: /\bsubprocess\b/, description: "subprocess — shell command execution" },
  { pattern: /\beval\s*\(/, description: "eval() — arbitrary code execution" },
  { pattern: /\bexec\s*\(/, description: "exec() — arbitrary code execution" },
  { pattern: /\b__import__\s*\(/, description: "__import__() — dynamic module import" },
  { pattern: /\brequests\.(get|post|put|delete|patch|head)\s*\(/, description: "requests HTTP call — network access" },
  { pattern: /\burllib\b/, description: "urllib — network access" },
  { pattern: /\bhttp\.client\b/, description: "http.client — network access" },
  { pattern: /\bsocket\b/, description: "socket — raw network access" },
  { pattern: /open\s*\(\s*["']\/etc\//, description: "open('/etc/...') — sensitive file access" },
];

/**
 * Pattern for suspiciously long base64-encoded strings (>100 chars of A-Za-z0-9+/=).
 */
const BASE64_PATTERN = /["'][A-Za-z0-9+/=]{100,}["']/;

/**
 * Extracts only the code blocks (```python) from an LLM response.
 */
function extractCodeBlocks(response: string): string[] {
  const blocks: string[] = [];
  const lines = response.split("\n");
  let i = 0;

  while (i < lines.length) {
    const fenceMatch = lines[i].match(/^```(python|py)\s*$/i);
    if (fenceMatch) {
      const blockLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```\s*$/)) {
        blockLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push(blockLines.join("\n"));
    } else {
      i++;
    }
  }

  return blocks;
}

/**
 * Scans generated LLM output for dangerous code patterns.
 * Only inspects Python code blocks, not markdown.
 * Returns warnings but does NOT block the output.
 */
export function scanOutput(response: string): ScanResult {
  const warnings: string[] = [];

  if (!response || response.trim().length === 0) {
    return { warnings };
  }

  const codeBlocks = extractCodeBlocks(response);
  const allCode = codeBlocks.join("\n");

  if (!allCode) {
    return { warnings };
  }

  // Check each dangerous pattern
  for (const { pattern, description } of DANGEROUS_PATTERNS) {
    if (pattern.test(allCode)) {
      // Find the matching line for context
      const lines = allCode.split("\n");
      const matchingLine = lines.find((line) => pattern.test(line));
      const context = matchingLine ? matchingLine.trim() : "";
      warnings.push(
        `Flagged: ${description}${context ? ` — "${context}"` : ""}`
      );
    }
  }

  // Check for long base64 strings
  if (BASE64_PATTERN.test(allCode)) {
    warnings.push(
      "Flagged: Suspicious long base64-encoded string (>100 chars) — possible obfuscated code"
    );
  }

  return { warnings };
}
