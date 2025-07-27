<script lang="ts">
  import FileCard from "./FileCard.svelte";
  import FileViewer from "./FileViewer.svelte";
  import { filesData, viewerFileId } from "../ts/state.svelte";
</script>

<main>
  {#each Object.entries(filesData) as [id, data]}
    <FileCard {id} {data} />
  {/each}
</main>

{#if viewerFileId.id}
  <FileViewer />
{/if}
