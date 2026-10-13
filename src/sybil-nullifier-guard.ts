export interface NullifierRecord {
  nullifierHash: string;
  agentAddress: string;
  registeredSlot: bigint;
  expirySlot: bigint;
}

export class SybilNullifierGuard {
  private nullifiers: Map<string, NullifierRecord> = new Map();
  public readonly defaultLockDurationSlots: bigint;

  constructor(defaultLockDurationSlots: bigint = 50000n) {
    this.defaultLockDurationSlots = defaultLockDurationSlots;
  }

  public registerNullifier(nullifierHash: string, agentAddress: string, currentSlot: bigint): void {
    const existing = this.nullifiers.get(nullifierHash);
    if (existing && currentSlot < existing.expirySlot) {
      throw new Error(`Sybil alert: Nullifier ${nullifierHash} already in active use by ${existing.agentAddress}`);
    }

    this.nullifiers.set(nullifierHash, {
      nullifierHash,
      agentAddress,
      registeredSlot: currentSlot,
      expirySlot: currentSlot + this.defaultLockDurationSlots,
    });
  }

  public isNullifierActive(nullifierHash: string, currentSlot: bigint): boolean {
    const record = this.nullifiers.get(nullifierHash);
    if (!record) return false;
    return currentSlot < record.expirySlot;
  }
}
