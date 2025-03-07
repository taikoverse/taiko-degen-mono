<script lang="ts">
  import StatusIndicator from "../../components/StatusIndicator.svelte";
  import { onMount } from "svelte";
  import type { Status, StatusIndicatorProp } from "../../domain/status";
  import { getNumProvers } from "../../utils/getNumProvers";
  import { getNumProposers } from "../../utils/getNumProposers";
  import DetailsModal from "../../components/DetailsModal.svelte";
  import { addressSubsection } from "../../utils/addressSubsection";
  import { layerToDisplayName } from "../../utils/layerToDisplayName";
  import { layer } from "../../store/layer";
  import { Layer } from "../../domain/layer";
  import { initConfig } from "../../utils/initConfig";
  import { buildStatusIndicators } from "../../utils/buildStatusIndicators";

  let statusIndicators: StatusIndicatorProp[] = [];

  let proverDetailsOpen: boolean = false;
  let proposerDetailsOpen: boolean = false;
  let config: ReturnType<typeof initConfig>;

  onMount(async () => {
    config = initConfig($layer);
    statusIndicators = buildStatusIndicators(
      config,
      (value: Status) => {
        proverDetailsOpen = true;
      },
      (value: Status) => {
        proposerDetailsOpen = true;
      }
    );
  });

  async function toggleLayer() {
    const newLayer = $layer === Layer.Two ? Layer.Three : Layer.Two;
    layer.set(newLayer);

    config = initConfig(newLayer);
    statusIndicators = [];
    setTimeout(() => {
      statusIndicators = buildStatusIndicators(
        config,
        (value: Status) => {
          proverDetailsOpen = true;
        },
        (value: Status) => {
          proposerDetailsOpen = true;
        }
      );
    }, 1 * 500);
  }
</script>

<div class="text-center">
  <h1 class="text-2xl">Taiko Protocol Status</h1>
  <h2 class="cursor-pointer" on:click={toggleLayer}>
    {layerToDisplayName($layer)}
  </h2>
</div>
<div
  class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center my-10"
>
  {#each statusIndicators as statusIndicator}
    <StatusIndicator
      statusFunc={statusIndicator.statusFunc}
      watchStatusFunc={statusIndicator.watchStatusFunc}
      provider={statusIndicator.provider}
      contractAddress={statusIndicator.contractAddress}
      header={statusIndicator.header}
      colorFunc={statusIndicator.colorFunc}
      onClick={statusIndicator.onClick}
      intervalInMs={statusIndicator.intervalInMs}
      tooltip={statusIndicator.tooltip}
      status={statusIndicator.status}
    />
  {/each}
</div>

{#if proverDetailsOpen}
  <DetailsModal title={"Prover Details"} bind:isOpen={proverDetailsOpen}>
    <div
      class="grid grid-cols-2 gap-4 text-center my-10 max-h-96 overflow-y-auto"
      slot="body"
    >
      {#await getNumProvers(config.eventIndexerApiUrl) then provers}
        {#each provers.provers as prover}
          <a
            href="{config.l1ExplorerUrl}/address/{prover.address}"
            target="_blank"
            rel="noreferrer"
          >
            {addressSubsection(prover.address)}
          </a>
          <div>{prover.count}</div>
        {/each}
      {:catch error}
        <p class="red">{error.message}</p>
      {/await}
    </div>
  </DetailsModal>
{/if}

{#if proposerDetailsOpen}
  <DetailsModal title={"Prover Details"} bind:isOpen={proposerDetailsOpen}>
    <div
      class="grid grid-cols-2 gap-4 text-center my-10 max-h-96 overflow-y-auto"
      slot="body"
    >
      {#await getNumProposers(config.eventIndexerApiUrl) then proposers}
        {#each proposers.proposers as proposer}
          <a
            href="{config.l1ExplorerUrl}/address/{proposer.address}"
            target="_blank"
            rel="noreferrer"
          >
            {addressSubsection(proposer.address)}
          </a>
          <div>{proposer.count}</div>
        {/each}
      {:catch error}
        <p class="red">{error.message}</p>
      {/await}
    </div>
  </DetailsModal>
{/if}
