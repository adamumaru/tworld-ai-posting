import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import { File } from '../models/File.js';

export const SEED_FILES = [
  // 1. Documents - Approved
  {
    userId: 'usr_tongston_01',
    filename: 'annual-financial-report-2025.pdf',
    originalName: 'Annual Report 2025.pdf',
    category: 'documents',
    mimeType: 'application/pdf',
    sizeBytes: 2450123,
    s3Key: 'media/documents/2026/annual-financial-report-2025.pdf',
    s3Bucket: 'tworld-assets-prod',
    status: 'approved',
    moderationReason: null,
    metadata: {
      tags: ['finance', 'annual report', 'strategy', 'education', 'ebitda', 'revenue'],
      description: 'Comprehensive 2025 fiscal summary and entrepreneurial growth projections.',
      extractedKeywords: ['ebitda', 'revenue', 'financial', 'audit', 'fiscal', 'curriculum', 'scholarship']
    }
  },
  {
    userId: 'usr_tongston_01',
    filename: 'entrepreneurial-curriculum-framework-v3.pdf',
    originalName: 'Entrepreneurial Curriculum Framework.pdf',
    category: 'documents',
    mimeType: 'application/pdf',
    sizeBytes: 1890200,
    s3Key: 'media/documents/2026/curriculum-v3.pdf',
    s3Bucket: 'tworld-assets-prod',
    status: 'approved',
    moderationReason: null,
    metadata: {
      tags: ['education', 'curriculum', 'learning', 'pedagogy', 'skills'],
      description: 'Complete syllabus and lesson frameworks for secondary school enterprise education.',
      extractedKeywords: ['curriculum', 'syllabus', 'students', 'learning', 'pedagogy', 'educators']
    }
  },
  {
    userId: 'usr_tongston_01',
    filename: 'investor-pitch-deck-series-a.pdf',
    originalName: 'Investor Pitch Deck Series A.pdf',
    category: 'documents',
    mimeType: 'application/pdf',
    sizeBytes: 4210980,
    s3Key: 'media/documents/2026/pitch-deck.pdf',
    s3Bucket: 'tworld-assets-prod',
    status: 'approved',
    moderationReason: null,
    metadata: {
      tags: ['investor', 'pitch', 'funding', 'venture', 'growth', 'deck'],
      description: 'Institutional pitch deck detailing market TAM, unit economics, and hiring plans.',
      extractedKeywords: ['investor', 'pitch', 'tam', 'economics', 'funding', 'runway', 'valuation']
    }
  },

  // 2. Documents - Negative Cases (Must NEVER be returned by rec engine)
  {
    userId: 'usr_tongston_02',
    filename: 'confidential-unredacted-financial-leak.pdf',
    originalName: 'Confidential Unredacted Financial Leak.pdf',
    category: 'documents',
    mimeType: 'application/pdf',
    sizeBytes: 984021,
    s3Key: 'media/documents/2026/unredacted-leak.pdf',
    s3Bucket: 'tworld-assets-prod',
    status: 'rejected',
    moderationReason: 'Contains unauthorized PII and proprietary banking data.',
    metadata: {
      tags: ['finance', 'annual report', 'banking', 'confidential'],
      description: 'Internal leak containing unmoderated customer financial records.',
      extractedKeywords: ['finance', 'revenue', 'banking', 'report', 'ebitda']
    }
  },
  {
    userId: 'usr_tongston_01',
    filename: 'draft-curriculum-revision-pending.docx',
    originalName: 'Draft Curriculum Revision Pending.docx',
    category: 'documents',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sizeBytes: 312000,
    s3Key: 'media/documents/2026/draft-curriculum.docx',
    s3Bucket: 'tworld-assets-prod',
    status: 'scan_in_progress',
    moderationReason: null,
    metadata: {
      tags: ['education', 'curriculum', 'draft'],
      description: 'Pending document undergoing antivirus and policy scan.',
      extractedKeywords: ['curriculum', 'education', 'learning']
    }
  },

  // 3. Images - Approved
  {
    userId: 'usr_tongston_01',
    filename: 'abuja-hub-opening-ceremony.jpg',
    originalName: 'Abuja Hub Opening Ceremony.jpg',
    category: 'images',
    mimeType: 'image/jpeg',
    sizeBytes: 1540200,
    s3Key: 'media/images/2026/abuja-hub.jpg',
    s3Bucket: 'tworld-assets-prod',
    status: 'approved',
    moderationReason: null,
    metadata: {
      tags: ['hub', 'abuja', 'launch', 'event', 'community', 'opening'],
      description: 'Photograph of the ribbon-cutting event at Tongston Abuja Hub.',
      extractedKeywords: ['abuja', 'hub', 'launch', 'ribbon', 'event', 'entrepreneurs']
    }
  },
  {
    userId: 'usr_tongston_01',
    filename: 'curriculum-framework-infographic.png',
    originalName: 'Curriculum Framework Infographic.png',
    category: 'images',
    mimeType: 'image/png',
    sizeBytes: 1184920,
    s3Key: 'media/images/2026/curriculum-infographic.png',
    s3Bucket: 'tworld-assets-prod',
    status: 'approved',
    moderationReason: null,
    metadata: {
      tags: ['curriculum', 'infographic', 'education', 'learning', 'visual'],
      description: 'Visual diagram breakdown of Tongston 4-pillar education model.',
      extractedKeywords: ['curriculum', 'infographic', 'education', 'pillars', 'skills']
    }
  },
  {
    userId: 'usr_tongston_01',
    filename: 'financial-growth-chart-2025.png',
    originalName: 'Financial Growth Chart 2025.png',
    category: 'images',
    mimeType: 'image/png',
    sizeBytes: 742100,
    s3Key: 'media/images/2026/growth-chart.png',
    s3Bucket: 'tworld-assets-prod',
    status: 'approved',
    moderationReason: null,
    metadata: {
      tags: ['finance', 'chart', 'growth', 'metrics', 'annual report'],
      description: 'Quarterly revenue growth trajectory bar chart for fiscal 2025.',
      extractedKeywords: ['growth', 'revenue', 'chart', 'financial', 'quarterly']
    }
  },

  // 4. Images - Negative Cases
  {
    userId: 'usr_tongston_02',
    filename: 'inappropriate-banner.png',
    originalName: 'Inappropriate Banner.png',
    category: 'images',
    mimeType: 'image/png',
    sizeBytes: 890100,
    s3Key: 'media/images/2026/inappropriate.png',
    s3Bucket: 'tworld-assets-prod',
    status: 'rejected',
    moderationReason: 'Failed AWS Rekognition safety threshold (Content Moderation Flag).',
    metadata: {
      tags: ['banner', 'launch', 'event'],
      description: 'Flagged visual asset containing unmoderated explicit markings.',
      extractedKeywords: ['banner', 'launch', 'event']
    }
  },
  {
    userId: 'usr_tongston_01',
    filename: 'new-uploaded-mockup-scan.jpg',
    originalName: 'New Uploaded Mockup.jpg',
    category: 'images',
    mimeType: 'image/jpeg',
    sizeBytes: 450000,
    s3Key: 'media/images/2026/temp-mockup.jpg',
    s3Bucket: 'tworld-assets-prod',
    status: 'upload_initiated',
    moderationReason: null,
    metadata: {
      tags: ['mockup', 'design'],
      description: 'Newly initiated upload awaiting S3 multi-part completion.',
      extractedKeywords: ['mockup', 'design', 'ui']
    }
  },

  // 5. Videos - Approved
  {
    userId: 'usr_tongston_01',
    filename: 'abuja-hub-tour-and-highlights.mp4',
    originalName: 'Abuja Hub Tour Highlights.mp4',
    category: 'videos',
    mimeType: 'video/mp4',
    sizeBytes: 48920100,
    s3Key: 'media/videos/2026/abuja-tour.mp4',
    s3Bucket: 'tworld-assets-prod',
    status: 'approved',
    moderationReason: null,
    metadata: {
      tags: ['video', 'tour', 'abuja', 'hub', 'facilities', 'makerspace'],
      description: '90-second 4K walkthrough of the co-working and enterprise incubation labs.',
      extractedKeywords: ['abuja', 'hub', 'tour', 'video', 'incubation', 'facilities']
    }
  },
  {
    userId: 'usr_tongston_01',
    filename: 'ceo-keynote-value-creation-summit.mp4',
    originalName: 'CEO Keynote Value Creation Summit.mp4',
    category: 'videos',
    mimeType: 'video/mp4',
    sizeBytes: 94210300,
    s3Key: 'media/videos/2026/ceo-keynote.mp4',
    s3Bucket: 'tworld-assets-prod',
    status: 'approved',
    moderationReason: null,
    metadata: {
      tags: ['keynote', 'leadership', 'value creation', 'speech', 'conference'],
      description: 'Keynote presentation delivered at the African Education & Entrepreneurship Summit.',
      extractedKeywords: ['keynote', 'leadership', 'entrepreneurial', 'value', 'speech']
    }
  },

  // 6. Audio - Approved
  {
    userId: 'usr_tongston_01',
    filename: 'podcast-ep-14-building-profitable-enterprises.mp3',
    originalName: 'Building Profitable Enterprises Podcast.mp3',
    category: 'audio',
    mimeType: 'audio/mpeg',
    sizeBytes: 18450120,
    s3Key: 'media/audio/2026/podcast-ep14.mp3',
    s3Bucket: 'tworld-assets-prod',
    status: 'approved',
    moderationReason: null,
    metadata: {
      tags: ['podcast', 'interview', 'profitability', 'business', 'habits', 'cash flow'],
      description: 'Episode 14 interview with early-stage founders discussing cash runway and unit economics.',
      extractedKeywords: ['podcast', 'audio', 'profitability', 'startup', 'founders', 'cashflow']
    }
  },
  {
    userId: 'usr_tongston_01',
    filename: 'audio-guide-student-enterprise-mindset.mp3',
    originalName: 'Student Enterprise Mindset Guide.mp3',
    category: 'audio',
    mimeType: 'audio/mpeg',
    sizeBytes: 12100400,
    s3Key: 'media/audio/2026/mindset-guide.mp3',
    s3Bucket: 'tworld-assets-prod',
    status: 'approved',
    moderationReason: null,
    metadata: {
      tags: ['audio', 'education', 'mindset', 'youth', 'learning'],
      description: 'Audio lesson companion for secondary school students developing problem-solving skills.',
      extractedKeywords: ['mindset', 'enterprise', 'youth', 'students', 'learning']
    }
  }
];

export async function seedDatabase() {
  console.log('[Seeder] Starting database seed...');
  await connectDB();

  const countBefore = await File.countDocuments();
  console.log(`[Seeder] Existing files in database: ${countBefore}`);

  await File.deleteMany({});
  console.log('[Seeder] Cleared existing file documents.');

  const inserted = await File.insertMany(SEED_FILES);
  console.log(`[Seeder] Successfully seeded ${inserted.length} realistic assets.`);

  const approvedCount = await File.countDocuments({ status: 'approved' });
  const pendingCount = await File.countDocuments({ status: { $in: ['scan_in_progress', 'upload_initiated'] } });
  const rejectedCount = await File.countDocuments({ status: 'rejected' });

  console.log(`[Seeder] Status Summary: Approved: ${approvedCount} | Pending: ${pendingCount} | Rejected: ${rejectedCount}`);
  return inserted;
}

// Allow direct CLI invocation: `node src/scripts/seed.js`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      console.log('[Seeder] Seed complete.');
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seeder] Error seeding database:', err);
      await disconnectDB();
      process.exit(1);
    });
}
