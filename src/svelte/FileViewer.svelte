<script lang="ts">
  import localforage from "localforage";
  import { readableSize, exportFileToChat } from "../ts/utils";
  import type { Parts } from "../ts/types";
  import { filesData as allFiles, viewerFileId } from "../ts/state.svelte";
  import { XIcon } from "@lucide/svelte";

  let fileUrl: string | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);
  let currentFileId = $state(viewerFileId.id);
  let currentFileData = $derived(allFiles[currentFileId!] || {});
  let currentFileType = $derived(currentFileData.mimeType?.split("/")[0]);
  let showNavigationHint = $state(false);

  const completeFiles = $derived(
    Object.entries(allFiles)
      .filter(([_, fileData]) => fileData.receivedParts === fileData.totalParts)
      .map(([fileId, fileData]) => ({ id: fileId, data: fileData }))
  );

  const currentIndex = $derived(
    completeFiles.findIndex((file) => file.id === currentFileId)
  );
  const canNavigatePrev = $derived(currentIndex > 0);
  const canNavigateNext = $derived(currentIndex < completeFiles.length - 1);
  const isCurrentFileComplete = $derived(
    currentFileData.receivedParts === currentFileData.totalParts
  );

  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (event.changedTouches.length === 1) {
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      const deltaY = Math.abs(event.changedTouches[0].clientY - touchStartY);

      // Only trigger swipe if horizontal movement is significant and vertical is minimal
      if (Math.abs(deltaX) > 50 && deltaY < 100) {
        if (deltaX > 0 && canNavigatePrev) {
          navigateToPrev();
        } else if (deltaX < 0 && canNavigateNext) {
          navigateToNext();
        }
      }
    }
  }

  function handleContentClick(event: MouseEvent) {
    // Don't navigate if user clicked on controls or interactive elements
    if (
      (event.target! as HTMLDivElement).closest(
        "button, video, audio, iframe, .viewer-header, .nav-arrow"
      )
    ) {
      return;
    }

    if (!isCurrentFileComplete) {
      return;
    }

    const rect = (
      event.currentTarget! as HTMLButtonElement
    ).getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;

    // Define click zones: left 30%, right 30%
    const leftZone = width * 0.3;
    const rightZone = width * 0.7;

    if (clickX < leftZone && canNavigatePrev) {
      navigateToPrev();
    } else if (clickX > rightZone && canNavigateNext) {
      navigateToNext();
    }
  }

  function navigateToPrev() {
    if (canNavigatePrev) {
      const prevFile = completeFiles[currentIndex - 1];
      switchToFile(prevFile.id);
    }
  }

  function navigateToNext() {
    if (canNavigateNext) {
      const nextFile = completeFiles[currentIndex + 1];
      switchToFile(nextFile.id);
    }
  }

  function switchToFile(newId: string) {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      fileUrl = null;
    }

    currentFileId = newId;
    loadFile();
  }

  async function loadFile() {
    try {
      loading = true;
      error = null;

      if (currentFileData.receivedParts !== currentFileData.totalParts) {
        loading = false;
        return;
      }

      let parts: Parts = {
        length: 0,
      };

      const db = localforage.createInstance({ name: currentFileId! });
      await db.iterate((val: string, i: string) => {
        parts[Number(i)] = val;
        parts.length++;
      });

      if (
        parts.length !== currentFileData.totalParts &&
        currentFileData.parts
      ) {
        Object.entries(currentFileData.parts).forEach(([i, val]) => {
          if (!parts.hasOwnProperty(i) && val && val !== "") {
            parts[Number(i)] = val;
            parts.length++;
          }
        });
      }

      if (parts.length !== currentFileData.totalParts) {
        error = `Could not load all file parts. Found ${parts.length} of ${currentFileData.totalParts} parts.`;
        loading = false;
        return;
      }

      const partsArray = [];
      for (let i = 0; i < currentFileData.totalParts; i++) {
        if (parts.hasOwnProperty(i) && parts[i]) {
          partsArray[i] = parts[i];
        } else if (parts.hasOwnProperty(i) && parts[i]) {
          partsArray[i] = parts[i];
        } else {
          error = `Missing part ${i} of file`;
          loading = false;
          return;
        }
      }

      const base64Data = partsArray.join("");

      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: currentFileData.mimeType });
      fileUrl = URL.createObjectURL(blob);
      loading = false;
    } catch (err: any) {
      console.error("Error loading file:", err);
      error = "Failed to load file: " + err.message;
      loading = false;
    }
  }

  async function downloadFile() {
    try {
      if (currentFileData.receivedParts !== currentFileData.totalParts) {
        alert(
          `File is still downloading. ${currentFileData.receivedParts || 0} of ${currentFileData.totalParts} parts received.`
        );
        return;
      }

      await exportFileToChat(currentFileId!, currentFileData);
    } catch (err: any) {
      console.error("Error downloading file:", err);
      alert("Failed to download file: " + err.message);
    }
  }

  function handleClose() {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    viewerFileId.id = null;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      handleClose();
    } else if (event.key === "ArrowLeft" && canNavigatePrev) {
      event.preventDefault();
      navigateToPrev();
    } else if (event.key === "ArrowRight" && canNavigateNext) {
      event.preventDefault();
      navigateToNext();
    }
  }

  function handleContentKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      //@ts-ignore
      handleContentClick(event);
    }
  }

  loadFile();

  $effect(() => {
    if (
      !fileUrl &&
      !loading &&
      !error &&
      currentFileData.receivedParts === currentFileData.totalParts
    ) {
      // localforage does not support reactivity so need to wait till `Receive.svelte` saves data
      // in localforage. could be fixed by using implementing svelte stores wrapper over localforage
      setTimeout(() => {
        loadFile();
      }, 1000);
    }
  });

  $effect(() => {
    if (completeFiles.length > 1) {
      showNavigationHint = true;
      setTimeout(() => {
        showNavigationHint = false;
      }, 3000);
    }
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<div
  class="viewer-overlay"
  ontouchstart={handleTouchStart}
  ontouchend={handleTouchEnd}>
  {#if canNavigatePrev && isCurrentFileComplete}
    <button
      class="nav-arrow nav-prev"
      onclick={navigateToPrev}
      aria-label="Previous file">
      ‹
    </button>
  {/if}

  {#if canNavigateNext && isCurrentFileComplete}
    <button
      class="nav-arrow nav-next"
      onclick={navigateToNext}
      aria-label="Next file">
      ›
    </button>
  {/if}

  <div class="viewer-header">
    <div class="file-info">
      <h3>{currentFileData.name || "Unknown file"}</h3>
      <p>
        {currentFileData.sender ? `From: ${currentFileData.sender}` : ""}
        {currentFileData.size ? ` • ${readableSize(currentFileData.size)}` : ""}
        {completeFiles.length > 1
          ? ` • ${currentIndex + 1} of ${completeFiles.length}`
          : ""}
      </p>
    </div>
    <div class="actions">
      {#if isCurrentFileComplete}
        <button onclick={downloadFile} class="download-btn">Download</button>
      {:else}
        <button disabled class="download-btn disabled">Downloading...</button>
      {/if}
      <button onclick={handleClose} class="close-btn">
        <XIcon />
      </button>
    </div>
  </div>

  {#if showNavigationHint && completeFiles.length > 1 && isCurrentFileComplete}
    <div class="navigation-hint">
      <p>
        💡 Click left or right side to navigate • Use arrow keys • Swipe on
        mobile
      </p>
    </div>
  {/if}

  <div
    class="viewer-content"
    onclick={handleContentClick}
    onkeydown={handleContentKeydown}
    role="button"
    tabindex="0"
    aria-label="File viewer - click left or right side to navigate">
    {#if loading}
      <div class="status-message">
        <div class="loading-spinner"></div>
        <p>Loading file...</p>
      </div>
    {:else if currentFileData.receivedParts !== currentFileData.totalParts}
      <div class="status-message">
        <h3>Downloading file...</h3>
        <p>
          {currentFileData.receivedParts || 0} of {currentFileData.totalParts} parts
          received
          {#if currentFileData.size}
            <br /><small>({readableSize(currentFileData.size)})</small>
          {/if}
        </p>
        <p class="download-hint">
          The file will load automatically when download completes
        </p>
      </div>
    {:else if error}
      <div class="status-message error">
        <div class="error-icon">⚠</div>
        <h3>Cannot display file</h3>
        <p>{error}</p>
        <button onclick={downloadFile} class="download-btn"
          >Download instead</button>
      </div>
    {:else if fileUrl}
      {#if currentFileType === "image"}
        <img src={fileUrl} alt={currentFileData.name} />
      {:else if currentFileType === "video"}
        <video src={fileUrl} controls>
          <track kind="captions" />
          Your browser does not support the video tag.
        </video>
      {:else if currentFileType === "audio"}
        <div class="audio-container">
          <div class="audio-info">
            <h4>{currentFileData.name}</h4>
            <p>
              {currentFileData.sender ? `From: ${currentFileData.sender}` : ""}
            </p>
          </div>
          <audio src={fileUrl} controls>
            Your browser does not support the audio tag.
          </audio>
        </div>
      {:else}
        <div class="status-message">
          <div class="unsupported-icon">📄</div>
          <h3>File type not supported</h3>
          <p>This file cannot be previewed in the browser.</p>
          <p class="file-details">
            <strong>{currentFileData.name}</strong><br />
            {currentFileData.size
              ? readableSize(currentFileData.size)
              : "Unknown size"}
          </p>
          <button onclick={downloadFile} class="download-btn"
            >Download file</button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .viewer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #000;
    display: flex;
    flex-direction: column;
    user-select: none;
    touch-action: pan-y;
  }

  .viewer-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      transparent 100%
    );
    color: white;
    z-index: 1001;
  }

  .navigation-hint {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    font-size: 14px;
    z-index: 1002;
    animation: fadeInOut 3s ease-in-out;
    pointer-events: none;
  }

  .navigation-hint p {
    margin: 0;
    text-align: center;
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
    10% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    90% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
  }

  .file-info h3 {
    margin: 0 0 5px 0;
    font-size: 16px;
    font-weight: 600;
    word-break: break-all;
    color: white;
  }

  .file-info p {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  .actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .download-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    backdrop-filter: blur(10px);
    transition: all 0.2s ease;
  }

  .download-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .download-btn.disabled {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
  }

  .download-btn.disabled:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    width: 36px;
    height: 36px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    transition: all 0.2s ease;
    z-index: 1001;
  }

  .nav-arrow:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-50%) scale(1.1);
  }

  .nav-prev {
    left: 20px;
  }

  .nav-next {
    right: 20px;
  }

  .viewer-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 20px 20px;
    overflow: hidden;
    position: relative;
  }

  .viewer-content img,
  .viewer-content video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 1001;
  }

  .viewer-content iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
    background: white;
    position: relative;
    z-index: 1001;
  }

  .audio-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    z-index: 1001;
  }

  .audio-info {
    text-align: center;
    color: white;
  }

  .audio-info h4 {
    margin: 0 0 10px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .audio-info p {
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
  }

  .audio-container audio {
    width: 100%;
    max-width: 400px;
  }

  .status-message {
    text-align: center;
    padding: 40px;
    color: white;
    max-width: 400px;
    position: relative;
    z-index: 1001;
  }

  .status-message h3 {
    margin: 0 0 15px 0;
    font-size: 20px;
    font-weight: 600;
  }

  .status-message p {
    margin: 0 0 20px 0;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
  }

  .download-hint {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    margin-top: 10px;
  }

  .file-details {
    background: rgba(255, 255, 255, 0.1);
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
    font-size: 14px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  .error-icon,
  .unsupported-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }

  .error {
    color: #ff6b6b;
  }

  .error .error-icon {
    color: #ff6b6b;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .viewer-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
      padding: 10px 15px;
    }

    .actions {
      align-self: flex-end;
    }

    .nav-arrow {
      width: 40px;
      height: 40px;
      font-size: 20px;
    }

    .nav-prev {
      left: 10px;
    }

    .nav-next {
      right: 10px;
    }

    .viewer-content {
      padding: 100px 10px 10px;
    }

    .audio-container {
      padding: 20px;
      margin: 0 10px;
    }

    .navigation-hint {
      top: 120px;
      left: 10px;
      right: 10px;
      transform: none;
      font-size: 12px;
      padding: 8px 15px;
    }
  }

  @media (max-width: 480px) {
    .file-info h3 {
      font-size: 14px;
    }

    .file-info p {
      font-size: 12px;
    }

    .download-btn,
    .close-btn {
      padding: 6px 12px;
      font-size: 12px;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      font-size: 16px;
    }
  }
</style>
