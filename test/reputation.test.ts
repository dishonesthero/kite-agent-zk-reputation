import { describe, it } from "node:test";
import assert from "node:assert";
import {
  ProofGenerator,
  KiteAgentZKReputationClient,
  CreditDecayManager,
  TierRiskEvaluator,
  CreditTier,
  ZKCircuitVerifierEngine,
  SybilNullifierGuard,
  CreditDefaultLiquidator,
  BatchAttestationAggregator,
} from "../src/index";

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

describe("Credit Decay Manager Suite", () => {
  it("should calculate progressive score decay and enforce minimum floor", () => {
    const manager = new CreditDecayManager({ halfLifeEpochs: 180, inactivityPenaltyBps: 200 });
    const originalScore = 900n;
    const decayed = manager.calculateDecayedScore(originalScore, 60);
    assert.strictEqual(decayed, 864n);

    const floorScore = manager.calculateDecayedScore(originalScore, 10000);
    assert.strictEqual(floorScore, 600n);
  });
});

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

describe("ZK Circuit Verifier & Sybil Guard Suite", () => {
  it("should validate public circuit inputs against threshold criteria", () => {
    const valid = ZKCircuitVerifierEngine.validatePublicInputs({
      agentAddress: "0x1111111111111111111111111111111111111111",
      nullifierHash: "0xhash",
      reputationScoreThreshold: 800,
      taskCountPassed: 60,
      accuracyBps: 9700,
    });
    assert.strictEqual(valid, true);

    const substandard = ZKCircuitVerifierEngine.validatePublicInputs({
      agentAddress: "0x2222222222222222222222222222222222222222",
      nullifierHash: "0xhash2",
      reputationScoreThreshold: 800,
      taskCountPassed: 20,
      accuracyBps: 9200,
    });
    assert.strictEqual(substandard, false);
  });

  it("should enforce single-use nullifiers and prevent Sybil re-registration", () => {
    const guard = new SybilNullifierGuard(100n);
    guard.registerNullifier("0xnullifier_test", "0xagentA", 1000n);

    assert.strictEqual(guard.isNullifierActive("0xnullifier_test", 1050n), true);

    assert.throws(() => {
      guard.registerNullifier("0xnullifier_test", "0xagentB", 1050n);
    }, /Sybil alert: Nullifier.*already in active use/);
  });
});

describe("Credit Default Liquidator Suite", () => {
  it("should trigger liquidation and calculate penalty when grace period expires", () => {
    const liquidator = new CreditDefaultLiquidator(3600, 500);
    const pos = {
      agentAddress: "0x1111111111111111111111111111111111111111",
      borrowedCreditWei: 1000000000000000000n,
      collateralLockedWei: 500000000000000000n,
      lastPaymentTimestamp: 1000,
    };

    assert.strictEqual(liquidator.assessLiquidation(pos, 2000).isLiquidatable, false);
    const liq = liquidator.assessLiquidation(pos, 5000);
    assert.strictEqual(liq.isLiquidatable, true);
    assert.strictEqual(liq.penaltyAmountWei, 50000000000000000n);
  });
});

describe("Batch Attestation Aggregator Suite", () => {
  it("should compute deterministic Merkle root for batch reputation leaves", () => {
    const dummyHash = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const leaves = [
      { agentAddress: "0x1111111111111111111111111111111111111111", nullifierHash: dummyHash, score: 800n },
      { agentAddress: "0x2222222222222222222222222222222222222222", nullifierHash: dummyHash, score: 850n },
      { agentAddress: "0x3333333333333333333333333333333333333333", nullifierHash: dummyHash, score: 900n },
    ];
    const root1 = BatchAttestationAggregator.computeMerkleRoot(leaves);
    const root2 = BatchAttestationAggregator.computeMerkleRoot(leaves);
    assert.strictEqual(root1, root2);
    assert.strictEqual(root1.startsWith("0x"), true);
  });
});
