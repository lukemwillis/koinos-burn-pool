import { Base58, System } from "@koinos/sdk-as";

export namespace Constants {
  export const POB_BURN_ENTRY_POINT: u32 = 0x859facc5;
  export const POB_REGISTER_PUBLIC_KEY_ENTRY_POINT: u32 = 0x53192be1;

  let contractId: Uint8Array | null = null;
  let poolTokenContractId: Uint8Array | null = null;
  let koinContractId: Uint8Array | null = null;
  let vhpContractId: Uint8Array | null = null;
  let pobContractId: Uint8Array | null = null;
  let adminWalletId: Uint8Array | null = null;

  export function ContractId(): Uint8Array {
    if (contractId == null) {
      contractId = System.getContractId();
    }
    return contractId!;
  }

  export function PoolTokenContractId(): Uint8Array {
    if (poolTokenContractId == null) {
      poolTokenContractId = Base58.decode(
        // mainnet
        "1NHReq2apWsQ6UPBjNqcV3ABsj88Ncimiy"
        // testnet
        // "13n14L2JhnWTjt6eX3DVkz1mtCFwwCfJZX"
      );
    }
    return poolTokenContractId!;
  }

  export function KoinContractId(): Uint8Array {
    if (koinContractId == null) {
      koinContractId = System.getContractAddress("koin");
    }
    return koinContractId!;
  }

  export function VhpContractId(): Uint8Array {
    if (vhpContractId == null) {
      vhpContractId = System.getContractAddress("vhp");
    }
    return vhpContractId!;
  }

  export function PobContractId(): Uint8Array {
    if (pobContractId == null) {
      pobContractId = System.getContractAddress("pob");
    }
    return pobContractId!;
  }

  export function AdminWalletId(): Uint8Array {
    if (adminWalletId == null) {
      adminWalletId = Base58.decode(
        // mainnet
        "1BurnKgSB16Bz3jSNhjdseSQVucBnjm14s"
        // testnet
        // "18rzDQaK6Crm4jELfqog6BsKkQ9Z5didMg"
      );
    }
    return adminWalletId!;
  }
}
