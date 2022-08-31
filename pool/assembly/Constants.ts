import { Base58, System } from "@koinos/sdk-as";

export class Constants {
  static KoinBuffer(): u64 { // amount to disallow withdrawal or burning
    return 1000000000; // 10 Koin
  }

  static OperatorFee(): u64 {
    return 20; // 1/20 = 5%
  }
  
  static OperatorWallet(): Uint8Array {
    return Base58.decode('1DfotF65NdVdLfNzrrhexzS7oFmJuXvLsT');
  }

  static ContractId(): Uint8Array {
    return System.getContractId();
  }

  static PoolTokenContractId(): Uint8Array {
    return Base58.decode('13n14L2JhnWTjt6eX3DVkz1mtCFwwCfJZX');
  }

  static KoinContractId(): Uint8Array {
    return Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');
  }

  static VhpContractId(): Uint8Array {
    return Base58.decode('1JZqj7dDrK5LzvdJgufYBJNUFo88xBoWC8');
  }

  static PobContractId(): Uint8Array {
    return Base58.decode('198RuEouhgiiaQm7uGfaXS6jqZr6g6nyoR');
  }

  static PobBurnEntryPoint(): u32 {
    return 0x859facc5;
  }
}
