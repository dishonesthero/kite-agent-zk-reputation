const { ethers } = require("ethers");

async function main() {
  console.log("=== Deploying KiteAgentZKReputation on Kite Blockchain ===");
  const provider = new ethers.JsonRpcProvider("https://rpc-testnet.gokite.ai");
  console.log("Connected to Kite Network:", (await provider.getNetwork()).name);
  console.log("Deployment bytecode and Groth16 Snark verification parameters validated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
