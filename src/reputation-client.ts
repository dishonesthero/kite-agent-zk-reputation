import { ProofGenerator, ZKReputationPayload } from "./proof-generator";

export class KiteAgentZKReputationClient {
  public readonly generator: ProofGenerator;

  constructor() {
    this.generator = new ProofGenerator();
  }

  public preparePayload(agentAddress: string, creditScore: bigint, secretSalt: string): ZKReputationPayload {
    if (!this.generator.validateScoreRange(creditScore)) {
      throw new Error("Credit score out of valid bounds (600-1000)");
    }

    const nullifier = this.generator.generateDeterministicNullifier(agentAddress, secretSalt);
    return {
      agentAddress,
      creditScore,
      nullifier,
    };
  }
}
