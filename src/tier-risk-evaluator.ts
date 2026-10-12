export enum CreditTier {
  Bronze = "BRONZE",
  Silver = "SILVER",
  Gold = "GOLD",
  Platinum = "PLATINUM",
}

export interface CreditPolicy {
  tier: CreditTier;
  maxCreditLineWei: bigint;
  streamingFeeBps: number;
}

export class TierRiskEvaluator {
  public static evaluatePolicy(creditScore: bigint): CreditPolicy {
    if (creditScore >= 950n) {
      return {
        tier: CreditTier.Platinum,
        maxCreditLineWei: 5000000000000000000n, // 5.0 KITE
        streamingFeeBps: 20, // 0.2%
      };
    } else if (creditScore >= 850n) {
      return {
        tier: CreditTier.Gold,
        maxCreditLineWei: 2000000000000000000n, // 2.0 KITE
        streamingFeeBps: 50, // 0.5%
      };
    } else if (creditScore >= 750n) {
      return {
        tier: CreditTier.Silver,
        maxCreditLineWei: 500000000000000000n, // 0.5 KITE
        streamingFeeBps: 100, // 1.0%
      };
    } else {
      return {
        tier: CreditTier.Bronze,
        maxCreditLineWei: 0n, // 零信用授信额度（须全额质押）
        streamingFeeBps: 250, // 2.5%
      };
    }
  }
}
