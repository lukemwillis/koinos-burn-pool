import { authority, pob, Protobuf, SafeMath, System } from "@koinos/sdk-as";
import { u128 } from "as-bignum";
import { pool } from "./proto/pool";
import { State } from "./State";
import { Constants } from "./Constants";
import { Tokens } from "./Tokens";

export class Pool {
  balance_of(args: pool.balance_of_arguments): pool.balance_of_result {
    // TODO balanceOf results in `module exited due to trap` when 0
    const balance = Tokens.Pool().balanceOf(args.account!); // not 1:1 with KOIN/VHP held by contract
    if (balance == 0) return new pool.balance_of_result(0);

    const supply = Tokens.Pool().totalSupply();
    const totalStaked = Tokens.virtualBalanceOf(Constants.ContractId());

    // balance * staked / supply = your share of the KOIN/VHP held by contract
    return new pool.balance_of_result(
      (
        // @ts-ignore allowed in AS
        (u128.fromU64(balance) * u128.fromU64(totalStaked || 1)) /
        // @ts-ignore allowed in AS
        u128.fromU64(supply || 1)
      // @ts-ignore allowed in AS
      ).toU64()
    );
  }

  basis(_: pool.basis_arguments): pool.basis_result {
    return new pool.basis_result(State.GetBasis());
  }

  get_metadata(_: pool.get_metadata_arguments): pool.get_metadata_result {
    return new pool.get_metadata_result(State.GetMetadata());
  }

  set_metadata(args: pool.set_metadata_arguments): pool.set_metadata_result {
    System.requireAuthority(
      authority.authorization_type.contract_call,
      Constants.ContractId()
    );

    State.SaveMetadata(args.metadata!);

    return new pool.set_metadata_result(true);
  }

