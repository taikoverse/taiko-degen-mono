import { BigNumber, Contract, ethers } from "ethers";
import TaikoL1 from "../constants/abi/TaikoL1";
import type { Status, StatusIndicatorProp } from "../domain/status";
import { getAvailableSlots } from "./getAvailableSlots";
import { getBlockFee } from "./getBlockFee";
import { getEthDeposits } from "./getEthDeposits";
import { getGasPrice } from "./getGasPrice";
import { getLastVerifiedBlockId } from "./getLastVerifiedBlockId";
import { getLatestSyncedHeader } from "./getLatestSyncedHeader";
import { getNextBlockId } from "./getNextBlockId";
import { getNextEthDepositToProcess } from "./getNextEthDepositToProcess";
import { getNumProposers } from "./getNumProposers";
import { getNumProvers } from "./getNumProvers";
import { getPendingBlocks } from "./getPendingBlocks";
import { getPendingTransactions } from "./getPendingTransactions";
import { getProofReward } from "./getProofReward";
import { getQueuedTransactions } from "./getQueuedTransactions";
import { getStateVariables } from "./getStateVariables";
import type { initConfig } from "./initConfig";
import { watchHeaderSynced } from "./watchHeaderSynced";

export function buildStatusIndicators(
  config: ReturnType<typeof initConfig>,
  onProverClick: (value: Status) => void,
  onProposerClick: (value: Status) => void
) {
  const indicators: StatusIndicatorProp[] = [
    {
      statusFunc: async (
        provider: ethers.providers.JsonRpcProvider,
        address: string
      ) => (await getNumProvers(config.eventIndexerApiUrl)).uniqueProvers,
      provider: config.l1Provider,
      contractAddress: config.l1TaikoAddress,
      header: "Unique Provers",
      intervalInMs: 0,
      colorFunc: (value: Status) => {
        return "green";
      },
      onClick: onProverClick,
      tooltip:
        "The number of unique provers who successfully submitted a proof to the TaikoL1 smart contract.",
    },
    {
      statusFunc: async (
        provider: ethers.providers.JsonRpcProvider,
        address: string
      ) => (await getNumProposers(config.eventIndexerApiUrl)).uniqueProposers,
      provider: config.l1Provider,
      contractAddress: config.l1TaikoAddress,
      header: "Unique Proposers",
      intervalInMs: 0,
      colorFunc: (value: Status) => {
        return "green";
      },
      onClick: onProposerClick,
      tooltip:
        "The number of unique proposers who successfully submitted a proposed block to the TaikoL1 smart contract.",
    },
    {
      statusFunc: getLatestSyncedHeader,
      watchStatusFunc: watchHeaderSynced,
      provider: config.l1Provider,
      contractAddress: config.l1TaikoAddress,
      header: "L1 Latest Synced Header",
      intervalInMs: 0,
      colorFunc: (value: Status) => {
        return "green";
      },
      onClick: (value: Status) => {
        window.open(
          `${config.l2ExplorerUrl}/block/${value.toString()}`,
          "_blank"
        );
      },
      tooltip:
        "The most recent Layer 2 Header that has been synchronized with the TaikoL1 smart contract.",
    },
    {
      statusFunc: getLatestSyncedHeader,
      watchStatusFunc: watchHeaderSynced,
      provider: config.l2Provider,
      contractAddress: config.l2TaikoAddress,
      header: "L2 Latest Synced Header",
      intervalInMs: 0,
      colorFunc: (value: Status) => {
        return "green";
      },
      onClick: (value: Status) => {
        window.open(
          `${config.l1ExplorerUrl}/block/${value.toString()}`,
          "_blank"
        );
      },
      tooltip:
        "The most recent Layer 1 Header that has been synchronized with the TaikoL2 smart contract. The headers are synchronized with every L2 block.",
    },
    {
      statusFunc: getPendingTransactions,
      watchStatusFunc: null,
      provider: config.l2Provider,
      contractAddress: "",
      header: "Tx Mempool (pending)",
      intervalInMs: 20000,
      colorFunc: (value: Status) => {
        if (BigNumber.from(value).gt(4000)) return "red";
        return "green";
      },
      tooltip:
        "The current processable transactions in the mempool that have not been added to a block yet.",
    },
    {
      statusFunc: getQueuedTransactions,
      watchStatusFunc: null,
      provider: config.l2Provider,
      contractAddress: "",
      header: "Tx Mempool (queued)",
      intervalInMs: 20000,
      colorFunc: (value: Status) => {
        if (BigNumber.from(value).gt(4000)) return "red";
        return "green";
      },
      tooltip:
        "The current transactions in the mempool where the transaction nonce is not in sequence. They are currently non-processable.",
    },
    {
      statusFunc: getAvailableSlots,
      watchStatusFunc: null,
      provider: config.l1Provider,
      contractAddress: config.l1TaikoAddress,
      header: "Available Slots",
      intervalInMs: 20000,
      colorFunc: (value: Status) => {
        if (BigNumber.from(value).eq(0)) return "red";
        return "green";
      },
      tooltip:
        "The amount of slots for proposed blocks on the TaikoL1 smart contract. When this number is 0, no blocks can be proposed until a block has been proven.",
    },
    {
      statusFunc: getLastVerifiedBlockId,
      watchStatusFunc: null,
      provider: config.l1Provider,
      contractAddress: config.l1TaikoAddress,
      header: "Last Verified Block ID",
      intervalInMs: 20000,
      colorFunc: (value: Status) => {
        return "green";
      },
      tooltip:
        "The most recently verified Layer 2 block on the TaikoL1 smart contract.",
    },
    {
      statusFunc: getNextBlockId,
      watchStatusFunc: null,
      provider: config.l1Provider,
      contractAddress: config.l1TaikoAddress,
      header: "Next Block ID",
      intervalInMs: 20000,
      colorFunc: (value: Status) => {
        return "green";
      },
      tooltip:
        "The ID that the next proposed block on the TaikoL1 smart contract will receive.",
    },
    {
      statusFunc: getPendingBlocks,
      watchStatusFunc: null,
      provider: config.l1Provider,
      contractAddress: config.l1TaikoAddress,
      header: "Unverified Blocks",
      intervalInMs: 20000,
      colorFunc: (value: Status) => {
        if (BigNumber.from(value).eq(0)) {
          return "red";
        } else if (BigNumber.from(value).lt(5)) {
          return "yellow";
        } else {
          return "green";
        }
      },
      tooltip:
        "The amount of pending proposed blocks that have not been proven on the TaikoL1 smart contract.",
    },
    {
      statusFunc: getEthDeposits,
      watchStatusFunc: null,
      provider: config.l1Provider,
      contractAddress: config.l1TaikoAddress,
      header: "ETH Deposits",
      intervalInMs: 20000,
      colorFunc: (value: Status) => {
        if (BigNumber.from(value).eq(0)) {
          return "green";
        } else if (BigNumber.from(value).lt(32)) {
          return "yellow";
        } else {
          return "red";
        }
      },
      tooltip: "The number of pending ETH deposits for L1 => L2",
    },
    {
      statusFunc: getNextEthDepositToProcess,
      watchStatusFunc: null,
      provider: config.l1Provider,
      contractAddress: config.l1TaikoAddress,
      header: "Next ETH Deposit",
      intervalInMs: 20000,
      colorFunc: (value: Status) => {
        return "green";
      },
      tooltip: "The next ETH deposit that will be processed",
    },
    {
      statusFunc: getGasPrice,
      watchStatusFunc: null,
      provider: config.l2Provider,
      contractAddress: "",
      header: "Gas Price (gwei)",
      intervalInMs: 20000,
      colorFunc: (value: Status) => {
        return "green";
      },
      tooltip:
        "The current recommended gas price for a transaction on Layer 2.",
    },
  ];

  try {
    indicators.push({
      statusFunc: getBlockFee,
      watchStatusFunc: null,
      provider: config.l1Provider,
      contractAddress: config.l1TaikoAddress,
      header: "Block Fee",
      intervalInMs: 15000,
      colorFunc: function (status: Status) {
        return "green"; // todo: whats green, yellow, red?
      },
      tooltip:
        "The current fee to propose a block to the TaikoL1 smart contract.",
    });
    indicators.push({
      statusFunc: getProofReward,
      watchStatusFunc: null,
      provider: config.l1Provider,
      contractAddress: config.l1TaikoAddress,
      header: "Proof Reward",
      intervalInMs: 15000,
      colorFunc: function (status: Status) {
        return "green"; // todo: whats green, yellow, red?
      },
      tooltip:
        "The current reward for successfully submitting a proof for a proposed block on the TaikoL1 smart contract.",
    });
    indicators.push({
      provider: config.l1Provider,
      contractAddress: config.l1TaikoAddress,
      header: "Latest Proof",
      intervalInMs: 0,
      status: "0",
      watchStatusFunc: async (
        provider: ethers.providers.JsonRpcProvider,
        address: string,
        onEvent: (value: Status) => void
      ) => {
        const contract = new Contract(address, TaikoL1, provider);
        contract.on(
          "BlockProven",
          (
            id,
            parentHash,
            blockHash,
            signalRoot,
            prover,
            provenAt,
            ...args
          ) => {
            // ignore oracle prover
            if (
              prover.toLowerCase() !== config.oracleProverAddress.toLowerCase()
            ) {
              onEvent(new Date().getTime().toString());
            }
          }
        );
      },
      colorFunc: function (status: Status) {
        return "green"; // todo: whats green, yellow, red?
      },
      tooltip: "The most recent block proof submitted on TaikoL1 contract.",
    });

    indicators.push({
      provider: config.l1Provider,
      contractAddress: config.l1TaikoAddress,
      statusFunc: async (
        provider: ethers.providers.JsonRpcProvider,
        address: string
      ) => {
        const stateVars = await getStateVariables(provider, address);
        return `${stateVars.proofTimeIssued.toNumber() / 1000} seconds`;
      },
      colorFunc: function (status: Status) {
        return "green"; // todo: whats green, yellow, red?
      },
      header: "Average Proof Time",
      intervalInMs: 5 * 1000,
      tooltip:
        "The current average proof time, updated when a block is successfully proven.",
    });
  } catch (e) {
    console.error(e);
  }

  return indicators;
}
