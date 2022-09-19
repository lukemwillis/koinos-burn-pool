import { System, chain } from "@koinos/sdk-as";
import { Constants } from './Constants';
import { pool } from "./proto/pool";

export namespace State {
  const BASIS_SPACE_ID = 0;
  const BASIS_KEY = new Uint8Array(0);

  let basisSpace: chain.object_space | null = null;

  function BasisSpace(): chain.object_space {
    if (basisSpace == null) {
      basisSpace = new chain.object_space(false, Constants.ContractId(), BASIS_SPACE_ID);
    }
    return basisSpace!;
  }

  export function GetBasis(): u64 {
    const basis = System.getObject<Uint8Array, pool.basis_object>(BasisSpace(), BASIS_KEY, pool.basis_object.decode);

    if (basis) {
      return basis.value;
    }

    return 0;
  }

  export function SaveBasis(basis: u64): void {
    System.putObject(BasisSpace(), BASIS_KEY, new pool.basis_object(basis), pool.basis_object.encode);
  }
}
