import { System, chain } from "@koinos/sdk-as";
import { Constants } from './Constants';
import { pool } from "./proto/pool";

const SUPPLY_SPACE_ID = 0;
const SUPPLY_KEY = new Uint8Array(0);
const BASIS_SPACE_ID = 1;
const BASIS_KEY = new Uint8Array(0);
const BALANCE_SPACE_ID = 2;


export class State {
  supplySpace: chain.object_space;
  basisSpace: chain.object_space;
  balanceSpace: chain.object_space;

  constructor() {
    this.supplySpace = new chain.object_space(false, Constants.ContractId(), SUPPLY_SPACE_ID);
    this.basisSpace = new chain.object_space(false, Constants.ContractId(), BASIS_SPACE_ID);
    this.balanceSpace = new chain.object_space(false, Constants.ContractId(), BALANCE_SPACE_ID);
  }

  GetSupply(): pool.balance_object {
    const supply = System.getObject<Uint8Array, pool.balance_object>(this.supplySpace, SUPPLY_KEY, pool.balance_object.decode);

    if (supply) {
      return supply;
    }

    return new pool.balance_object();
  }

  SaveSupply(supply: pool.balance_object): void {
    System.putObject(this.supplySpace, SUPPLY_KEY, supply, pool.balance_object.encode);
  }

  GetBasis(): pool.balance_object {
    const basis = System.getObject<Uint8Array, pool.balance_object>(this.balanceSpace, BASIS_KEY, pool.balance_object.decode);

    if (basis) {
      return basis;
    }

    return new pool.balance_object();
  }

  SaveBasis(basis: pool.balance_object): void {
    System.putObject(this.balanceSpace, BASIS_KEY, basis, pool.balance_object.encode);
  }

  GetBalance(owner: Uint8Array): pool.balance_object {
    const balance = System.getObject<Uint8Array, pool.balance_object>(this.balanceSpace, owner, pool.balance_object.decode);

    if (balance) {
      return balance;
    }

    return new pool.balance_object();
  }

  SaveBalance(owner: Uint8Array, balance: pool.balance_object): void {
    System.putObject(this.balanceSpace, owner, balance, pool.balance_object.encode);
  }
}
