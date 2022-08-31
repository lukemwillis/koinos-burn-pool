import { Base58, MockVM, Arrays, Protobuf, authority } from "@koinos/sdk-as";
import { Token } from "../Token";
import { token } from "../proto/token";

const CONTRACT_ID = Base58.decode("1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqe");

describe("token", () => {
  beforeEach(() => {
    MockVM.reset();
    MockVM.setContractId(CONTRACT_ID);
  });

  it("should get the name", () => {
    const contract = new Token();

    const args = new token.name_arguments();
    const res = contract.name(args);

    expect(res.value).toBe("Pooled VHP");
  });

  it("should get the symbol", () => {
    const contract = new Token();

    const args = new token.symbol_arguments();
    const res = contract.symbol(args);

    expect(res.value).toBe("PVHP");
  });

  it("should get the decimals", () => {
    const contract = new Token();

    const args = new token.decimals_arguments();
    const res = contract.decimals(args);

    expect(res.value).toBe(8);
  });
});
