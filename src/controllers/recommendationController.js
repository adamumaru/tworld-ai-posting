import * as recommendationService from '../services/recommendationService.js';

export async function handleRecommendMedia(req, res, next) {
  try {
    const { postContent, categoryFilter = 'all', limit = 5, minScore = 0.20 } = req.body;

    if (!postContent || typeof postContent !== 'string' || postContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_POST_CONTENT',
          message: 'Post content must be provided to evaluate media recommendations.'
        }
      });
    }

    const validCategories = ['all', 'documents', 'images', 'videos', 'audio'];
    if (!validCategories.includes(categoryFilter)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CATEGORY_FILTER',
          message: `Category filter must be one of: ${validCategories.join(', ')}`
        }
      });
    }

    const result = await recommendationService.recommendMedia({
      postContent,
      categoryFilter,
      limit: parseInt(limit, 10) || 5,
      minScore: parseFloat(minScore) || 0.20
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}
