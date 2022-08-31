import { Base58, chain, MockVM, Protobuf, system_calls, token } from '@koinos/sdk-as';
import { Pool } from '../Pool';
import { pool } from '../proto/pool';

const TEST_CONTRACT_ID = Base58.decode('1FPiwDdVGhWb4iAvvdALVXY88rgvkAA5mT');

describe('pool', () => {
  beforeEach(() => {
    MockVM.reset();
    MockVM.setContractId(TEST_CONTRACT_ID);
  });


  it("should get the basis", () => {
    const contract = new Pool();

    const args = new pool.basis_arguments();
    const res = contract.basis(args);

    expect(res.value).toBe(0);
  });
});