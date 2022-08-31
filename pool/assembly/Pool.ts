import { pob, Protobuf, SafeMath, System, Token } from "@koinos/sdk-as";
import { u128 } from "as-bignum";
import { pool } from "./proto/pool";
import { State } from "./State";
import { Constants } from "./Constants";

export class Pool {
  _state: State;

  constructor() {
    this._state = new State();
  }

  balance_of(args: pool.balance_of_arguments): pool.balance_of_result {
    const token = new Token(Constants.PoolTokenContractId());

    const balance = token.balanceOf(args.account!); // not 1:1 with KOIN/VHP held by contract
    const supply = token.totalSupply();
    const basis = this._state.GetBasis().value; // total KOIN/VHP held by contract not including recent profit

    // balance * basis / supply = your share of the KOIN/VHP held by contract
    return new pool.balance_of_result(
      SafeMath.div<u128>(
        SafeMath.mul<u128>(u128.fromU64(balance), u128.fromU64(basis || 1)),
        u128.fromU64(supply || 1)
      ).toU64()
    );
  }

  basis(_: pool.basis_arguments): pool.basis_result {
    return new pool.basis_result(this._state.GetBasis().value);
  }

  deposit_koin(args: pool.deposit_koin_arguments): pool.deposit_koin_result {
    const koin = new Token(Constants.KoinContractId());

    System.require(
      koin.transfer(args.account!, Constants.ContractId(), args.value),
      "KOIN transfer from account failed. Please ensure you are authorized to transfer from this address and that your balance is sufficient."
    );

    this.deposit_helper(args.account!, args.value);

    System.event(
      "pool.deposit_koin",
      Protobuf.encode(
        new pool.deposit_koin_event(args.account, args.value),
        pool.deposit_koin_event.encode
      ),
      [args.account!]
    );

    return new pool.deposit_koin_result(true);
  }

  deposit_vhp(args: pool.deposit_vhp_arguments): pool.deposit_vhp_result {
    const vhp = new Token(Constants.VhpContractId());

    System.require(
      vhp.transfer(args.account!, Constants.ContractId(), args.value),
      "VHP transfer from account failed. Please ensure you are authorized to transfer from this address and that your balance is sufficient."
    );

    this.deposit_helper(args.account!, args.value);

    System.event(
      "pool.deposit_vhp",
      Protobuf.encode(
        new pool.deposit_vhp_event(args.account, args.value),
        pool.deposit_vhp_event.encode
      ),
      [args.account!]
    );

    return new pool.deposit_vhp_result(true);
  }

  deposit_helper(account: Uint8Array, value: u64): void {
    const token = new Token(Constants.PoolTokenContractId());
    const koin = new Token(Constants.KoinContractId());
    const vhp = new Token(Constants.VhpContractId());

    const supply = token.totalSupply();
    const basis = this._state.GetBasis();
    const totalStaked = SafeMath.add(
      koin.balanceOf(Constants.ContractId()),
      vhp.balanceOf(Constants.ContractId())
    );

    // value * supply / totalStaked = how much internal balance to track for your address
    // since value is in KOIN/VHP, we have to scale it based on the ratio of all internal balances to KOIN/VHP in the contract
    // we use totalStaked instead of basis because your new deposit isn't entitled to existing profits
    const scaledValue = SafeMath.div<u128>(
      SafeMath.mul<u128>(u128.fromU64(value), u128.fromU64(supply || 1)),
      u128.fromU64(totalStaked || 1)
    ).toU64();
    System.require(token.mint(account, scaledValue), 'Failed to mint tokens for tracking balance.');

    // increase basis so your new deposit isn't counted as profits
    basis.value = SafeMath.add(basis.value, value);
    this._state.SaveBasis(basis);
  }

  withdraw_koin(args: pool.withdraw_koin_arguments): pool.withdraw_koin_result {
    const koin = new Token(Constants.KoinContractId());

    // availableMana represents how much liquid KOIN is in the contract.
    const availableMana = System.getAccountRC(Constants.ContractId());
    System.require(
      // availableMana - value = contract's liquid koin balance after withdrawal
      // we keep a buffer of KOIN to ensure we can always pay mana for creating blocks
      availableMana - args.value >= Constants.KoinBuffer(),
      "Contract had insufficient funds for withdrawal. Try withdrawing VHP instead."
    );
    koin.transfer(Constants.ContractId(), args.account!, args.value);

    this.withdraw_helper(args.account!, args.value);

    System.event(
      "pool.withdraw_koin",
      Protobuf.encode(
        new pool.withdraw_koin_event(args.account, args.value),
        pool.withdraw_koin_event.encode
      ),
      [args.account!]
    );

    return new pool.withdraw_koin_result(true);
  }

