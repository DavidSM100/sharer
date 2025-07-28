<script lang="ts">
  import { PlusIcon, ChevronUpIcon } from "@lucide/svelte";
  import Send from "./Send.svelte";
  import Receive from "./Receive.svelte";
  import { showSendDiv, viewerFileId } from "../ts/state.svelte";
  import FileViewer from "./FileViewer.svelte";
</script>

<main>
  <div>
    <button class="btn" onclick={() => (showSendDiv.show = !showSendDiv.show)}>
      {#if showSendDiv.show}
        <ChevronUpIcon />
      {:else}
        <PlusIcon />
      {/if}
    </button>
  </div>

  {#if viewerFileId.id}
    <FileViewer />
  {:else}
    {#if showSendDiv.show}
      <Send />
    {/if}

    <Receive />
  {/if}
</main>
