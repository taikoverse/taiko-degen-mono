import { ethers } from "ethers";
import { Layer } from "../domain/layer";

export function initConfig(layer: Layer) {
  const l1Provider = new ethers.providers.JsonRpcProvider(
    layer === Layer.Two
      ? import.meta.env.VITE_L1_RPC_URL
      : import.meta.env.VITE_L2_RPC_URL
  );
  const l2Provider = new ethers.providers.JsonRpcProvider(
    layer === Layer.Two
      ? import.meta.env.VITE_L2_RPC_URL
      : import.meta.env.VITE_L3_RPC_URL
  );

  const l1TaikoAddress =
    layer === Layer.Two
      ? import.meta.env.VITE_L2_TAIKO_L1_ADDRESS
      : import.meta.env.VITE_L3_TAIKO_L1_ADDRESS;
  const l2TaikoAddress =
    layer === Layer.Two
      ? import.meta.env.VITE_L2_TAIKO_L2_ADDRESS
      : import.meta.env.VITE_L3_TAIKO_L2_ADDRESS;
  const l1ExplorerUrl = import.meta.env.VITE_L1_EXPLORER_URL;
  const l2ExplorerUrl =
    layer === Layer.Two
      ? import.meta.env.VITE_L2_EXPLORER_URL
      : import.meta.env.VITE_L3_EXPLORER_URL;
  const feeTokenSymbol = import.meta.env.VITE_FEE_TOKEN_SYMBOL || "TKO";
  const oracleProverAddress =
    import.meta.env.ORACLE_PROVER_ADDRESS ||
    "0x1567CDAb5F7a69154e61A16D8Ff5eE6A3e991b39";
  const eventIndexerApiUrl =
    layer === Layer.Two
      ? import.meta.env.VITE_L2_EVENT_INDEXER_API_URL
      : import.meta.env.VITE_L3_EVENT_INDEXER_API_URL;
  return {
    l1Provider,
    l2Provider,
    l1TaikoAddress,
    l2TaikoAddress,
    l1ExplorerUrl,
    l2ExplorerUrl,
    feeTokenSymbol,
    oracleProverAddress,
    eventIndexerApiUrl,
  };
}
