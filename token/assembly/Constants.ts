import { Base58, System } from "@koinos/sdk-as";

export namespace Constants {
  let contractId: Uint8Array | null = null;
  let poolContractId: Uint8Array | null = null;

  export function ContractId(): Uint8Array {
    if (contractId == null) {
      contractId = System.getContractId();
    }
    return contractId!;
  }

  export function PoolContractId(): Uint8Array {
    if (poolContractId == null) {
      poolContractId = Base58.decode(
        // mainnet
        "1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS"
        // testnet
        // "1F4ujgLt7pTywFi4TTrL3y1o25a197vbyj"
      );
    }
    return poolContractId!;
  }
}
