<script lang="ts">
  import { readableSize, toPercent, exportFileToChat } from "../ts/utils";
  import { DownloadIcon } from "@lucide/svelte";
  import CircularProgressBar from "./CircularProgressBar.svelte";
  import type { FileData } from "../ts/types";
  import { viewerFileId } from "../ts/state.svelte";

  let { id, data }: { id: string; data: FileData } = $props();
  let exportingFile: boolean = $state(false);

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

  function handleCardClick(event: MouseEvent) {
    // Don't open viewer if user clicked on download button
    if ((event.target! as HTMLDivElement).closest("button")) {
      return;
    }

    if (data.name && data.totalParts) {
      viewerFileId.id = id;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      //@ts-ignore
      handleCardClick(event);
    }
  }
</script>

<div
  onclick={handleCardClick}
  onkeydown={handleKeydown}
  role="button"
  tabindex="0"
  class="card card-border file-card shadow-xl"
  class:clickable={data.name && data.totalParts}>
  <div class="download">
    {#if data.receivedParts === data.totalParts}
      {#if exportingFile}
        <span class="loading"></span>
      {:else}
        <button class="btn" onclick={exportFile}>
          <DownloadIcon />
        </button>
      {/if}
    {:else if data.totalParts}
      <CircularProgressBar
        progress={toPercent(data.receivedParts || 0, data.totalParts)}
        text={`${data.receivedParts || 0}/${data.totalParts}`} />
    {/if}
  </div>

  <div class="info">
    {#if data.sender}
      <div>
        <b>{data.sender}</b>
      </div>
    {/if}

    {#if data.name}
      <div>{data.name}</div>
    {/if}

    {#if data.size}
      <div>
        <small>{readableSize(data.size)}</small>
      </div>
    {/if}
  </div>
</div>

<style>
  .file-card {
    display: flex;
    flex-direction: row;
    margin-top: 5px;
    margin-bottom: 5px;
    border-radius: 5px;
    padding: 3px;
    align-items: center;
  }

  .file-card.clickable {
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .file-card.clickable:hover {
    background-color: #ddd;
  }

  .file-card.clickable:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }

  .download {
    margin-right: 3px;
  }

  .info div {
    margin-top: 2px;
    margin-bottom: 2px;
  }

  @media (prefers-color-scheme: dark) {
    .file-card.clickable:hover {
      background-color: #444;
    }
  }
</style>
