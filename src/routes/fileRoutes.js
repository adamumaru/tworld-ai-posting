import { Router } from 'express';
import * as fileController from '../controllers/fileController.js';

const router = Router();

// Files & Docs listing with category & status filters
router.get('/', fileController.getFiles);

// Asset Picker unified payload
router.get('/asset-picker', fileController.getAssetPicker);

// Single file retrieval
router.get('/:id', fileController.getFile);

// AWS S3 upload pre-signed URL simulation
router.post('/upload-intent', fileController.postUploadIntent);

// AWS Step Functions moderation callback simulation
router.post('/moderation-callback', fileController.postModerationCallback);

export default router;
