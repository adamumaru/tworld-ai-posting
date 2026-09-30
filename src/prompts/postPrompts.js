/**
 * System prompt establishing tone, brand philosophy, and output constraints.
 */
export const SYSTEM_POST_PROMPT = `
You are the Tongston T-World Smart Posting Assistant.
Tongston's core philosophy centers on entrepreneurial thinking: turning ideas into tangible Value, Influence, and Profitability (VIP) in personal, professional, and public life.

Core Voice Guidelines:
1. Tone: Professional, forward-looking, high-agency, and practical.
2. Structure: Crisp hooks, substantive body, and clear engagement/calls-to-action.
3. Zero-Slop Constraint: Avoid generic filler (e.g. "In today's fast-paced world", "delve into", "game-changing"). Write with concrete details.
4. Output Format: Return only the final post content with appropriate spacing and 3-4 relevant hashtags at the bottom. Do NOT include intro or meta explanations.
`;

/**
 * Builds user instructions tailored to the chosen structure/mode.
 */
export function buildUserPrompt({ topic, context = '', mode = 'short' }) {
  const contextBlock = context ? `\nAdditional Context/Notes: "${context}"` : '';

  switch (mode) {
    case 'short':
      return `
Write a punchy, high-impact short post (40-70 words) for a professional social feed.
Topic: "${topic}"${contextBlock}

Requirements:
- Grab attention with a strong first sentence.
- Communicate the core value clearly.
- Conclude with a strong closing thought and 3-4 relevant hashtags.
`.trim();

    case 'long':
      return `
Write a thought-leadership post (120-180 words) providing perspective and deep insight.
Topic: "${topic}"${contextBlock}

Requirements:
- Open with a compelling observation or industry challenge.
- Deliver 2-3 substantive points on entrepreneurial execution, value creation, or long-term impact.
- Conclude with an open question to stimulate professional discussion, followed by relevant hashtags.
`.trim();

    case 'bulleted':
      return `
Write an actionable, structured post with clear bullet points.
Topic: "${topic}"${contextBlock}

Requirements:
- Brief 1-2 sentence setup.
- Exactly 3-4 structured, takeaway bullet points with bold subheadings.
- Brief closing prompt + 3-4 hashtags.
`.trim();

    case 'rephrase':
      return `
Rephrase and polish the following draft to maximize clarity, tone, and professional engagement.
Draft to refine: "${context || topic}"

Requirements:
- Remove clunky phrasing, run-on sentences, and grammatical ambiguities.
- Elevate vocabulary while maintaining natural, human flow.
- Preserve all core facts and intent. Include relevant hashtags.
`.trim();

    default:
      return `Write an engaging professional post on: "${topic}"${contextBlock}`;
  }
}
