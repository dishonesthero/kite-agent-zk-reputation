import { ethers } from "ethers";

export interface ZKReputationPayload {
  agentAddress: string;
  creditScore: bigint;
  nullifier: string;
}

export class ProofGenerator {
  public generateDeterministicNullifier(agentAddress: string, secretSalt: string): string {
    return ethers.solidityPackedKeccak256(
      ["address", "string"],
      [agentAddress, secretSalt]
    );
  }

  public validateScoreRange(score: bigint): boolean {
    return score >= 600n && score <= 1000n;
  }
}
