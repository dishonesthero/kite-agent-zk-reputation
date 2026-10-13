export interface CreditAccountPosition {
  agentAddress: string;
  borrowedCreditWei: bigint;
  collateralLockedWei: bigint;
  lastPaymentTimestamp: number;
}

export class CreditDefaultLiquidator {
  public readonly gracePeriodSeconds: number;
  public readonly liquidationPenaltyBps: number;

  constructor(gracePeriodSeconds: number = 86400, liquidationPenaltyBps: number = 500) {
    this.gracePeriodSeconds = gracePeriodSeconds;
    this.liquidationPenaltyBps = liquidationPenaltyBps;
  }

  public assessLiquidation(position: CreditAccountPosition, currentTimestamp: number): { isLiquidatable: boolean; penaltyAmountWei: bigint } {
    const isOverdue = currentTimestamp > position.lastPaymentTimestamp + this.gracePeriodSeconds;
    if (isOverdue && position.borrowedCreditWei > 0n) {
      const penaltyAmountWei = (position.borrowedCreditWei * BigInt(this.liquidationPenaltyBps)) / 10000n;
      return { isLiquidatable: true, penaltyAmountWei };
    }
    return { isLiquidatable: false, penaltyAmountWei: 0n };
  }
}
