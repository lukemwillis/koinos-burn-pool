import {
  Arrays,
  Protobuf,
  System,
  SafeMath,
  authority,
  error,
} from "@koinos/sdk-as";
import { token } from "./proto/token";
import { State } from "./State";
import { Constants } from "./Constants";

export class Token {
  _name: string = "Pooled VHP";
  _symbol: string = "PVHP";
  _decimals: u32 = 8;

  _state: State;

  constructor() {
    this._state = new State();
  }

  name(_: token.name_arguments): token.name_result {
    return new token.name_result(this._name);
  }

  symbol(_: token.symbol_arguments): token.symbol_result {
    return new token.symbol_result(this._symbol);
  }

  decimals(_: token.decimals_arguments): token.decimals_result {
    return new token.decimals_result(this._decimals);
  }

  total_supply(_: token.total_supply_arguments): token.total_supply_result {
    return new token.total_supply_result(this._state.GetSupply().value);
  }

  balance_of(args: token.balance_of_arguments): token.balance_of_result {
    return new token.balance_of_result(this._state.GetBalance(args.owner!).value);
  }

  transfer(args: token.transfer_arguments): token.transfer_result {
    System.require(!Arrays.equal(args.from, args.to), "Cannot transfer to self");

    System.requireAuthority(authority.authorization_type.contract_call, args.from!);

    const fromBalance = this._state.GetBalance(args.from!);

    System.require(
      fromBalance.value >= args.value,
      "'from' has insufficient balance"
    );

    const toBalance = this._state.GetBalance(args.to!);

    // the balances cannot hold more than the supply, so we don't check for overflow/underflow
    fromBalance.value -= args.value;
    toBalance.value += args.value;

    this._state.SaveBalance(args.from!, fromBalance);
    this._state.SaveBalance(args.to!, toBalance);

    System.event(
      "token.transfer",
      Protobuf.encode(
        new token.transfer_event(args.from, args.to, args.value),
        token.transfer_event.encode
      ),
      [args.to!, args.from!]
    );

    return new token.transfer_result(true);
  }

  mint(args: token.mint_arguments): token.mint_result {
    // only the pool is allowed to mint
    System.require(
      Arrays.equal(System.getCaller().caller, Constants.PoolContractId()) || System.checkAuthority(authority.authorization_type.contract_call, Constants.ContractId()),
      "mint not authorized",
      error.error_code.authorization_failure
    );

    const supply = this._state.GetSupply();

    const newSupply = SafeMath.tryAdd(supply.value, args.value);

    System.require(!newSupply.error, "Mint would overflow supply");

    const toBalance = this._state.GetBalance(args.to!);
    toBalance.value += args.value;

    supply.value = newSupply.value;

    this._state.SaveSupply(supply);
    this._state.SaveBalance(args.to!, toBalance);

    System.event(
      "token.mint",
      Protobuf.encode(new token.mint_event(args.to, args.value), token.mint_event.encode),
      [args.to!]
    );

    return new token.mint_result(true);
  }

  burn(args: token.burn_arguments): token.burn_result {
    // only the pool is allowed to burn
    System.require(
      Arrays.equal(System.getCaller().caller, Constants.PoolContractId()) || System.checkAuthority(authority.authorization_type.contract_call, Constants.ContractId()),
      "burn not authorized",
      error.error_code.authorization_failure
    );

    const fromBalance = this._state.GetBalance(args.from!);

    System.require(
      fromBalance.value >= args.value,
      "'from' has insufficient balance"
    );

    const supply = this._state.GetSupply();
    supply.value = SafeMath.sub(supply.value, args.value);
    fromBalance.value -= args.value;

    this._state.SaveSupply(supply);
    this._state.SaveBalance(args.from!, fromBalance);

    System.event(
      "token.burn",
      Protobuf.encode(
        new token.burn_event(args.from, args.value),
        token.burn_event.encode
      ),
      [args.from!]
    );

    return new token.burn_result(true);
  }
}
