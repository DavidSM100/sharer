<script lang="ts">
  import FileCard from "./FileCard.svelte";
  import FileViewer from "./FileViewer.svelte";
  import { filesData } from "../ts/state.svelte";

  let viewerFileId: string | null = $state(null);

  function openFileViewer(id: string) {
    viewerFileId = id;
  }

  function closeFileViewer() {
    viewerFileId = null;
  }
</script>

<main>
  {#each Object.entries(filesData) as [id, data]}
    <FileCard {id} {data} onViewFile={openFileViewer} />
  {/each}
</main>

{#if viewerFileId}
  <FileViewer id={viewerFileId} onClose={closeFileViewer} />
{/if}
