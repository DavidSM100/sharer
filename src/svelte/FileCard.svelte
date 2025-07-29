<script lang="ts">
  import { readableSize, toPercent, exportFileToChat } from "../ts/utils";
  import { DownloadIcon, PlayIcon } from "@lucide/svelte";
  import CircularProgressBar from "./CircularProgressBar.svelte";
  import type { FileData } from "../ts/types";
  import { viewerFileId } from "../ts/state.svelte";

  let { id, data }: { id: string; data: FileData } = $props();
  let exportingFile: boolean = $state(false);
  let isMedia = $derived(
    data.mimeType?.startsWith("image") ||
      data.mimeType?.startsWith("audio") ||
      data.mimeType?.startsWith("video") ||
      false
  );

  async function exportFile() {
    exportingFile = true;

    try {
      await exportFileToChat(id, data);
    } catch (err: any) {
      console.error("Error exporting file:", err);
      alert("Failed to export file: " + err.message);
    } finally {
      exportingFile = false;
    }
  }
</script>

<div class="border-base-300 flex items-center gap-2 border p-2 shadow">
  <div>
    {#if data.receivedParts === data.totalParts}
      <button
        disabled={exportingFile}
        class="btn btn-soft"
        onclick={exportFile}>
        {#if exportingFile}
          <span class="loading"></span>
        {:else}
          <DownloadIcon />
        {/if}
      </button>
    {:else if data.totalParts}
      <CircularProgressBar
        progress={toPercent(data.receivedParts || 0, data.totalParts)}
        text={`${data.receivedParts || 0}/${data.totalParts}`} />
    {/if}
  </div>

  <div class="flex flex-col gap-1">
    {#if data.sender && data.size}
      <div class="flex justify-between">
        <b>{data.sender}</b>
        <small><b>{readableSize(data.size)}</b></small>
      </div>
    {/if}

    {#if data.name}
      <div>{data.name}</div>
    {/if}
    {#if isMedia}
      <div>
        <button class="btn btn-soft" onclick={() => (viewerFileId.id = id)}>
          View
          <PlayIcon />
        </button>
      </div>
    {/if}
  </div>
</div>
