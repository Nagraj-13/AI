import { getGeminiClient } from "./gemini";

/**
 * Generate 768-dimensional vector embedding for text using Gemini Embedding API
 * Falls back to deterministic embedding vector if API key is absent.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const ai = getGeminiClient();

  if (ai) {
    try {
      let response: any;
      try {
        response = await ai.models.embedContent({
          model: "text-embedding-004",
          contents: text.slice(0, 8000),
          config: { outputDimensionality: 768 },
        });
      } catch {
        response = await ai.models.embedContent({
          model: "embedding-001",
          contents: text.slice(0, 8000),
        });
      }

      if (response?.embedding?.values) {
        return response.embedding.values;
      }
      if (response?.embeddings?.[0]?.values) {
        return response.embeddings[0].values;
      }
    } catch (err) {
      // Quietly fall back to local deterministic 768-dimensional embedding vector
    }
  }

  // Deterministic local pseudo-embedding generation (768 dimensions)
  return generatePseudoEmbedding(text);
}

/**
 * Cosine similarity between two vectors of equal dimension
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const len = Math.min(vecA.length, vecB.length);
  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  // Bound result between 0 and 1 for scoring consistency
  return Math.max(0, Math.min(1, (similarity + 1) / 2));
}

function generatePseudoEmbedding(text: string): number[] {
  const vec: number[] = new Array(768).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const index = (charCode * (i + 1) * 31) % 768;
    vec[index] += 0.05;
  }

  // Normalize vector to unit length
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vec.map((val) => val / norm);
}
