const fs = require('fs');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testTranscription() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in .env');
    return;
  }

  const videoPath = 'uploads/video-1781881155512-126200631.webm';
  if (!fs.existsSync(videoPath)) {
    console.error('Video file does not exist:', videoPath);
    return;
  }

  console.log('Reading video file and converting to base64...');
  const fileBuffer = fs.readFileSync(videoPath);
  const base64Data = fileBuffer.toString('base64');
  console.log('Base64 size:', Math.round(base64Data.length / 1024 / 1024 * 10) / 10, 'MB');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  console.log('Sending request to Gemini...');
  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: 'video/webm'
        }
      },
      { text: "Provide a complete, word-for-word transcript of the speech in this video. Do not summarize or add commentary. If there is only silence, return an empty string. If possible, preserve timestamps at the beginning of paragraphs or significant changes (e.g. '[00:12] I started to feel...')." }
    ]);
    console.log('--- TRANSCRIPT RESULT ---');
    console.log(result.response.text());
    console.log('-------------------------');
  } catch (err) {
    console.error('Gemini call failed:', err);
  }
}

testTranscription();
