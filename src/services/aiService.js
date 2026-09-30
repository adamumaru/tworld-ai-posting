import { SYSTEM_POST_PROMPT, buildUserPrompt } from '../prompts/postPrompts.js';
import { generateOfflineFallback } from './fallbackGenerator.js';
import { extractOrDeriveHashtags } from '../utils/textUtils.js';

const TIMEOUT_MS = parseInt(process.env.LLM_TIMEOUT_MS || '5000', 10);

/**
 * Invokes an external OpenAI-compatible chat completion endpoint with strict timeout.
 */
async function callOpenAI(messages, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 450
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenAI HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    return { content, usage };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`LLM call timed out after ${TIMEOUT_MS}ms`);
    }
    throw err;
  }
}

/**
 * High-performance simulated LLM response generator for local testing / zero-credential dev.
 */
async function callMockLLM({ topic, context, mode }) {
  // Simulate standard network latency (200-450ms)
  const delay = Math.floor(Math.random() * 250) + 200;
  await new Promise(resolve => setTimeout(resolve, delay));

  const fallback = generateOfflineFallback({ topic, context, mode });
  return {
    content: fallback.content,
    usage: { prompt_tokens: 120, completion_tokens: 85, total_tokens: 205 }
  };
}

/**
 * Primary AI generation orchestrator with circuit breaker and fallback isolation.
 */
export async function generatePost({ topic, context = '', mode = 'short' }) {
  const startTime = Date.now();
  const apiKey = process.env.OPENAI_API_KEY;
  const provider = process.env.LLM_PROVIDER || (apiKey ? 'openai' : 'mock');

  const messages = [
    { role: 'system', content: SYSTEM_POST_PROMPT },
    { role: 'user', content: buildUserPrompt({ topic, context, mode }) }
  ];

  let rawContent = '';
  let tokensUsed = { prompt: 0, completion: 0, total: 0 };
  let fallbackTriggered = false;
  let notice = null;

  try {
    if (provider === 'openai' && apiKey) {
      const result = await callOpenAI(messages, apiKey);
      rawContent = result.content;
      tokensUsed = {
        prompt: result.usage.prompt_tokens,
        completion: result.usage.completion_tokens,
        total: result.usage.total_tokens
      };
    } else {
      const result = await callMockLLM({ topic, context, mode });
      rawContent = result.content;
      tokensUsed = {
        prompt: result.usage.prompt_tokens,
        completion: result.usage.completion_tokens,
        total: result.usage.total_tokens
      };
    }
  } catch (err) {
    console.warn(`[AiService] Primary LLM failed (${err.message}). Engaging deterministic fallback...`);
    const fallback = generateOfflineFallback({ topic, context, mode });
    rawContent = fallback.content;
    fallbackTriggered = true;
    notice = fallback.notice;
    tokensUsed = { prompt: 0, completion: 0, total: 0 };
  }

  const latencyMs = Date.now() - startTime;
  const suggestedHashtags = extractOrDeriveHashtags(rawContent);
  const wordCount = rawContent.split(/\s+/).filter(Boolean).length;

  return {
    content: rawContent,
    mode,
    wordCount,
    fallbackTriggered,
    notice,
    suggestedHashtags,
    tokensUsed,
    latencyMs
  };
}
