import { ethers } from "ethers";

export interface AttestationLeaf {
  agentAddress: string;
  nullifierHash: string;
  score: bigint;
}

export class BatchAttestationAggregator {
  public static computeMerkleRoot(leaves: AttestationLeaf[]): string {
    if (leaves.length === 0) {
      throw new Error("Cannot compute Merkle root of empty leaf array");
    }

    let hashes = leaves.map((l) =>
      ethers.solidityPackedKeccak256(
        ["address", "bytes32", "uint256"],
        [l.agentAddress, l.nullifierHash, l.score]
      )
    );

    while (hashes.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < hashes.length; i += 2) {
        if (i + 1 < hashes.length) {
          nextLevel.push(ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [hashes[i], hashes[i + 1]]));
        } else {
          nextLevel.push(hashes[i]);
        }
      }
      hashes = nextLevel;
    }
    return hashes[0];
  }
}
