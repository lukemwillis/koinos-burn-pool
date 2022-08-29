import { pob, Protobuf, SafeMath, System, Token } from "@koinos/sdk-as";
import { u128 } from "as-bignum";
import { pool } from "./proto/pool";
import { State } from "./State";
import { Constants } from "./Constants";

export class Pool {
  _state: State;
  _koin: Token;
  _vhp: Token;

  constructor() {
    this._state = new State();
    this._koin = new Token(Constants.KoinContractId());
    this._vhp = new Token(Constants.VhpContractId());
  }

  balance_of(args: pool.balance_of_arguments): pool.balance_of_result {
    const account = args.account as Uint8Array;

    const balance = this._state.GetBalance(account).value;
    const supply = this._state.GetSupply().value;
    const basis = this._state.GetBasis().value;

    const res = new pool.balance_of_result();
    res.value = SafeMath.div<u128>(
      SafeMath.mul<u128>(u128.fromU64(balance), u128.fromU64(basis || 1)),
      u128.fromU64(supply || 1)
    ).toU64();

    return res;
  }

  balance_of_unscaled(
    args: pool.balance_of_unscaled_arguments
  ): pool.balance_of_unscaled_result {
    const account = args.account as Uint8Array;

    const balance = this._state.GetBalance(account).value;

    const res = new pool.balance_of_unscaled_result();
    res.value = balance;

    return res;
  }

  basis(args: pool.basis_arguments): pool.basis_result {
    const basis = this._state.GetBasis().value;

    const res = new pool.basis_result();
    res.value = basis;

    return res;
  }

  supply(args: pool.supply_arguments): pool.supply_result {
    const supply = this._state.GetSupply().value;

    const res = new pool.supply_result();
    res.value = supply;

    return res;
  }

  deposit_koin(args: pool.deposit_koin_arguments): pool.deposit_koin_result {
    const account = args.account as Uint8Array;
    const value = args.value;

    const res = new pool.deposit_koin_result(false);

    System.require(
      this._koin.transfer(account, Constants.ContractId(), value),
      "Koin transfer from 'account' failed"
    );

    this.deposit_helper(account, value);

    const depositEvent = new pool.deposit_koin_event(account, value);
    const impacted = [account];

    System.event(
      "pool.deposit_koin",
      Protobuf.encode(depositEvent, pool.deposit_koin_event.encode),
      impacted
    );

    res.value = true;

    return res;
  }

  deposit_vhp(args: pool.deposit_vhp_arguments): pool.deposit_vhp_result {
    const account = args.account as Uint8Array;
    const value = args.value;

    const res = new pool.deposit_vhp_result(false);

    System.require(
      this._vhp.transfer(account, Constants.ContractId(), value),
      "Vhp transfer from 'account' failed"
    );

    this.deposit_helper(account, value);

    const depositEvent = new pool.deposit_vhp_event(account, value);
    const impacted = [account];

    System.event(
      "pool.deposit_vhp",
      Protobuf.encode(depositEvent, pool.deposit_vhp_event.encode),
      impacted
    );

    res.value = true;

    return res;
  }

  deposit_helper(account: Uint8Array, value: u64): void {
    const accountBalance = this._state.GetBalance(account);
    const supply = this._state.GetSupply();
    const basis = this._state.GetBasis();
    const totalStaked = SafeMath.add(
      this._koin.balanceOf(Constants.ContractId()),
      this._vhp.balanceOf(Constants.ContractId())
    );
    const scaledValue = SafeMath.div<u128>(
      SafeMath.mul<u128>(u128.fromU64(value), u128.fromU64(supply.value || 1)),
      u128.fromU64(totalStaked || 1)
    ).toU64();
    accountBalance.value = SafeMath.add(
      accountBalance.value as u64,
      scaledValue
    );
    supply.value = SafeMath.add(supply.value, scaledValue);
    basis.value = SafeMath.add(basis.value, value);

    this._state.SaveBalance(account, accountBalance);
    this._state.SaveSupply(supply);
    this._state.SaveBasis(basis);
  }

