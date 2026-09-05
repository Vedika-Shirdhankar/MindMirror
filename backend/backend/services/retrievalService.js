import AnchorItem from '../models/AnchorItem.js';

/**
 * Calculates time-decayed recency score between 0 and 1
 */
const calculateRecencyScore = (createdAt) => {
  const daysOld = (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
  return Math.exp(-daysOld / 30); // 30-day half-life decay
};

/**
 * Calculates simple tag-match text similarity (0 to 1)
 */
const calculateSimilarity = (text, item) => {
  const lowerText = text.toLowerCase();
  if (!item.tags || item.tags.length === 0) return 0.2; // default base weight

  const matches = item.tags.filter(tag => lowerText.includes(tag.toLowerCase()));
  return matches.length / item.tags.length;
};

export const fetchTopAnchors = async (userId, targetCategory, userInput = '') => {
  const items = await AnchorItem.find({ userId, category: targetCategory });

  if (!items.length) return [];

  const WEIGHTS = { similarity: 0.4, recency: 0.3, effectiveness: 0.3 };

  const maxEffectiveness = Math.max(...items.map(i => i.effectivenessScore), 1);

  const scoredItems = items.map(item => {
    const similarityScore = calculateSimilarity(userInput, item);
    const recencyScore = calculateRecencyScore(item.createdAt);
    const normalizedEffectiveness = item.effectivenessScore / maxEffectiveness;

    const totalScore =
      WEIGHTS.similarity * similarityScore +
      WEIGHTS.recency * recencyScore +
      WEIGHTS.effectiveness * normalizedEffectiveness;

    return { item, score: totalScore };
  });

  // Sort descending by calculated score and fetch top 3
  return scoredItems
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(entry => entry.item);
};