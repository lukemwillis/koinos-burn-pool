import { Base58, System } from '@koinos/sdk-as';

export class Constants {
  static ContractId(): Uint8Array {
    return System.getContractId();
  }
  
  static PoolContractId(): Uint8Array {
    return Base58.decode('1BceRYw28bfB893L2J3ZYsSuT29WamVrT6');
  }
}