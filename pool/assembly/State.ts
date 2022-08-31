import { System, chain } from "@koinos/sdk-as";
import { Constants } from './Constants';
import { pool } from "./proto/pool";

const BASIS_SPACE_ID = 0;
const BASIS_KEY = new Uint8Array(0);

export class State {
  basisSpace: chain.object_space;

  constructor() {
    this.basisSpace = new chain.object_space(false, Constants.ContractId(), BASIS_SPACE_ID);
  }

  GetBasis(): pool.balance_object {
    const basis = System.getObject<Uint8Array, pool.balance_object>(this.basisSpace, BASIS_KEY, pool.balance_object.decode);

    if (basis) {
      return basis;
    }

    return new pool.balance_object();
  }

  SaveBasis(basis: pool.balance_object): void {
    System.putObject(this.basisSpace, BASIS_KEY, basis, pool.balance_object.encode);
  }
}
