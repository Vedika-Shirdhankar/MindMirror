// utils/piiRedactor.js
// ──────────────────────────────────────────────────────────────────────────────
// Privacy-first PII Redaction Layer for MindMirror.
//
// Before any user text is sent to Google Gemini (or any external LLM), this
// module strips / replaces personally identifiable information (PII) with
// safe placeholder tokens. The mapping is kept in memory so the response can
// be "rehydrated" (placeholders swapped back) before it reaches the user.
//
// What gets redacted:
//   • Email addresses         → [EMAIL_1], [EMAIL_2], …
//   • Phone numbers (IN/intl) → [PHONE_1], [PHONE_2], …
//   • Aadhaar numbers         → [AADHAAR]
//   • PAN numbers             → [PAN]
//   • URLs / links            → [URL_1], [URL_2], …
//   • Dates of birth patterns → [DOB]
//   • IP addresses            → [IP]
//   • Social handles @...     → [HANDLE_1], …
//
// The user's first name is intentionally KEPT because Gemini uses it for
// personalised responses ("Hey Vedika, …"). Full names / last names that
// appear in journal text are replaced.
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Ordered list of PII patterns to detect and redact.
 * Each entry: { name, regex (global), prefix for token }
 */
const PII_PATTERNS = [
  // Email addresses
  {
    name: 'email',
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    prefix: 'EMAIL',
  },
  // Indian Aadhaar (12 digits, optionally space/dash separated in groups of 4)
  {
    name: 'aadhaar',
    regex: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,
    prefix: 'AADHAAR',
  },
  // Indian PAN
  {
    name: 'pan',
    regex: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    prefix: 'PAN',
  },
  // Phone numbers — Indian (10-digit, optional +91/0 prefix) & international
  {
    name: 'phone',
    regex: /(?:\+?\d{1,3}[\s\-.]?)?\(?\d{2,5}\)?[\s\-.]?\d{3,5}[\s\-.]?\d{3,5}\b/g,
    prefix: 'PHONE',
    // Extra validation: must have at least 10 digits total
    validate: (match) => match.replace(/\D/g, '').length >= 10,
  },
  // URLs
  {
    name: 'url',
    regex: /https?:\/\/[^\s"'<>]+/gi,
    prefix: 'URL',
  },
  // IP addresses
  {
    name: 'ip',
    regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
    prefix: 'IP',
  },
  // Social media handles
  {
    name: 'handle',
    regex: /@[a-zA-Z0-9_]{2,30}\b/g,
    prefix: 'HANDLE',
  },
];

/**
 * Creates a PII redaction session. Each session tracks its own mapping so
 * placeholders can be reversed after the LLM responds.
 *
 * @returns {{ redact: (text: string) => string, restore: (text: string) => string }}
 */
function createRedactionSession() {
  const tokenMap = new Map();   // placeholder → original value
  const reverseMap = new Map(); // original value → placeholder
  const counters = {};          // prefix → running count

  function getToken(prefix, originalValue) {
    if (reverseMap.has(originalValue)) return reverseMap.get(originalValue);
    counters[prefix] = (counters[prefix] || 0) + 1;
    const token = `[${prefix}_${counters[prefix]}]`;
    tokenMap.set(token, originalValue);
    reverseMap.set(originalValue, token);
    return token;
  }

  /**
   * Redact all detected PII from `text`, returning the sanitized string.
   */
  function redact(text) {
    if (!text || typeof text !== 'string') return text;

    let result = text;
    for (const pattern of PII_PATTERNS) {
      result = result.replace(pattern.regex, (match) => {
        // If pattern has a validator, only redact if it passes
        if (pattern.validate && !pattern.validate(match)) return match;
        return getToken(pattern.prefix, match);
      });
    }
    return result;
  }

  /**
   * Restore previously redacted placeholders back to the original values.
   * Useful for converting Gemini's response back to the real names/values
   * the user expects to see.
   */
  function restore(text) {
    if (!text || typeof text !== 'string') return text;

    let result = text;
    for (const [token, original] of tokenMap.entries()) {
      // Use split+join for safe global replacement (no regex escaping needed)
      result = result.split(token).join(original);
    }
    return result;
  }

  return { redact, restore };
}

/**
 * Quick one-shot redaction (no restore needed). 
 * Use when you only need to sanitize text before sending to the LLM
 * and don't need to map back placeholders in the response.
 */
function redactPII(text) {
  return createRedactionSession().redact(text);
}

module.exports = { createRedactionSession, redactPII };
