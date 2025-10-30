<script lang="ts">
  import { PlusIcon, ChevronUpIcon } from "@lucide/svelte";
  import Send from "./Send.svelte";
  import { viewerFileId } from "../ts/state.svelte";
  import FileViewer from "./FileViewer.svelte";
  import FileCard from "./FileCard.svelte";
  import { filesData } from "../ts/state.svelte";

  let showSendDiv = $state(false);
</script>

<main>
  {#if viewerFileId.id}
    <FileViewer />
  {:else}
    <div class="p-2">
      <div>
        <button
          class="btn btn-soft btn-square"
          onclick={() => (showSendDiv = !showSendDiv)}>
          {#if showSendDiv}
            <ChevronUpIcon />
          {:else}
            <PlusIcon />
          {/if}
        </button>
      </div>

      {#if showSendDiv}
        <Send />
      {/if}
      <div class="divider m-1"></div>

      <div class="flex flex-col gap-2">
        {#each Object.entries(filesData) as [id, data]}
          <FileCard {id} {data} />
        {/each}
      </div>
    </div>
  {/if}
</main>
