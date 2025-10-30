<script lang="ts">
  import { getFileBase64 } from "../ts/utils";
  import { filesData, viewerFileId } from "../ts/state.svelte";
  import { XIcon } from "@lucide/svelte";

  let fileUrl: string | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);
  let currentFileId = $state(viewerFileId.id);
  let currentFileData = $derived(filesData[currentFileId!]);
  let currentFileType = $derived(currentFileData.mimeType?.split("/")[0]);
  let hideHeader = $state(false);

  async function loadFile() {
    try {
      loading = true;
      error = null;

      const base64Data = await getFileBase64(currentFileId!, currentFileData);
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: currentFileData.mimeType });
      fileUrl = URL.createObjectURL(blob);
    } catch (err: any) {
      error = "Failed to load file: " + err.message;
    } finally {
      loading = false;
    }
  }

  function handleClose() {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    viewerFileId.id = null;
  }

  loadFile();
</script>

<div class="h-screen w-screen">
  <div
    class="bg-base-200 fixed top-0 left-0 z-10 w-full p-1"
    hidden={hideHeader}>
    <div class="flex items-center justify-between">
      <small>{currentFileData.name || "Unknown file"}</small>
      <button onclick={handleClose} class="btn btn-square btn-soft">
        <XIcon />
      </button>
    </div>
  </div>

  <div class="flex h-full w-full items-center justify-center">
    {#if loading}
      <div class="loading loading-xl"></div>
    {:else if error}
      <p>{error}</p>
    {:else if fileUrl}
      {#if currentFileType === "image"}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <img
          src={fileUrl}
          alt={currentFileData.name}
          class="max-h-full max-w-full object-contain"
          onclick={() => (hideHeader = !hideHeader)} />
      {:else if currentFileType === "video"}
        <!-- svelte-ignore a11y_media_has_caption -->
        <!-- svelte-ignore a11y_autofocus -->
        <video
          autofocus
          onpause={() => (hideHeader = false)}
          onplay={() => (hideHeader = true)}
          src={fileUrl}
          controls
          class="h-full max-h-full w-full max-w-full">
          Your browser does not support the video tag.
        </video>
      {:else if currentFileType === "audio"}
        <!-- svelte-ignore a11y_autofocus -->
        <audio autofocus src={fileUrl} controls class="w-full p-2">
          Your browser does not support the audio tag.
        </audio>
      {/if}
    {/if}
  </div>
</div>
