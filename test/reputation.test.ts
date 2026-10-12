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
