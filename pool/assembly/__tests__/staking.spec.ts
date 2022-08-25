import { Base58, chain, MockVM, Protobuf, system_calls, token } from '@koinos/sdk-as';
import { Pool } from '../Pool';
import { pool } from '../proto/pool';

const TOKEN_CONTRACT_ID = Base58.decode('1FPiwDdVGhWb4iAvvdALVXY88rgvkAA5mT');
const MOCK_ACCT1 = Base58.decode('1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqG');

describe('pool', () => {
  beforeEach(() => {
    MockVM.reset();
    MockVM.setContractId(TOKEN_CONTRACT_ID);
  });

  it('should stake tokens', () => {
    const stk = new Pool();

    // mock a successful token transfer result
    MockVM.setCallContractResults([new system_calls.exit_arguments(1)]);

    // call the stake function
    const stakeArgs = new pool.stake_arguments(MOCK_ACCT1, 10);
    const stakeRes = stk.stake(stakeArgs);

    // should be successfully staked
    expect(stakeRes.value).toBe(true);

    // the staked balance should reflect the correct amount
    const balArgs = new pool.balance_of_arguments(MOCK_ACCT1);
    const balRes = stk.balance_of(balArgs);

    expect(balRes.value).toBe(10);
  });
});