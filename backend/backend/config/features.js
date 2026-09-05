module.exports = {
  videoAi: process.env.FEATURE_VIDEO_AI !== 'false',
  lifeReport: process.env.FEATURE_LIFE_REPORT !== 'false',
  companionMemory: process.env.FEATURE_COMPANION_MEMORY !== 'false'
};
