<script lang="ts">
  import FileCard from "./FileCard.svelte";
  import { filesData } from "../ts/state.svelte";
</script>

<main>
  {#each Object.entries(filesData) as [id, data]}
    <FileCard {id} {data} />
  {/each}
</main>
