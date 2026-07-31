export interface ScoreWeights {
  embeddingWeight: number; // default 0.4
  llmWeight: number;       // default 0.4
  experienceWeight: number; // default 0.1
  skillWeight: number;      // default 0.1
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  embeddingWeight: 0.4,
  llmWeight: 0.4,
  experienceWeight: 0.1,
  skillWeight: 0.1,
};

export interface CalculationInput {
  embeddingScore: number;  // 0 to 100
  llmScore: number;        // 0 to 100
  experienceScore: number; // 0 to 100
  skillScore: number;      // 0 to 100
}

export interface CandidateScoreResult {
  overallScore: number;
  embeddingScore: number;
  llmScore: number;
  experienceScore: number;
  skillScore: number;
  recommendation: "Strong Fit" | "Good Fit" | "Potential Fit" | "Not a Fit";
}

export function calculateCandidateScore(
  input: CalculationInput,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): CandidateScoreResult {
  const totalWeight =
    weights.embeddingWeight +
    weights.llmWeight +
    weights.experienceWeight +
    weights.skillWeight || 1.0;

  const rawScore =
    (input.embeddingScore * weights.embeddingWeight +
      input.llmScore * weights.llmWeight +
      input.experienceScore * weights.experienceWeight +
      input.skillScore * weights.skillWeight) /
    totalWeight;

  const overallScore = Math.round(Math.max(0, Math.min(100, rawScore)));

  let recommendation: "Strong Fit" | "Good Fit" | "Potential Fit" | "Not a Fit" = "Not a Fit";
  if (overallScore >= 85) {
    recommendation = "Strong Fit";
  } else if (overallScore >= 70) {
    recommendation = "Good Fit";
  } else if (overallScore >= 50) {
    recommendation = "Potential Fit";
  }

  return {
    overallScore,
    embeddingScore: Math.round(input.embeddingScore),
    llmScore: Math.round(input.llmScore),
    experienceScore: Math.round(input.experienceScore),
    skillScore: Math.round(input.skillScore),
    recommendation,
  };
}
