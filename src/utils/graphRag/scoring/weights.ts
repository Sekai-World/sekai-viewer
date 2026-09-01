const PRIMARY_SCORE_WEIGHT = 0.5;
const SECONDARY_SCORE_WEIGHT = 1 - PRIMARY_SCORE_WEIGHT;

export const combineScores = (
  primaryScore: number,
  secondaryScore: number
): number =>
  primaryScore * PRIMARY_SCORE_WEIGHT + secondaryScore * SECONDARY_SCORE_WEIGHT;
