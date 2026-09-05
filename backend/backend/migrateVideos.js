// migrateVideos.js
// Standalone script to migrate legacy local videos to Cloudinary.
// Usage: node migrateVideos.js
// Ensure CLOUDINARY_URL and MONGODB_URI are set in .env before running.

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const { uploadToCloudinary, resolveUploadPath } = require('./services/storageService');
const VideoReflection = require('./models/VideoReflection');
const fs = require('fs');

async function runMigration() {
  if (!process.env.CLOUDINARY_URL) {
    console.error('CLOUDINARY_URL is missing in .env');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing in .env');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const legacyVideos = await VideoReflection.find({
    videoUrl: { $regex: '^/uploads/' },
    cloudinaryPublicId: { $exists: false }
  });

  console.log(`Found ${legacyVideos.length} legacy videos to migrate.`);

  let successCount = 0;
  let failCount = 0;

  for (const video of legacyVideos) {
    console.log(`Processing: ${video._id} - ${video.title}`);
    const localPath = resolveUploadPath(video.videoUrl);
    
    if (!fs.existsSync(localPath)) {
      console.warn(`[SKIP] Local file not found: ${localPath}`);
      failCount++;
      continue;
    }

    try {
      console.log(`  Uploading to Cloudinary...`);
      const { url, publicId } = await uploadToCloudinary(localPath);
      
      console.log(`  Updating database...`);
      video.videoUrl = url;
      video.cloudinaryPublicId = publicId;
      await video.save();

      console.log(`  ✅ Successfully migrated.`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Migration failed for ${video._id}:`, err.message);
      failCount++;
    }
  }

  console.log('\n--- Migration Summary ---');
  console.log(`Total:   ${legacyVideos.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed:  ${failCount}`);
  console.log('-------------------------');
  console.log('Note: Local files have not been deleted. You can safely delete them once you verify Cloudinary playback.');
  
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Migration script error:', err);
  process.exit(1);
});
