<script lang="ts">
  import { PlusIcon, ChevronUpIcon } from "@lucide/svelte";
  import Send from "./Send.svelte";
  import { showSendDiv, viewerFileId } from "../ts/state.svelte";
  import FileViewer from "./FileViewer.svelte";
  import FileCard from "./FileCard.svelte";
  import { filesData } from "../ts/state.svelte";
</script>

<main>
  {#if viewerFileId.id}
    <FileViewer />
  {:else}
    <div>
      <button
        class="btn btn-soft btn-square"
        onclick={() => (showSendDiv.show = !showSendDiv.show)}>
        {#if showSendDiv.show}
          <ChevronUpIcon />
        {:else}
          <PlusIcon />
        {/if}
      </button>
    </div>

    {#if showSendDiv.show}
      <Send />
    {/if}
    <div class="divider m-1"></div>

    <div class="flex flex-col gap-2">
      {#each Object.entries(filesData) as [id, data]}
        <FileCard {id} {data} />
      {/each}
    </div>
  {/if}
</main>
