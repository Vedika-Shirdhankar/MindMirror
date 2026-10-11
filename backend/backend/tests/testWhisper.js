// tests/testWhisper.js
const path = require('path');
const fs = require('fs');
const { transcribeWithWhisper, checkMlHealth } = require('../services/mlService');

async function testLocalWhisper() {
  console.log('--- Checking ML Service Health ---');
  const health = await checkMlHealth();
  console.log('Health status:', health);

  // Find a sample webm file in uploads directory
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('No uploads directory found at:', uploadsDir);
    return;
  }

  const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.webm'));
  if (files.length === 0) {
    console.log('No .webm audio/video files found in uploads directory.');
    return;
  }

  const sampleFile = path.join(uploadsDir, files[0]);
  console.log(`\n--- Transcribing sample file: ${files[0]} ---`);

  try {
    const result = await transcribeWithWhisper(sampleFile, 'en');
    console.log('\nTranscription Success!');
    console.log('Detected Language:', result.language);
    console.log('Audio Duration:', result.duration, 'seconds');
    console.log('Transcript Text:', result.text || '(No speech detected)');
    console.log('Segments Count:', result.segments.length);
  } catch (err) {
    console.error('Transcription error:', err.message);
    console.log('\nNote: Make sure the Python service is running (`python ml/app.py`) and faster-whisper is installed (`pip install faster-whisper`).');
  }
}

testLocalWhisper();
