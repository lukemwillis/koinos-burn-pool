import { Base58, System } from '@koinos/sdk-as';

export class Constants {
  static ContractId(): Uint8Array {
    return System.getContractId();
  }
  
  static PoolContractId(): Uint8Array {
    return Base58.decode('1F4ujgLt7pTywFi4TTrL3y1o25a197vbyj');
  }
}