import { System, chain } from "@koinos/sdk-as";
import { pool } from "./proto/pool";

const BALANCE_SPACE_ID = 1;

export class State {
  contractId: Uint8Array;
  balanceSpace: chain.object_space;

  constructor(contractId: Uint8Array) {
    this.contractId = contractId;

    this.balanceSpace = new chain.object_space(false, contractId, BALANCE_SPACE_ID);
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
