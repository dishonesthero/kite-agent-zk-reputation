import { ProofGenerator, ZKCircuitVerifierEngine, SybilNullifierGuard } from "../src/index";

console.log("=== Running ZK Reputation Attestation Simulation ===");
const generator = new ProofGenerator();
const nullifier = generator.generateDeterministicNullifier("0x1234567890123456789012345678901234567890", "agent-secret-seed");
console.log("Generated Nullifier:", nullifier);

const guard = new SybilNullifierGuard();
guard.registerNullifier(nullifier, "0x1234567890123456789012345678901234567890", 1000n);
console.log("Nullifier active state:", guard.isNullifierActive(nullifier, 1500n));

const isValid = ZKCircuitVerifierEngine.validatePublicInputs({
  agentAddress: "0x1234567890123456789012345678901234567890",
  nullifierHash: nullifier,
  reputationScoreThreshold: 850,
  taskCountPassed: 120,
  accuracyBps: 9850,
});
console.log("Public inputs verification:", isValid);
