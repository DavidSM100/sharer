<script>
  import FileCard from "./FileCard.svelte";
  import localforage from "localforage";

  let filesData = $state({});

  window.webxdc.setUpdateListener(async (update) => {
    const id = update.payload.id;
    filesData[id] = filesData[id] || {};
    const fileData = filesData[id];

    if (update.payload.type === "info") {
      fileData.name = update.payload.name;
      fileData.size = update.payload.size;
      fileData.sender = update.payload.sender;
      fileData.totalParts = update.payload.totalParts;
    } else {
      fileData.parts = fileData.parts || {};
      const i = String(update.payload.i);
      fileData.parts[i] = "";
      fileData.receivedParts = Object.keys(fileData.parts).length;

      const db = localforage.createInstance({ name: id });
      if (!(await db.keys()).includes(i)) {
        try {
          await db.setItem(i, update.payload.part);
        } catch (err) {
          console.log(err);
          fileData.parts[i] = update.payload.part;
        }
      }

      if (update.payload.name) {
        fileData.name = update.payload.name;
        fileData.totalParts = update.payload.totalParts;
      }

    }
  });
</script>

<main>
  {#each Object.entries(filesData) as [id, data]}
    <FileCard {id} {data} />
  {/each}
</main>