  withdraw_koin(args: pool.withdraw_koin_arguments): pool.withdraw_koin_result {
    const account = args.account as Uint8Array;
    const value = args.value;

    const res = new pool.withdraw_koin_result(false);

    System.require(
      this._koin.transfer(Constants.ContractId(), account, value),
      "Contract had insufficient funds for withdrawal. Try withdrawing VHP instead."
    );

    this.withdraw_helper(account, value);

    const withdrawEvent = new pool.withdraw_koin_event(account, value);
    const impacted = [account];

    System.event(
      "pool.withdraw_koin",
      Protobuf.encode(withdrawEvent, pool.withdraw_koin_event.encode),
      impacted
    );

    res.value = true;

    return res;
  }

  withdraw_vhp(args: pool.withdraw_vhp_arguments): pool.withdraw_vhp_result {
    const account = args.account as Uint8Array;
    const value = args.value;

    const res = new pool.withdraw_vhp_result(false);

    // TODO this call fails for any value
    System.require(
      this._vhp.transfer(Constants.ContractId(), account, value),
      "Contract had insufficient funds for withdrawal. Try withdrawing KOIN instead."
    );

    this.withdraw_helper(account, value);

    const withdrawEvent = new pool.withdraw_vhp_event(account, value);
    const impacted = [account];

    System.event(
      "pool.withdraw_vhp",
      Protobuf.encode(withdrawEvent, pool.withdraw_vhp_event.encode),
      impacted
    );

    res.value = true;

    return res;
  }

  withdraw_helper(account: Uint8Array, value: u64): void {
    const accountBalance = this._state.GetBalance(account);
    const supply = this._state.GetSupply();
    const basis = this._state.GetBasis();

    const scaledValue = SafeMath.div<u128>(
      SafeMath.mul<u128>(u128.fromU64(value), u128.fromU64(supply.value || 1)),
      u128.fromU64(basis.value || 1)
    ).toU64();

    System.require(
      accountBalance.value >= scaledValue,
      "'account has insufficient balance"
    );

    accountBalance.value = SafeMath.sub(accountBalance.value, scaledValue);
    supply.value = SafeMath.sub(supply.value, scaledValue);
    basis.value = SafeMath.sub(basis.value, value);

    this._state.SaveBalance(account, accountBalance);
    this._state.SaveSupply(supply);
    this._state.SaveBasis(basis);
  }

  reburn(args: pool.reburn_arguments): pool.reburn_result {
    const res = new pool.reburn_result(false);

    const totalStaked = SafeMath.add(
      this._koin.balanceOf(Constants.ContractId()),
      this._vhp.balanceOf(Constants.ContractId())
    );
    const basis = this._state.GetBasis();
    const operatorShareOfProfit = SafeMath.div(
      SafeMath.sub(totalStaked, basis.value),
      Constants.OperatorFee()
    );

    System.require(
      this._koin.transfer(
        Constants.ContractId(),
        Constants.OperatorWallet(),
        operatorShareOfProfit
      ),
      "Failed to transfer operator share of profit"
    );

    basis.value = SafeMath.sub(totalStaked, operatorShareOfProfit);
    this._state.SaveBasis(basis);

    const availableMana = System.getAccountRC(Constants.ContractId());
    System.require(
      availableMana >= Constants.BurnBuffer(),
      "Not enough liquid KOIN in contract to burn"
    );

    const koinToBurn = SafeMath.sub(availableMana, Constants.BurnBuffer());
    // TODO this call fails with error "Could not burn KOIN"
    const pobArgs = new pob.burn_arguments(
      koinToBurn,
      Constants.ContractId(),
      Constants.ContractId()
    );

    const callRes = System.call(
      Constants.PobContractId(),
      Constants.PobBurnEntryPoint(),
      Protobuf.encode(pobArgs, pob.burn_arguments.encode)
    );
    System.require(callRes.code == 0, "failed to burn tokens");

    res.value = true;

    return res;
  }
}
