<script lang="ts">
  import { readableSize, toPercent } from "../ts/utils";
  import downloadImg from "../assets/download.svg";
  import CircularProgressBar from "./CircularProgressBar.svelte";
  import Loader from "./Loader.svelte";
  import localforage from "localforage";
  import type { FileData } from "../ts/types";

  let { id, data }: {id: string, data: FileData} = $props();
  let exportingFile: boolean = $state(false);

  async function exportFile() {
    exportingFile = true;
    interface Parts {
      [index: number]: string,
      length: number
    }
    let parts: Parts = {
      length: 0,
    };

    const db = localforage.createInstance({ name: id });
    await db.iterate((val: string, i: string) => {
      parts[Number(i)] = val;
      ++parts.length;
    });

    if (parts.length !== data.totalParts) {
      Object.entries(data.parts!).forEach(([i, val]: [string, string]) => {
        if (val) {
          parts[Number(i)] = val;
          ++parts.length;
        }
      });
    }

    try {
      await window.webxdc.sendToChat({
        file: {
          name: data.name!,
          base64: Array.from(parts).join(""),
        },
      });
    } catch (err) {
      console.log(err);
      alert(err);
    } finally {
      exportingFile = false;
    }
  }
</script>

<main>
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
</main>

<style>
  main {
    display: flex;
    margin-top: 5px;
    margin-bottom: 5px;
    border-radius: 5px;
    padding: 3px;
    background-color: #eee;
    align-items: center;
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
    main {
      background-color: #333;
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
