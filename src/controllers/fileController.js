import * as fileService from '../services/fileService.js';

export async function getFiles(req, res, next) {
  try {
    const { category, type, status, limit, skip } = req.query;
    const cat = category || type; // Support both ?category= and ?type=

    const result = await fileService.listFiles({
      category: cat,
      status,
      limit: limit ? parseInt(limit, 10) : 50,
      skip: skip ? parseInt(skip, 10) : 0
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function getFile(req, res, next) {
  try {
    const { id } = req.params;
    const file = await fileService.getFileById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        error: { code: 'FILE_NOT_FOUND', message: `File with ID ${id} not found.` }
      });
    }

    return res.status(200).json({
      success: true,
      data: file
    });
  } catch (err) {
    next(err);
  }
}

export async function postUploadIntent(req, res, next) {
  try {
    const { filename, originalName, category, mimeType, sizeBytes, userId, tags } = req.body;

    if (!category || !['images', 'videos', 'audio', 'documents'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CATEGORY',
          message: 'Category must be one of: images, videos, audio, documents'
        }
      });
    }

    if (!mimeType || !sizeBytes) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_METADATA', message: 'mimeType and sizeBytes are required.' }
      });
    }

    const intent = await fileService.createUploadIntent({
      filename: filename || originalName,
      originalName: originalName || filename,
      category,
      mimeType,
      sizeBytes,
      userId,
      tags
    });

    return res.status(201).json({
      success: true,
      data: intent
    });
  } catch (err) {
    next(err);
  }
}

export async function postModerationCallback(req, res, next) {
  try {
    const { fileId, status, moderationReason, tags, extractedKeywords } = req.body;

    if (!fileId || !status) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'fileId and status are required.' }
      });
    }

    const updated = await fileService.processModerationCallback({
      fileId,
      status,
      moderationReason,
      tags: tags || [],
      extractedKeywords: extractedKeywords || []
    });

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function getAssetPicker(req, res, next) {
  try {
    const { postContent, category, limit } = req.query;

    const payload = await fileService.getAssetPickerPayload({
      postContent: postContent || '',
      category: category || 'all',
      limit: limit ? parseInt(limit, 10) : 20
    });

    return res.status(200).json({
      success: true,
      data: payload
    });
  } catch (err) {
    next(err);
  }
}
