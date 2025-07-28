<script lang="ts">
  import type { SendingStatusUpdate } from "@webxdc/types";
  import { splitString, readableSize, blobToBase64 } from "../ts/utils";
  import Loader from "./Loader.svelte";
  import type { FileInfo, FilePart } from "../ts/types";

  let selectedPartSize: string = $state(localStorage.getItem("partsize") || "6");
  let selectedFile: File | null = $state(null);
  let sendingFile: boolean = $state(false);

  async function selectFile(): Promise<void> {
    selectedFile = (await window.webxdc.importFiles({}))[0];
  }

  async function sendFile(): Promise<void> {
    const file = selectedFile;
    selectedFile = null;
    if (!file) return;
    sendingFile = true;

    const name = file.name;
    const size = file.size;
    const id = String(Date.now()) + String(size);
    const sender = window.webxdc.selfName;

    const base64File = await blobToBase64(file);
    const partSize = Number(selectedPartSize) * (1000 * 1000) / 3 * 4;
    const parts = splitString(base64File, partSize);

    const partsUpdates = parts.map((part, i) => {
      let update: SendingStatusUpdate<FilePart> = {
        payload: {
          type: "part",
          id: id,
          i: i,
          part: part,
        },
      };

      if (i + 1 === parts.length) {
        update.payload.name = name;
        update.payload.totalParts = parts.length;
      }

      return update;
    });

    const info = `${sender}: "${name}"`;
    const infoUpdate: SendingStatusUpdate<FileInfo> = {
      payload: {
        type: "info",
        id: id,
        name: name,
        size: size,
        totalParts: parts.length,
        sender: sender,
        mimeType: file.type,
      },
      info: info,
      notify: {
        "*": name,
      },
    };

    window.webxdc.sendUpdate(infoUpdate, '');

    let nextPart = 0;
    const interval = setInterval(() => {
      const update = partsUpdates[nextPart];
      ++nextPart;
      const number = update.payload.i + 1;
      const total = parts.length;
      window.webxdc.sendUpdate(update, '');
      if (number === total) {
        sendingFile = false;
        clearInterval(interval);
      }
    }, 1000);
  }
</script>

<main class="flex flex-col gap-2 mt-1.5">
  <div class="flex justify-between items-center max-w-xl">
    <div>
      <span><b>Part Size</b></span>
      <p>
        <small>File will be splitted in {selectedPartSize} MB parts.</small>
      </p>
    </div>
    <select
      class="select"
      bind:value={selectedPartSize}
      onchange={() => localStorage.setItem("partsize", selectedPartSize)}
    >
      <option value="0.3">0.3 MB</option>
      <option value="0.6">0.6 MB</option>
      <option value="1.5">1.5 MB</option>
      <option value="3">3 MB</option>
      <option value="6">6 MB</option>
      <option value="12">12 MB</option>
      <option value="24">24 MB</option>
    </select>
  </div>

  <div class="flex justify-between items-center max-w-xl">
    <div>
      <span><b>File</b></span>
      <p>
        <small>
          {#if selectedFile}
            {selectedFile.name}, {readableSize(selectedFile.size)}.
          {:else}
            Select the file to send.
          {/if}
        </small>
      </p>
    </div>
    <div>
      <button class="btn" onclick={selectFile}>
        {#if selectedFile}
          Change
        {:else}
          Select
        {/if}
      </button>
    </div>
  </div>

  <div>
    <button onclick={sendFile} class="btn btn-primary">Send File</button>
    {#if sendingFile}
      <Loader />
    {/if}
  </div>

  <hr />
</main>
