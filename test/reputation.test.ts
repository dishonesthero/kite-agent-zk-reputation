import { describe, it } from "node:test";
import assert from "node:assert";
import { ProofGenerator, KiteAgentZKReputationClient } from "../src/index";

describe("Kite Agent ZK Reputation Test Suite", () => {
  const generator = new ProofGenerator();

  it("should generate deterministic nullifiers", () => {
    const nullifier1 = generator.generateDeterministicNullifier("0x1111111111111111111111111111111111111111", "saltA");
    const nullifier2 = generator.generateDeterministicNullifier("0x1111111111111111111111111111111111111111", "saltA");
    assert.strictEqual(nullifier1, nullifier2);
  });

  it("should validate and prepare valid reputation payloads", () => {
    const client = new KiteAgentZKReputationClient();
    const payload = client.preparePayload("0x2222222222222222222222222222222222222222", 820n, "secret123");
    assert.strictEqual(payload.creditScore, 820n);

    assert.throws(() => {
      client.preparePayload("0x2222222222222222222222222222222222222222", 500n, "secret123");
    }, /Credit score out of valid bounds/);
  });
});
import { CreditDecayManager } from "../src/index";

describe("Credit Decay Manager Suite", () => {
  it("should calculate progressive score decay and enforce minimum floor", () => {
    const manager = new CreditDecayManager({ halfLifeEpochs: 180, inactivityPenaltyBps: 200 }); // 2% per 30 epochs
    const originalScore = 900n;

    // 60 epochs = 2 intervals = 4% reduction = 36 points reduction
    const decayed = manager.calculateDecayedScore(originalScore, 60);
    assert.strictEqual(decayed, 864n);

    // Extreme epochs should floor at 600
    const floorScore = manager.calculateDecayedScore(originalScore, 10000);
    assert.strictEqual(floorScore, 600n);
  });
});
import { TierRiskEvaluator, CreditTier } from "../src/index";

describe("Tier Risk Evaluator Suite", () => {
  it("should categorize scores into corresponding risk policies", () => {
    const plat = TierRiskEvaluator.evaluatePolicy(980n);
    assert.strictEqual(plat.tier, CreditTier.Platinum);
    assert.strictEqual(plat.streamingFeeBps, 20);

    const bronze = TierRiskEvaluator.evaluatePolicy(700n);
    assert.strictEqual(bronze.tier, CreditTier.Bronze);
    assert.strictEqual(bronze.maxCreditLineWei, 0n);
  });
});
