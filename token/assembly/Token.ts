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

  name = (_: token.name_arguments): token.name_result =>
    new token.name_result(this._name);

  symbol = (_: token.symbol_arguments): token.symbol_result =>
    new token.symbol_result(this._symbol);

  decimals = (_: token.decimals_arguments): token.decimals_result =>
    new token.decimals_result(this._decimals);

  total_supply = (_: token.total_supply_arguments): token.total_supply_result =>
    new token.total_supply_result(this._state.GetSupply().value);

  balance_of = ({
    owner,
  }: token.balance_of_arguments): token.balance_of_result =>
    new token.balance_of_result(this._state.GetBalance(owner!).value);

  transfer({
    from,
    to,
    value,
  }: token.transfer_arguments): token.transfer_result {
    System.require(!Arrays.equal(from, to), "Cannot transfer to self");

    System.requireAuthority(authority.authorization_type.contract_call, from);

    const fromBalance = this._state.GetBalance(from);

    System.require(
      fromBalance.value >= value,
      "'from' has insufficient balance"
    );

    const toBalance = this._state.GetBalance(to);

    // the balances cannot hold more than the supply, so we don't check for overflow/underflow
    fromBalance.value -= value;
    toBalance.value += value;

    this._state.SaveBalance(from, fromBalance);
    this._state.SaveBalance(to, toBalance);

    System.event(
      "token.transfer",
      Protobuf.encode(
        new token.transfer_event(from, to, value),
        token.transfer_event.encode
      ),
      [to, from]
    );

    return new token.transfer_result(true);
  }

  mint({ to, value }: token.mint_arguments): token.mint_result {
    // only the pool is allowed to mint
    System.require(
      Arrays.equal(System.getCaller().caller, Constants.PoolContractId()),
      "mint not authorized",
      error.error_code.authorization_failure
    );

    const supply = this._state.GetSupply();

    const newSupply = SafeMath.tryAdd(supply.value, value);

    System.require(!newSupply.error, "Mint would overflow supply");

    const toBalance = this._state.GetBalance(to);
    toBalance.value += value;

    supply.value = newSupply.value;

    this._state.SaveSupply(supply);
    this._state.SaveBalance(to, toBalance);

    System.event(
      "token.mint",
      Protobuf.encode(new token.mint_event(to, value), token.mint_event.encode),
      [to]
    );

    return new token.mint_result(true);
  }

  burn({ from, value }: token.burn_arguments): token.burn_result {
    // only the pool is allowed to burn
    System.require(
      Arrays.equal(System.getCaller().caller, Constants.PoolContractId()),
      "burn not authorized",
      error.error_code.authorization_failure
    );

    const fromBalance = this._state.GetBalance(from);

    System.require(
      fromBalance.value >= value,
      "'from' has insufficient balance"
    );

    const supply = this._state.GetSupply();
    supply.value = SafeMath.sub(supply.value, value);
    fromBalance.value -= value;

    this._state.SaveSupply(supply);
    this._state.SaveBalance(from, fromBalance);

    System.event(
      "token.burn",
      Protobuf.encode(
        new token.burn_event(from, value),
        token.burn_event.encode
      ),
      [from]
    );

    return new token.burn_result(true);
  }
}
