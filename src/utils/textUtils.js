import crypto from 'crypto';

// Standard English stop words to filter out noise in search queries
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn\'t',
  'it', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'my', 'myself', 'no',
  'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some',
  'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until',
  'up', 'very', 'was', 'wasn\'t', 'we', 'were', 'weren\'t', 'what', 'when', 'where',
  'which', 'while', 'who', 'whom', 'why', 'with', 'won\'t', 'would', 'you', 'your',
  'yours', 'yourself', 'yourselves'
]);

/**
 * Normalizes input text into cleaned, stemmed lowercase tokens.
 */
export function tokenizeText(text) {
  if (!text || typeof text !== 'string') return [];

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

/**
 * Generates an SHA-256 hash of a payload for telemetry and deduplication.
 */
export function hashPayload(payload) {
  const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

/**
 * Extracts hashtags from generated text or derives them from salient keywords.
 */
export function extractOrDeriveHashtags(text, fallbackKeywords = []) {
  if (!text) return [];
  const existingTags = text.match(/#[A-Za-z0-9_]+/g);
  if (existingTags && existingTags.length > 0) {
    return Array.from(new Set(existingTags)).slice(0, 5);
  }

  // Derive from salient tokens if none explicitly present in text
  const tokens = tokenizeText(text);
  const combined = [...tokens, ...fallbackKeywords];
  const unique = Array.from(new Set(combined))
    .slice(0, 4)
    .map(w => `#${w.charAt(0).toUpperCase() + w.slice(1)}`);

  return unique.length > 0 ? unique : ['#Tongston', '#ValueCreation', '#Entrepreneurship'];
}
