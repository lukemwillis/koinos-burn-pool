import { System } from "@koinos/sdk-as";

export class Constants {
  static ContractId(): Uint8Array {
    return System.getContractId();
  }

  static KoinContractId(): Uint8Array {
    if (BUILD_FOR_TESTING) {
      // Address: BRmrUgtSQVUggoeE9weG4f7nidyydnYfQ
      return arrayToUint8Array([
        0x00, 0x72, 0x60, 0xae, 0xaf, 0xad, 0xc7, 0x04, 0x31, 0xea, 0x9c, 0x3f,
        0xbe, 0xf1, 0x35, 0xb9, 0xa4, 0x15, 0xc1, 0x0f, 0x51, 0x95, 0xe8, 0xd5,
        0x57,
      ]);
    } else {
      // Address: 19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ
      return arrayToUint8Array([
        0x00, 0x5b, 0x1e, 0x61, 0xd3, 0x72, 0x59, 0xb9, 0xc2, 0xd9, 0x9b, 0xf4,
        0x17, 0xf5, 0x92, 0xe0, 0xb7, 0x77, 0x25, 0x16, 0x5d, 0x24, 0x88, 0xbe,
        0x45,
      ]);
    }
  }

  static VhpContractId(): Uint8Array {
    if (BUILD_FOR_TESTING) {
      // Address: 1CZvRyRuNxghMUUNGqsKsT5x55r6wugd1C
      return arrayToUint8Array([
        0x00, 0x7e, 0xe3, 0x4b, 0xc6, 0x08, 0xc0, 0x4c, 0xd5, 0x37, 0x34, 0x7c,
        0xf7, 0x30, 0x28, 0x15, 0x77, 0x4f, 0xcf, 0x75, 0x0c, 0x6a, 0x87, 0x75,
        0xf3,
      ]);
    } else {
      // Address: 1JZqj7dDrK5LzvdJgufYBJNUFo88xBoWC8
      return arrayToUint8Array([
        0x00, 0xc0, 0xb0, 0x1f, 0xa4, 0xbb, 0xcd, 0x9f, 0x06, 0x1e, 0x0d, 0xf2,
        0x92, 0x67, 0x0c, 0xa0, 0xdb, 0xfa, 0xa6, 0x52, 0x6a, 0xdb, 0x88, 0xae,
        0x09,
      ]);
    }
  }
}

function arrayToUint8Array(a: Array<u8>): Uint8Array {
  let uArray = new Uint8Array(a.length);

  for (let i = 0; i < a.length; i++) uArray[i] = a[i];

  return uArray;
}
