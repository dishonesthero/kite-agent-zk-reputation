export interface ReputationDecayConfig {
  halfLifeEpochs: number;
  inactivityPenaltyBps: number; // 基础罚分 BPS
}

export class CreditDecayManager {
  public readonly config: ReputationDecayConfig;

  constructor(config: ReputationDecayConfig = { halfLifeEpochs: 180, inactivityPenaltyBps: 150 }) {
    this.config = config;
  }

  public calculateDecayedScore(initialScore: bigint, elapsedEpochs: number): bigint {
    if (elapsedEpochs <= 0) return initialScore;

    // 每经过 30 个 Epoch，按 inactivityPenaltyBps 进行线性衰减，但不可低于 600 分最低门槛
    const decayFactor = BigInt(Math.floor(elapsedEpochs / 30) * this.config.inactivityPenaltyBps);
    const reduction = (initialScore * decayFactor) / 10000n;
    const finalScore = initialScore - reduction;

    return finalScore < 600n ? 600n : finalScore;
  }
}
