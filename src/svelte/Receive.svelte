<script lang="ts">
  import FileCard from "./FileCard.svelte";
  import { filesData } from "../ts/state.svelte";
</script>

<main class="flex flex-col gap-2">
  {#each Object.entries(filesData) as [id, data]}
    <FileCard {id} {data} />
  {/each}
</main>
