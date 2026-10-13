export interface SnarkProofPoints {
  a: [string, string];
  b: [[string, string], [string, string]];
  c: [string, string];
}

export interface ZKReputationCircuitInput {
  agentAddress: string;
  nullifierHash: string;
  reputationScoreThreshold: number;
  taskCountPassed: number;
  accuracyBps: number; // 0 - 10000 bps
}

export class ZKCircuitVerifierEngine {
  public static formatCalldata(proof: SnarkProofPoints, publicInputs: string[]): string {
    return JSON.stringify({
      proof,
      publicInputs,
    });
  }

  public static validatePublicInputs(inputs: ZKReputationCircuitInput): boolean {
    if (inputs.accuracyBps < 9500) {
      return false; // 最低要求 95% 准确率
    }
    if (inputs.taskCountPassed < 50) {
      return false; // 最少完成 50 次经过验证的推理任务
    }
    return inputs.reputationScoreThreshold >= 600 && inputs.reputationScoreThreshold <= 1000;
  }
}
