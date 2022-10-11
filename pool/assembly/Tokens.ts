import { Token } from "@koinos/sdk-as";
import { Constants } from "./Constants";

export namespace Tokens {
  let koin: Token | null = null;
  let vhp: Token | null = null;
  let pool: Token | null = null;

  export function Koin(): Token {
    if (koin == null) {
      koin = new Token(Constants.KoinContractId());
    }
    return koin!;
  }

  export function Vhp(): Token {
    if (vhp == null) {
      vhp = new Token(Constants.VhpContractId());
    }
    return vhp!;
  }

  export function Pool(): Token {
    if (pool == null) {
      pool = new Token(Constants.PoolTokenContractId());
    }
    return pool!;
  }

  export function virtualBalanceOf(owner: Uint8Array): u64 {
    return Koin().balanceOf(owner) + Vhp().balanceOf(owner);
  }
}
