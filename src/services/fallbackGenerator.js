import { extractOrDeriveHashtags, tokenizeText } from '../utils/textUtils.js';

/**
 * Deterministic offline rule-based generator used during network timeouts or LLM outages.
 * Guarantees zero downtime and safe, well-structured output.
 */
export function generateOfflineFallback({ topic, context = '', mode = 'short' }) {
  const cleanTopic = topic.trim();
  const cleanContext = context ? context.trim() : '';
  const tokens = tokenizeText(`${cleanTopic} ${cleanContext}`);
  const tags = extractOrDeriveHashtags(`${cleanTopic} ${cleanContext}`, tokens);

  let content = '';

  switch (mode) {
    case 'short':
      content = cleanContext
        ? `Excited to share an update on ${cleanTopic}. ${cleanContext}. Building sustainable value and driving entrepreneurial progress together.\n\n${tags.join(' ')}`
        : `Excited to announce progress on ${cleanTopic}. Turning bold ideas into tangible value, influence, and sustainable impact.\n\n${tags.join(' ')}`;
      break;

    case 'long':
      content = `When tackling ${cleanTopic}, true growth comes from execution rather than passive observation.\n\n${
        cleanContext
          ? `${cleanContext}\n\n`
          : ''
      }At Tongston, our focus remains anchored in entrepreneurial thinking—equipping individuals and teams to create measurable value in their spheres of influence.\n\nSustainable success requires clear systems, disciplined resource management, and a commitment to solving real-world challenges.\n\nWhat is your team’s biggest priority in this area this quarter?\n\n${tags.join(' ')}`;
      break;

    case 'bulleted':
      content = `Key insights and priorities regarding ${cleanTopic}:\n\n• Strategic Alignment: Clarify the core value proposition before scaling activities.\n• Execution Discipline: ${
        cleanContext ? cleanContext : 'Focus on high-leverage outcomes rather than cosmetic vanity metrics.'
      }\n• Measurable Impact: Track tangible influence, profitability, and operational sustainability.\n\nWhich of these areas are you focusing on most today?\n\n${tags.join(' ')}`;
      break;

    case 'rephrase':
      const source = cleanContext || cleanTopic;
      const capitalized = source.charAt(0).toUpperCase() + source.slice(1);
      content = `Reflecting on our latest milestone: ${capitalized.replace(/\.$/, '')}.\n\nBy focusing on practical execution and cross-functional collaboration, we continue to build solutions that deliver real-world impact.\n\n${tags.join(' ')}`;
      break;

    default:
      content = `${cleanTopic}\n\n${cleanContext}\n\n${tags.join(' ')}`;
  }

  return {
    content,
    mode,
    wordCount: content.split(/\s+/).filter(Boolean).length,
    suggestedHashtags: tags,
    fallbackTriggered: true,
    notice: 'Generated via deterministic offline fallback engine (upstream provider unavailable or timed out).'
  };
}