  withdraw_vhp(args: pool.withdraw_vhp_arguments): pool.withdraw_vhp_result {
    const vhp = new Token(Constants.VhpContractId());

    // TODO this call fails due to an authority issue in the VHP contract
    System.require(
      vhp.transfer(Constants.ContractId(), args.account!, args.value),
      "Contract had insufficient funds for withdrawal. Try withdrawing KOIN instead."
    );

    this.withdraw_helper(args.account!, args.value);

    System.event(
      "pool.withdraw_vhp",
      Protobuf.encode(
        new pool.withdraw_vhp_event(args.account, args.value),
        pool.withdraw_vhp_event.encode
      ),
      [args.account!]
    );

    return new pool.withdraw_vhp_result(true);
  }

  withdraw_helper(account: Uint8Array, value: u64): void {
    const token = new Token(Constants.PoolTokenContractId());

    const supply = token.totalSupply();
    const basis = this._state.GetBasis();

    // value * supply / basis + 1 = your share of internal supply
    // since value is in KOIN/VHP, we scale this number based on the ratio of all internal balances to KOIN/VHP held by contract
    // we use basis instead of totalStaked because profits aren't allocated to users until operator takes fee
    const scaledValue = SafeMath.add<u128>(
      SafeMath.div<u128>(
        SafeMath.mul<u128>(
          u128.fromU64(value),
          u128.fromU64(supply || 1)
        ),
        u128.fromU64(basis.value || 1)
      ),
      u128.One // prevent infinite 1 satoshi withdrawals
    ).toU64();

    System.require(
      token.burn(account, scaledValue),
      "Account has insufficient balance. Please withdraw a smaller amount."
    );

    basis.value = SafeMath.sub(basis.value, value);
    this._state.SaveBasis(basis);
  }

  reburn(_: pool.reburn_arguments): pool.reburn_result {
    const koin = new Token(Constants.KoinContractId());
    const vhp = new Token(Constants.VhpContractId());

    const basis = this._state.GetBasis();
    const totalStaked = SafeMath.add(
      koin.balanceOf(Constants.ContractId()),
      vhp.balanceOf(Constants.ContractId())
    );

    // totalStaked - basis / operatorFee = profit since last reburn / 20
    // operator takes 5% of profits
    const operatorShareOfProfit = SafeMath.div(
      SafeMath.sub(totalStaked, basis.value),
      Constants.OperatorFee()
    );

    System.require(
      koin.transfer(
        Constants.ContractId(),
        Constants.OperatorWallet(),
        operatorShareOfProfit
      ),
      "Failed to transfer operator share of profit"
    );

    // reset basis to totalStaked - operatorShare
    // this ensures we don't take operator fee more than once on any given profit
    basis.value = SafeMath.sub(totalStaked, operatorShareOfProfit);
    this._state.SaveBasis(basis);

    const availableMana = System.getAccountRC(Constants.ContractId());
    System.require(
      // don't go below koin buffer to ensure we always have enough to pay mana for block production
      availableMana >= Constants.KoinBuffer(),
      "Not enough liquid KOIN in contract to burn"
    );

    const koinToBurn = SafeMath.sub(availableMana, Constants.KoinBuffer());
    const pobArgs = new pob.burn_arguments(
      koinToBurn,
      Constants.ContractId(),
      Constants.ContractId()
    );

    // call pob.burn(koinToBurn, contractId, contractId)
    // this will fail for any address other than the contract address
    // this is because koin.burn is not authorized for other addresses
    // TODO since the caller is the contract and not the other address, this should be allowed
    // potentially an authority issue with KOIN contract
    const callRes = System.call(
      Constants.PobContractId(),
      Constants.PobBurnEntryPoint(),
      Protobuf.encode(pobArgs, pob.burn_arguments.encode)
    );
    System.require(callRes.code == 0, "failed to burn tokens");

    return new pool.reburn_result(true);
  }
}
