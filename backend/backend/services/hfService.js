// services/hfService.js
const { HfInference } = require('@huggingface/inference');

// Ensure the HF token is defined in .env as HF_API_TOKEN
const hf = new HfInference(process.env.HF_API_TOKEN);

/**
 * Generic text generation (e.g., for action extraction or letters).
 * @param {string} prompt - The prompt to feed the model.
 * @param {object} [options] - Generation options (max tokens, temperature, etc.)
 * @returns {Promise<string>} - The generated text.
 */
async function generate(prompt, options = { max_new_tokens: 400, temperature: 0.3 }) {
  // Replace with your own model repo if you have a custom one.
  const modelRepo = 'google/flan-t5-base'; // default public model that supports text generation
  const result = await hf.textGeneration({
    model: modelRepo,
    inputs: prompt,
    parameters: options,
  });
  return result.generated_text;
}

/**
 * Simple classification (e.g., sentiment or action label).
 * @param {string} text - Input text.
 * @returns {Promise<Array<{label:string,score:number}>>}
 */
async function classifyText(text) {
  const modelRepo = 'distilbert-base-uncased-finetuned-sst-2-english'; // example sentiment model
  const result = await hf.textClassification({
    model: modelRepo,
    inputs: text,
    parameters: { top_k: 5 },
  });
  return result; // array of {label, score}
}

module.exports = { generate, classifyText };
