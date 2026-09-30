import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { File } from '../src/models/File.js';
import { AiAuditLog } from '../src/models/AiAuditLog.js';
import { SEED_FILES } from '../src/scripts/seed.js';

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await File.insertMany(SEED_FILES);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('T-World System Integration Tests', () => {

  // 1. Files & Docs Module Endpoints
  describe('Files & Docs Module', () => {
    it('GET /files should retrieve files list', async () => {
      const res = await request(app).get('/files');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.files)).toBe(true);
      expect(res.body.data.total).toBeGreaterThan(0);
    });

    it('GET /files?type=documents should filter by category', async () => {
      const res = await request(app).get('/files?type=documents');
      expect(res.status).toBe(200);
      expect(res.body.data.files.every(f => f.category === 'documents')).toBe(true);
    });

    it('GET /files?status=approved should filter by approved state', async () => {
      const res = await request(app).get('/files?status=approved');
      expect(res.status).toBe(200);
      expect(res.body.data.files.every(f => f.status === 'approved')).toBe(true);
    });

    it('POST /files/upload-intent should initiate an upload with simulated S3 URL', async () => {
      const payload = {
        filename: 'field-research-notes.pdf',
        originalName: 'Field Notes.pdf',
        category: 'documents',
        mimeType: 'application/pdf',
        sizeBytes: 1048576,
        userId: 'usr_candidate_test'
      };

      const res = await request(app).post('/files/upload-intent').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('upload_initiated');
      expect(res.body.data.uploadUrl).toContain('s3.amazonaws.com');

      // Verify asset exists in DB quarantined in upload_initiated state
      const created = await File.findById(res.body.data.fileId);
      expect(created.status).toBe('upload_initiated');
    });

    it('POST /files/moderation-callback should simulate Step Functions moderation update', async () => {
      // Create a test file
      const file = await File.create({
        filename: 'test-pending-asset.png',
        originalName: 'Test Asset.png',
        category: 'images',
        mimeType: 'image/png',
        sizeBytes: 204800,
        s3Key: 'media/images/test-pending.png',
        status: 'scan_in_progress'
      });

      // Send rejection callback
      const callbackRes = await request(app)
        .post('/files/moderation-callback')
        .send({
          fileId: file._id.toString(),
          status: 'rejected',
          moderationReason: 'Contains unauthorized trademark logo.'
        });

      expect(callbackRes.status).toBe(200);
      expect(callbackRes.body.data.status).toBe('rejected');
      expect(callbackRes.body.data.moderationReason).toBe('Contains unauthorized trademark logo.');
    });
  });

  // 2. AI Post Generation Assistant
  describe('AI Post Generation Engine', () => {
    it('POST /api/ai/generate-post should generate a short post with hashtags', async () => {
      const res = await request(app)
        .post('/api/ai/generate-post')
        .send({
          topic: 'Tongston Entrepreneurial Hub launch in Abuja',
          mode: 'short',
          context: 'Focus on financial literacy and youth enterprise incubation.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBeDefined();
      expect(res.body.data.mode).toBe('short');
      expect(res.body.data.suggestedHashtags.length).toBeGreaterThan(0);
      expect(res.body.data.latencyMs).toBeGreaterThan(0);
    });

    it('POST /api/ai/generate-post should support all structured modes (long, bulleted, rephrase)', async () => {
      for (const mode of ['long', 'bulleted', 'rephrase']) {
        const res = await request(app)
          .post('/api/ai/generate-post')
          .send({
            topic: 'Financial discipline for African founders',
            mode,
            context: 'Cash flow management and weekly unit economic audits.'
          });

        expect(res.status).toBe(200);
        expect(res.body.data.mode).toBe(mode);
        expect(res.body.data.content.length).toBeGreaterThan(30);
      }
    });

    it('POST /api/ai/generate-post should reject empty or weak inputs with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/ai/generate-post')
        .send({ topic: '  ', mode: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('POST /api/ai/generate-post should reject invalid modes with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/ai/generate-post')
        .send({ topic: 'Valid topic', mode: 'invalid_mode' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_MODE');
    });
  });

  // 3. Smart Media Recommendation & Content Safety Boundaries
  describe('Smart Media Recommendations', () => {
    it('POST /api/ai/recommend-media should recommend relevant approved assets with match reason', async () => {
      const res = await request(app)
        .post('/api/ai/recommend-media')
        .send({
          postContent: 'Reviewing our annual financial report and curriculum strategy for 2025.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendations.length).toBeGreaterThan(0);

      const topRec = res.body.data.recommendations[0];
      expect(topRec.score).toBeGreaterThan(0.2);
      expect(topRec.matchReason).toBeDefined();
    });

    it('CRITICAL SAFETY TEST: Rejected and unapproved files must NEVER be recommended', async () => {
      // "Confidential Unredacted Financial Leak.pdf" is rejected in seed data, but has high "financial report" keyword overlap
      const res = await request(app)
        .post('/api/ai/recommend-media')
        .send({
          postContent: 'Confidential unredacted banking financial leak'
        });

      expect(res.status).toBe(200);
      const recommendedNames = res.body.data.recommendations.map(r => r.originalName);

      // Must NOT contain the rejected file
      expect(recommendedNames).not.toContain('Confidential Unredacted Financial Leak.pdf');

      // Double check every single recommended file is approved
      for (const rec of res.body.data.recommendations) {
        const fileInDb = await File.findById(rec.fileId);
        expect(fileInDb.status).toBe('approved');
      }
    });

    it('POST /api/ai/recommend-media should handle zero-match queries gracefully', async () => {
      const res = await request(app)
        .post('/api/ai/recommend-media')
        .send({
          postContent: 'Deep sea exploration of bioluminescent jellyfish tentacles in the Arctic.'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.recommendations).toEqual([]);
      expect(res.body.data.reasonCode).toBe('NO_MATCHING_APPROVED_MEDIA');
    });
  });

  // 4. Asset Picker & AI Enhancements
  describe('Asset Picker & Enhancements', () => {
    it('GET /api/files/asset-picker should return categorized assets and contextual recommendations', async () => {
      const res = await request(app)
        .get('/api/files/asset-picker?postContent=launching+abuja+hub&category=all');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.recommendations)).toBe(true);
      expect(Array.isArray(res.body.data.libraryAssets)).toBe(true);
      expect(res.body.data.libraryAssets.every(f => f.status === 'approved')).toBe(true);
    });

    it('POST /api/ai/suggest-hashtags should derive hashtags from input', async () => {
      const res = await request(app)
        .post('/api/ai/suggest-hashtags')
        .send({ text: 'Tongston Entrepreneurial Education and sustainable African leadership' });

      expect(res.status).toBe(200);
      expect(res.body.data.hashtags.length).toBeGreaterThan(0);
      expect(res.body.data.hashtags[0].startsWith('#')).toBe(true);
    });

    it('POST /api/ai/suggest-improvements should provide constructive post feedback', async () => {
      const longPostWithoutQuestion = 'We are working on an exciting new initiative today that covers many different aspects of financial education for young adults across several cities. Our team spent all weekend drafting materials.';
      const res = await request(app)
        .post('/api/ai/suggest-improvements')
        .send({ postContent: longPostWithoutQuestion });

      expect(res.status).toBe(200);
      expect(res.body.data.wordCount).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.suggestions)).toBe(true);
    });
  });

  // 5. Telemetry & Audit Logging
  describe('Audit Logging & Telemetry', () => {
    it('Should persist an audit log entry in MongoDB for every AI call', async () => {
      await request(app)
        .post('/api/ai/generate-post')
        .send({
          topic: 'Audit Trail Verification',
          mode: 'short',
          context: 'Testing MongoDB telemetry recording.'
        });

      // Small tick to allow non-blocking res.on('finish') write
      await new Promise(r => setTimeout(r, 200));

      const log = await AiAuditLog.findOne({ 'metadata.mode': 'short' }).sort({ timestamp: -1 });
      expect(log).not.toBeNull();
      expect(log.endpoint).toContain('generate-post');
      expect(log.latencyMs).toBeGreaterThan(0);
      expect(log.statusCode).toBe(200);
    });
  });
});
