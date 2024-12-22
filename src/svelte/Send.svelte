<script>
  import { splitString, readableSize, blobToBase64 } from "../js/utils.js";
  import Loader from "./Loader.svelte";

  let selectedPartSize = $state(localStorage.getItem("partsize") || "6");
  let selectedFile = $state(null);
  let sendingFile = $state(false);

  async function selectFile() {
    selectedFile = (await window.webxdc.importFiles({}))[0];
  }

  async function sendFile() {
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
      let update = {
        payload: {
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
    const infoUpdate = {
      payload: {
        type: "info",
        id: id,
        name: name,
        size: size,
        totalParts: parts.length,
        sender: sender,
      },
      info: info,
      notify: {
        "*": name,
      },
    };

    window.webxdc.sendUpdate(infoUpdate, info);

    let nextPart = 0;
    const interval = setInterval(() => {
      const update = partsUpdates[nextPart];
      ++nextPart;
      const number = update.payload.i + 1;
      const total = parts.length;
      window.webxdc.sendUpdate(update, `${number}/${total}, ${name}`);
      if (number === total) {
        sendingFile = false;
        clearInterval(interval);
      }
    }, 1000);
  }
</script>

<main>
  <div class="options">
    <div class="option">
      <div>
        <span><b>Part Size</b></span>
        <p><small>File will be splitted in {selectedPartSize} MB parts.</small></p>
      </div>
      <select
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

    <div class="option">
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
        <button onclick={selectFile}>
          {#if selectedFile}
            Change
          {:else}
            Select
          {/if}
        </button>
      </div>
    </div>
  </div>

  <div>
    <button onclick={sendFile} class="sendBtn">Send File</button>
    {#if sendingFile}
      <Loader />
    {/if}
  </div>

  <hr />
</main>

<style>
  main {
    margin-top: 5px;
  }

  .options {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
    row-gap: 5px;
  }

  @media (min-width: 400px) {
    .options {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .option {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
  }

  .option p {
    margin: 0;
    color: gray;
  }

  .sendBtn {
    margin-top: 10px;
    color: white;
    background-color: rgb(100, 149, 237);
  }

  .sendBtn:hover {
    background-color: rgb(73, 121, 211);
  }

  .sendBtn:active {
    background-color: rgb(67, 104, 172);
  }

  button,
  select {
    background-color: #eee;
  }

  button:hover,
  select:hover {
    background-color: #ddd;
  }

  button:active,
  select:active {
    background-color: #ccc;
  }

  @media (prefers-color-scheme: dark) {
    button,
    select {
      background-color: #333;
    }
    button:hover,
    select:hover {
      background-color: #444;
    }

    button:active,
    select:active {
      background-color: #555;
    }
  }
</style>
