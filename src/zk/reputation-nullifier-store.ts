export class ReputationNullifierStore {
  private nullifiers = new Set<string>();

  public isSpent(nullifierHash: string): boolean {
    return this.nullifiers.has(nullifierHash);
  }

  public recordNullifier(nullifierHash: string): boolean {
    if (this.nullifiers.has(nullifierHash)) {
      return false; // Replay attempt detected
    }
    this.nullifiers.add(nullifierHash);
    return true;
  }

  public totalSpentCount(): number {
    return this.nullifiers.size;
  }
}