  deposit_koin(args: pool.deposit_koin_arguments): pool.deposit_koin_result {
    const metadata = State.GetMetadata();

    if (metadata.burn_deposits) {
      const pobArgs = new pob.burn_arguments(
        args.value,
        args.account!,
        Constants.ContractId()
      );

      const callRes = System.call(
        Constants.PobContractId(),
        Constants.POB_BURN_ENTRY_POINT,
        Protobuf.encode(pobArgs, pob.burn_arguments.encode)
      );
      System.require(
        callRes.code == 0,
        "Failed to burn KOIN for VHP. Please ensure you are authorized to transfer from this address and that your balance is sufficient."
      );
    } else {
      State.SaveMetadata(
        new pool.metadata_object(
          metadata.operator_wallet,
          metadata.operator_fee,
          metadata.koin_buffer + args.value,
          metadata.burn_deposits
        )
      );

      System.require(
        Tokens.Koin().transfer(
          args.account!,
          Constants.ContractId(),
          args.value
        ),
        "Failed to transfer KOIN"
      );
    }

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
    System.require(
      Tokens.Vhp().transfer(args.account!, Constants.ContractId(), args.value),
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
    this.allocate_profit(value);

    const supply = Tokens.Pool().totalSupply();
    const basis = State.GetBasis();
    const totalStakedBeforeDeposit =
      Tokens.virtualBalanceOf(Constants.ContractId()) - value;

    // value * supply / totalStaked = how much internal balance to track for your address
    // since value is in KOIN/VHP, we have to scale it based on the ratio of all internal balances to KOIN/VHP in the contract
    // we use totalStaked instead of basis because your new deposit isn't entitled to existing profits
    const scaledValue = (
      // @ts-ignore allowed in AS
      (u128.fromU64(value) * u128.fromU64(supply || 1)) /
      // @ts-ignore allowed in AS
      u128.fromU64(totalStakedBeforeDeposit || 1)
    // @ts-ignore allowed in AS
    ).toU64();

    System.require(
      Tokens.Pool().mint(account, scaledValue),
      "Failed to mint PVHP"
    );

    // increase basis so your new deposit isn't counted as profits
    State.SaveBasis(SafeMath.add(basis, value));
  }

  withdraw_koin(args: pool.withdraw_koin_arguments): pool.withdraw_koin_result {
    // availableMana represents how much liquid KOIN is in the contract.
    const availableMana = System.getAccountRC(Constants.ContractId());
    const koinBuffer = State.GetMetadata().koin_buffer;

    System.require(
      // availableMana - value = contract's liquid koin balance after withdrawal
      // we keep a buffer of KOIN to ensure we can always pay mana for creating blocks
      availableMana - args.value >= koinBuffer,
      "Contract had insufficient funds for withdrawal. Try withdrawing VHP instead."
    );

    const scaledValue = this.withdraw_helper(args.account!, args.value);

    System.require(
      Tokens.Koin().transfer(
        Constants.ContractId(),
        args.account!,
        scaledValue
      ),
      "Failed to transfer KOIN"
    );

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
    const scaledValue = this.withdraw_helper(args.account!, args.value);

    System.require(
      Tokens.Vhp().transfer(Constants.ContractId(), args.account!, scaledValue),
      "Contract had insufficient funds for withdrawal. Try withdrawing KOIN instead."
    );

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

  withdraw_helper(account: Uint8Array, value: u64): u64 {
    this.allocate_profit();

    const supply = Tokens.Pool().totalSupply();
    const basis = State.GetBasis();

    System.require(
      Tokens.Pool().burn(account, value),
      "Account has insufficient balance. Please withdraw a smaller amount."
    );

    // value * basis / supply = your share of KOIN/VHP to redeem for ${value} PVHP
    // since value is in PVHP, we scale this number based on the ratio of all internal balances to KOIN/VHP held by contract
    // we use basis instead of totalStaked because profits aren't allocated to users until operator takes fee during reburn
    const scaledValue = (
      // @ts-ignore allowed in AS
      (u128.fromU64(value) * u128.fromU64(basis)) /
      // @ts-ignore allowed in AS
      u128.fromU64(supply)
    // @ts-ignore allowed in AS
    ).toU64();

    State.SaveBasis(SafeMath.sub(basis, scaledValue));

    return scaledValue;
  }

  reburn(_: pool.reburn_arguments): pool.reburn_result {
    this.allocate_profit();

    const availableMana = System.getAccountRC(Constants.ContractId());
    const metadata = State.GetMetadata();

    System.require(
      // don't go below koin buffer to ensure we always have enough to pay mana for block production
      availableMana > metadata.koin_buffer,
      "Not enough liquid KOIN in contract to burn"
    );

    const koinToBurn = availableMana - metadata.koin_buffer;
    const pobArgs = new pob.burn_arguments(
      koinToBurn,
      Constants.ContractId(),
      Constants.ContractId()
    );

    // call pob.burn(koinToBurn, contractId, contractId)
    // this will fail for any address other than the contract address
    // this is because koin.burn is not authorized for other addresses
    // TODO since the caller is the contract and not the other address, this should be allowed
    // potentially an authority issue with KOIN contract or the way POB passes through to KOIN
    const callRes = System.call(
      Constants.PobContractId(),
      Constants.POB_BURN_ENTRY_POINT,
      Protobuf.encode(pobArgs, pob.burn_arguments.encode)
    );
    System.require(callRes.code == 0, "Failed to burn KOIN for VHP");

    System.event(
      "pool.reburn",
      Protobuf.encode(
        new pool.reburn_event(koinToBurn),
        pool.reburn_event.encode
      ),
      [Constants.ContractId()]
    );

    return new pool.reburn_result(true);
  }

  allocate_profit(depositAmount: u64 = 0): void {
    const basis = State.GetBasis();
    const totalStakedBeforeDeposit =
      Tokens.virtualBalanceOf(Constants.ContractId()) - depositAmount;
    const metadata = State.GetMetadata();

    if (basis >= totalStakedBeforeDeposit) {
      return;
    }

    // totalStaked - basis / operatorFee = profit since last reburn / 20
    // operator takes 5% of profits
    const operatorShareOfProfit = SafeMath.div(
      SafeMath.sub(totalStakedBeforeDeposit, basis),
      metadata.operator_fee
    );

    System.require(
      Tokens.Koin().transfer(
        Constants.ContractId(),
        metadata.operator_wallet!,
        operatorShareOfProfit
      ),
      "Failed to transfer operator share of profit"
    );

    // reset basis to totalStaked - operatorShare
    // this ensures we don't take operator fee more than once on any given profit
    State.SaveBasis(totalStakedBeforeDeposit - operatorShareOfProfit);
  }
}
