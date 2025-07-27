<script lang="ts">
  import { readableSize, toPercent, exportFileToChat } from "../ts/utils";
  import downloadImg from "../assets/download.svg";
  import CircularProgressBar from "./CircularProgressBar.svelte";
  import Loader from "./Loader.svelte";
  import type { FileData } from "../ts/types";
  import { viewerFileId } from "../ts/state.svelte";

  let { id, data }: {id: string, data: FileData} = $props();
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
    if ((event.target! as HTMLDivElement).closest('button')) {
      return;
    }
    
    if (data.name && data.totalParts) {
      viewerFileId.id = id;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      //@ts-ignore
      handleCardClick(event);
    }
  }
</script>

<div onclick={handleCardClick} onkeydown={handleKeydown} role="button" tabindex="0" class="file-card" class:clickable={data.name && data.totalParts}>
  <div class="download">
    {#if data.receivedParts === data.totalParts}
      {#if exportingFile}
        <Loader />
      {:else}
        <button onclick={exportFile}>
          <img src={downloadImg} alt="download" />
        </button>
      {/if}
    {:else if data.totalParts}
      <CircularProgressBar
        progress={toPercent(data.receivedParts || 0, data.totalParts)}
        text={`${data.receivedParts || 0}/${data.totalParts}`}
      />
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
    margin-top: 5px;
    margin-bottom: 5px;
    border-radius: 5px;
    padding: 3px;
    background-color: #eee;
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

  button {
    background-color: #ddd;
  }

  button:hover {
    background-color: #ccc;
  }

  button:active {
    background-color: #bbb;
  }

  @media (prefers-color-scheme: dark) {
    .file-card {
      background-color: #333;
    }
    
    .file-card.clickable:hover {
      background-color: #444;
    }
    
    button {
      background-color: #444;
    }
    button:hover {
      background-color: #555;
    }
    button:active {
      background-color: #666;
    }
  }
</style>
