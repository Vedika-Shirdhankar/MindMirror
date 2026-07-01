require('dotenv').config();
const { analyzeVideoReflection } = require('./utils/videoAnalysis');
const fs = require('fs');

async function run() {
  fs.writeFileSync('./dummy.webm', 'hello');
  try {
    const res = await analyzeVideoReflection('./dummy.webm', 'video/webm');
    console.log(res);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
run();
