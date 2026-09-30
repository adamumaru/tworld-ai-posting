import { File } from '../models/File.js';
import { tokenizeText } from '../utils/textUtils.js';

// Category cues that suggest preferred media types
const CATEGORY_CUES = {
  documents: ['report', 'pdf', 'framework', 'curriculum', 'document', 'deck', 'slides', 'whitepaper', 'policy', 'study'],
  images: ['photo', 'image', 'picture', 'infographic', 'chart', 'diagram', 'visual', 'banner', 'poster'],
  videos: ['video', 'tour', 'clip', 'footage', 'keynote', 'recording', 'watch', 'webinar'],
  audio: ['audio', 'podcast', 'episode', 'listen', 'interview', 'voice', 'sound']
};

/**
 * Calculates a normalized relevance score and human-readable explanation
 * between post content and an approved file asset.
 */
function scoreFileRelevance(postTokens, file, detectedCategoryCues) {
  const fileTokens = new Set([
    ...tokenizeText(file.originalName),
    ...(file.metadata?.tags || []).map(t => t.toLowerCase()),
    ...(file.metadata?.extractedKeywords || []).map(k => k.toLowerCase())
  ]);

  if (fileTokens.size === 0 || postTokens.length === 0) {
    return { score: 0, reason: 'Insufficient metadata for matching' };
  }

  // Find overlapping tokens
  const matchedTokens = postTokens.filter(t => fileTokens.has(t));
  const uniqueMatches = Array.from(new Set(matchedTokens));

  // Compute Jaccard-like overlap
  const baseOverlap = uniqueMatches.length / Math.min(postTokens.length, 10);

  // Check category alignment bonus
  let categoryBonus = 0;
  if (detectedCategoryCues.includes(file.category)) {
    categoryBonus = 0.15;
  }

  // Tag direct matches
  const matchedTags = (file.metadata?.tags || []).filter(tag =>
    postTokens.includes(tag.toLowerCase())
  );

  let score = Math.min(1.0, (baseOverlap * 0.7) + (matchedTags.length * 0.15) + categoryBonus);

  // Generate explainable reason
  let reason = '';
  if (matchedTags.length > 0) {
    reason = `Matched key tags: [${matchedTags.slice(0, 3).join(', ')}]`;
  } else if (uniqueMatches.length > 0) {
    reason = `Matched relevant keywords: [${uniqueMatches.slice(0, 3).join(', ')}]`;
  } else if (categoryBonus > 0) {
    reason = `Format match for ${file.category} context`;
  } else {
    reason = 'General topical correlation';
  }

  return {
    score: parseFloat(score.toFixed(2)),
    reason,
    matchedKeywords: uniqueMatches
  };
}

/**
 * Smart Media Recommendation Service.
 * DEFENSIVE SECURITY RULE: Only assets with `status === 'approved'` are ever retrieved.
 */
export async function recommendMedia({ postContent, categoryFilter = 'all', limit = 5, minScore = 0.20 }) {
  if (!postContent || typeof postContent !== 'string' || postContent.trim().length === 0) {
    return {
      recommendations: [],
      querySummary: { extractedTokens: [], totalApprovedPoolScanned: 0 },
      message: 'Post content was empty. Provide post text to receive contextual media suggestions.',
      reasonCode: 'EMPTY_QUERY_CONTEXT'
    };
  }

  const postTokens = tokenizeText(postContent);

  // Detect category hints from post context
  const detectedCategoryCues = [];
  for (const [cat, cues] of Object.entries(CATEGORY_CUES)) {
    if (cues.some(cue => postTokens.includes(cue))) {
      detectedCategoryCues.push(cat);
    }
  }

  // Query database with strict approval filter
  const query = { status: 'approved' };
  if (categoryFilter && categoryFilter !== 'all') {
    query.category = categoryFilter;
  }

  const approvedFiles = await File.find(query).lean();

  if (!approvedFiles || approvedFiles.length === 0) {
    return {
      recommendations: [],
      querySummary: { extractedTokens: postTokens, totalApprovedPoolScanned: 0 },
      message: 'No approved media assets currently exist in the library matching this filter.',
      reasonCode: 'NO_APPROVED_ASSETS_IN_LIBRARY'
    };
  }

  // Score each approved candidate
  const scoredCandidates = approvedFiles
    .map(file => {
      const { score, reason, matchedKeywords } = scoreFileRelevance(postTokens, file, detectedCategoryCues);
      return {
        fileId: file._id,
        originalName: file.originalName,
        category: file.category,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        s3Key: file.s3Key,
        s3Url: `https://${file.s3Bucket}.s3.amazonaws.com/${file.s3Key}`,
        metadata: file.metadata,
        score,
        matchReason: reason,
        matchedKeywords
      };
    })
    .filter(item => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scoredCandidates.length === 0) {
    return {
      recommendations: [],
      querySummary: {
        extractedTokens: postTokens,
        totalApprovedPoolScanned: approvedFiles.length
      },
      message: 'No approved media reached the relevance threshold for your post context. You can browse the full library.',
      reasonCode: 'NO_MATCHING_APPROVED_MEDIA'
    };
  }

  return {
    recommendations: scoredCandidates,
    querySummary: {
      extractedTokens: postTokens,
      detectedCategories: detectedCategoryCues,
      totalApprovedPoolScanned: approvedFiles.length
    },
    count: scoredCandidates.length,
    reasonCode: 'SUCCESS'
  };
}
