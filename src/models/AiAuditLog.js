import mongoose from 'mongoose';

const aiAuditLogSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      default: 'user_anonymous',
      index: true
    },
    requestPayloadHash: {
      type: String,
      required: true
    },
    tokensUsed: {
      prompt: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    latencyMs: {
      type: Number,
      required: true
    },
    fallbackTriggered: {
      type: Boolean,
      default: false,
      index: true
    },
    statusCode: {
      type: Number,
      required: true
    },
    error: {
      type: String,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

export const AiAuditLog = mongoose.model('AiAuditLog', aiAuditLogSchema);
