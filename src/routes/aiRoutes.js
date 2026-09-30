import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import * as recommendationController from '../controllers/recommendationController.js';

const router = Router();

// AI Post Generation (short, long, bulleted, rephrase)
router.post('/generate-post', aiController.handleGeneratePost);

// Smart Media Recommendations (Approved-only)
router.post('/recommend-media', recommendationController.handleRecommendMedia);

// Smart Hashtag Suggestions
router.post('/suggest-hashtags', aiController.handleSuggestHashtags);

// Post Quality & Hook Improvements
router.post('/suggest-improvements', aiController.handleSuggestImprovements);

export default router;
