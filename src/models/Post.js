import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'user_default',
      index: true
    },
    topic: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      enum: ['short', 'long', 'bulleted', 'rephrase'],
      default: 'short'
    },
    attachedFiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
      }
    ],
    suggestedHashtags: {
      type: [String],
      default: []
    },
    aiGenerated: {
      type: Boolean,
      default: true
    },
    fallbackTriggered: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    }
  },
  {
    timestamps: true
  }
);

export const Post = mongoose.model('Post', postSchema);
