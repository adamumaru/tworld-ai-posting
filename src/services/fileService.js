import crypto from 'crypto';
import { File } from '../models/File.js';
import { recommendMedia } from './recommendationService.js';

/**
 * Lists files with category and status filters.
 */
export async function listFiles({ category, status, limit = 50, skip = 0 }) {
  const query = {};
  if (category && category !== 'all') {
    query.category = category;
  }
  if (status) {
    query.status = status;
  }

  const [files, total] = await Promise.all([
    File.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    File.countDocuments(query)
  ]);

  return { files, total, limit, skip };
}

/**
 * Retrieves a single file record by ID.
 */
export async function getFileById(fileId) {
  return await File.findById(fileId).lean();
}

/**
 * Simulates AWS S3 Pre-signed Upload URL generation.
 * Creates an asset record in the 'upload_initiated' state.
 */
export async function createUploadIntent({
  filename,
  originalName,
  category,
  mimeType,
  sizeBytes,
  userId = 'usr_default',
  tags = []
}) {
  const sanitizedName = (originalName || filename || 'asset').replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueKey = `media/${category}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${sanitizedName}`;
  const s3Bucket = process.env.AWS_S3_BUCKET || 'tworld-assets-prod';

  // Create file entry quarantined in upload_initiated state
  const file = await File.create({
    userId,
    filename: sanitizedName,
    originalName: originalName || filename,
    category,
    mimeType,
    sizeBytes,
    s3Key: uniqueKey,
    s3Bucket,
    status: 'upload_initiated',
    metadata: {
      tags,
      description: `User uploaded ${category} asset awaiting moderation.`,
      extractedKeywords: []
    }
  });

  // Simulated S3 pre-signed PUT URL with 15-minute expiry
  const simulatedPresignedUrl = `https://${s3Bucket}.s3.amazonaws.com/${uniqueKey}?AWSAccessKeyId=AKIAIOSFODNN7EXAMPLE&Signature=simulated_sig_${crypto.randomBytes(8).toString('hex')}&Expires=${Math.floor(Date.now() / 1000) + 900}`;

  return {
    fileId: file._id,
    s3Key: uniqueKey,
    s3Bucket,
    status: file.status,
    uploadUrl: simulatedPresignedUrl,
    instructions: 'Upload file binary to uploadUrl using HTTP PUT. Once complete, AWS Step Functions moderation pipeline will scan and callback.'
  };
}

/**
 * Simulates AWS Step Functions / Lambda moderation callback webhook.
 * Transitions asset state from 'upload_initiated' / 'scan_in_progress' to 'approved' or 'rejected'.
 */
export async function processModerationCallback({ fileId, status, moderationReason = null, tags = [], extractedKeywords = [] }) {
  if (!['approved', 'rejected', 'scan_in_progress'].includes(status)) {
    throw new Error(`Invalid moderation state transition: ${status}`);
  }

  const updateFields = {
    status,
    moderationReason: status === 'rejected' ? (moderationReason || 'Failed content moderation policy') : null
  };

  if (tags.length > 0) {
    updateFields['metadata.tags'] = tags;
  }
  if (extractedKeywords.length > 0) {
    updateFields['metadata.extractedKeywords'] = extractedKeywords;
  }

  const updatedFile = await File.findByIdAndUpdate(
    fileId,
    { $set: updateFields },
    { new: true }
  ).lean();

  if (!updatedFile) {
    throw new Error(`File asset with ID ${fileId} not found.`);
  }

  return updatedFile;
}

/**
 * Assembles unified Asset Picker payload:
 * - Top AI recommended assets based on post context (if provided)
 * - Categorized approved assets for tabbed browsing
 */
export async function getAssetPickerPayload({ postContent = '', category = 'all', limit = 20 }) {
  let recommendations = [];

  if (postContent && postContent.trim().length > 0) {
    const recResult = await recommendMedia({ postContent, categoryFilter: category, limit: 5 });
    recommendations = recResult.recommendations || [];
  }

  // Get approved assets for categorized tabs
  const query = { status: 'approved' };
  if (category && category !== 'all') {
    query.category = category;
  }

  const libraryAssets = await File.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return {
    recommendations,
    libraryAssets,
    categories: ['all', 'documents', 'images', 'videos', 'audio'],
    activeCategory: category
  };
}
