import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { File } from './models/File.js';
import { SEED_FILES } from './scripts/seed.js';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    await connectDB();

    // Auto-seed if database is empty so dev environment is immediately functional
    const fileCount = await File.countDocuments();
    if (fileCount === 0) {
      console.log('[T-World Server] Seeding initial mock assets for development...');
      await File.insertMany(SEED_FILES);
      console.log('[T-World Server] Successfully auto-seeded 14 assets across all categories.');
    }

    app.listen(PORT, () => {
      console.log('\n======================================================');
      console.log(`[T-World Server] Live on http://localhost:${PORT}`);
      console.log(`[Files Module]   http://localhost:${PORT}/files`);
      console.log(`[AI Generator]   http://localhost:${PORT}/api/ai/generate-post`);
      console.log(`[Media Rec]      http://localhost:${PORT}/api/ai/recommend-media`);
      console.log(`[Web Client]     http://localhost:${PORT}`);
      console.log('======================================================\n');
    });
  } catch (err) {
    console.error('[T-World Server] Fatal error during startup:', err);
    process.exit(1);
  }
}

bootstrap();
