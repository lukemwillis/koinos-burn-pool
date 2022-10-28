import { Base58, System } from '@koinos/sdk-as';

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
      poolContractId = Base58.decode('1CUvzbueT7hpGStzNCUZEXwRsqeS6hpJkF');
    }
    return poolContractId!;
  }
}