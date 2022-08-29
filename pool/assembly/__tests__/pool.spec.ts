import { Base58, chain, MockVM, Protobuf, system_calls, token } from '@koinos/sdk-as';
import { Pool } from '../Pool';
import { pool } from '../proto/pool';

const TEST_CONTRACT_ID = Base58.decode('1FPiwDdVGhWb4iAvvdALVXY88rgvkAA5mT');
const MOCK_ACCT1 = Base58.decode('1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqG');

describe('pool', () => {
  beforeEach(() => {
    MockVM.reset();
    MockVM.setContractId(TEST_CONTRACT_ID);
  });

  it('should deposit koin', () => {
    const poolContract = new Pool();

    // mock a successful token transfer result
    MockVM.setCallContractResults([new system_calls.exit_arguments(1)]);

    // call the deposit function
    const depositArgs = new pool.deposit_koin_arguments(MOCK_ACCT1, 10);
    const depositRes = poolContract.deposit_koin(depositArgs);

    // should be successfully deposited
    expect(depositRes.value).toBe(true);

    // the balance should reflect the correct amount
    const balArgs = new pool.balance_of_arguments(MOCK_ACCT1);
    const balRes = poolContract.balance_of(balArgs);

    expect(balRes.value).toBe(10);
  });
});