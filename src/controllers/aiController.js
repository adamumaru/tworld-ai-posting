import * as aiService from '../services/aiService.js';
import { extractOrDeriveHashtags, tokenizeText } from '../utils/textUtils.js';

export async function handleGeneratePost(req, res, next) {
  try {
    const { topic, context, mode = 'short' } = req.body;

    const effectiveTopic = (topic || '').trim();
    const effectiveContext = (context || '').trim();

    // Defensive input check
    if (effectiveTopic.length < 3 && effectiveContext.length < 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Topic or context must contain at least 5 meaningful characters.',
          field: effectiveTopic.length < 3 ? 'topic' : 'context'
        }
      });
    }

    const validModes = ['short', 'long', 'bulleted', 'rephrase'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MODE',
          message: `Mode must be one of: ${validModes.join(', ')}`
        }
      });
    }

    const result = await aiService.generatePost({
      topic: effectiveTopic || 'General Update',
      context: effectiveContext,
      mode
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function handleSuggestHashtags(req, res, next) {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_TEXT',
          message: 'Text must be provided to extract or derive hashtags.'
        }
      });
    }

    const tokens = tokenizeText(text);
    const hashtags = extractOrDeriveHashtags(text, tokens);

    return res.status(200).json({
      success: true,
      data: {
        hashtags,
        count: hashtags.length
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function handleSuggestImprovements(req, res, next) {
  try {
    const { postContent } = req.body;

    if (!postContent || postContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'EMPTY_CONTENT', message: 'Provide post content to analyze.' }
      });
    }

    const trimmed = postContent.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    const sentences = trimmed.split(/[.!?]+/).filter(Boolean);

    const suggestions = [];

    // Analyze hook
    const firstSentence = sentences[0] || '';
    if (firstSentence.length > 120) {
      suggestions.push({
        type: 'hook',
        issue: 'First sentence is too long for social attention spans.',
        recommendation: 'Shorten opening sentence to under 15 words to create a stronger hook.'
      });
    }

    // Analyze length
    if (words.length > 250) {
      suggestions.push({
        type: 'length',
        issue: 'Post is unusually dense for general audience feeds.',
        recommendation: 'Break long paragraphs into 2-sentence chunks or convert key points into bullet points.'
      });
    }

    // Analyze Call to Action
    const hasQuestion = trimmed.includes('?');
    const hasCtaKeywords = /join|read|check|comment|share|learn|details|link/i.test(trimmed);

    if (!hasQuestion && !hasCtaKeywords) {
      suggestions.push({
        type: 'cta',
        issue: 'No clear prompt or call-to-action detected.',
        recommendation: 'End with an open question or clear next step to boost discussion and engagement.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        readabilityScore: Math.min(100, Math.max(40, 100 - (words.length > 150 ? 20 : 0) - (suggestions.length * 15))),
        wordCount: words.length,
        sentenceCount: sentences.length,
        suggestions
      }
    });
  } catch (err) {
    next(err);
  }
}
