import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'user_default',
      index: true
    },
    filename: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['images', 'videos', 'audio', 'documents'],
      index: true
    },
    mimeType: {
      type: String,
      required: true
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 0
    },
    s3Key: {
      type: String,
      required: true
    },
    s3Bucket: {
      type: String,
      default: 'tworld-assets-prod'
    },
    status: {
      type: String,
      required: true,
      enum: ['upload_initiated', 'scan_in_progress', 'approved', 'rejected'],
      default: 'upload_initiated',
      index: true
    },
    moderationReason: {
      type: String,
      default: null
    },
    metadata: {
      tags: {
        type: [String],
        default: []
      },
      description: {
        type: String,
        default: ''
      },
      extractedKeywords: {
        type: [String],
        default: []
      }
    }
  },
  {
    timestamps: true
  }
);

// Compound index for ultra-fast approved category queries
fileSchema.index({ status: 1, category: 1 });

export const File = mongoose.model('File', fileSchema);
