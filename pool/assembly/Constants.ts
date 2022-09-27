import { Base58, System } from "@koinos/sdk-as";

export namespace Constants {
  export const KOIN_BUFFER: u64 = 1000000000; // 10 Koin
  export const POB_BURN_ENTRY_POINT: u32 = 0x859facc5;
  export const OPERATOR_FEE: u64 = 20; // 1/20 = 5%

  let contractId: Uint8Array | null = null;
  let poolTokenContractId: Uint8Array | null = null;
  let koinContractId: Uint8Array | null = null;
  let vhpContractId: Uint8Array | null = null;
  let pobContractId: Uint8Array | null = null;
  let operatorWallet: Uint8Array | null = null;

  export function ContractId(): Uint8Array {
    if (contractId == null) {
      contractId = System.getContractId();
    }
    return contractId!;
  }

  export function PoolTokenContractId(): Uint8Array {
    if (poolTokenContractId == null) {
      poolTokenContractId = Base58.decode('1JMeuhdS8gKy4dU4ibaZ1ru3HQFPqdroe3');
    }
    return poolTokenContractId!;
  }

  export function KoinContractId(): Uint8Array {
    if (koinContractId == null) {
      koinContractId = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');
    }
    return koinContractId!;
  }

  export function VhpContractId(): Uint8Array {
    if (vhpContractId == null) {
      vhpContractId = Base58.decode('1JZqj7dDrK5LzvdJgufYBJNUFo88xBoWC8');
    }
    return vhpContractId!;
  }

  export function PobContractId(): Uint8Array {
    if (pobContractId == null) {
      pobContractId = Base58.decode('198RuEouhgiiaQm7uGfaXS6jqZr6g6nyoR');
    }
    return pobContractId!;
  }

  export function OperatorWallet(): Uint8Array {
    if (operatorWallet == null) {
      operatorWallet = Base58.decode('1DfotF65NdVdLfNzrrhexzS7oFmJuXvLsT');
    }
    return operatorWallet!;
  }
}
