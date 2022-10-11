import { System, chain } from "@koinos/sdk-as";
import { Constants } from "./Constants";
import { pool } from "./proto/pool";

export namespace State {
  const BASIS_SPACE_ID = 0;
  const BASIS_KEY = new Uint8Array(0);
  const METADATA_SPACE_ID = 1;
  const METADATA_KEY = new Uint8Array(0);

  let basisSpace: chain.object_space | null = null;
  let metadataSpace: chain.object_space | null = null;

  function BasisSpace(): chain.object_space {
    if (basisSpace == null) {
      basisSpace = new chain.object_space(
        false,
        Constants.ContractId(),
        BASIS_SPACE_ID
      );
    }
    return basisSpace!;
  }

  export function GetBasis(): u64 {
    const basis = System.getObject<Uint8Array, pool.basis_object>(
      BasisSpace(),
      BASIS_KEY,
      pool.basis_object.decode
    );

    if (basis) {
      return basis.value;
    }

    return 0;
  }

  export function SaveBasis(basis: u64): void {
    System.putObject(
      BasisSpace(),
      BASIS_KEY,
      new pool.basis_object(basis),
      pool.basis_object.encode
    );
  }

  function MetadataSpace(): chain.object_space {
    if (metadataSpace == null) {
      metadataSpace = new chain.object_space(
        false,
        Constants.ContractId(),
        METADATA_SPACE_ID
      );
    }
    return metadataSpace!;
  }

  export function GetMetadata(): pool.metadata_object {
    return System.getObject<Uint8Array, pool.metadata_object>(
      MetadataSpace(),
      METADATA_KEY,
      pool.metadata_object.decode
    )!;
  }

  export function SaveMetadata(metadata: pool.metadata_object): void {
    System.putObject(
      MetadataSpace(),
      METADATA_KEY,
      metadata,
      pool.metadata_object.encode
    );
  }
}
