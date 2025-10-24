import type { ReceivedStatusUpdate } from "@webxdc/types";
import type { FileData, FileInfo, FilePart, FilesData } from "./types";
import localforage from "localforage";

export { filesData, viewerFileId };

let filesData: FilesData = $state({});
let viewerFileId: { id: string | null } = $state({ id: null });

window.webxdc.setUpdateListener(handleUpdate);
function handleUpdate(update: ReceivedStatusUpdate<FileInfo | FilePart>) {
  const id = update.payload.id;
  filesData[id] = filesData[id] || {};
  const fileData = filesData[id];

  if (update.payload.type === "info") {
    handleInfo(update.payload, fileData);
  } else if (update.payload.type === "part") {
    handlePart(update.payload, fileData, id);
  }
}

function handleInfo(payload: FileInfo, fileData: FileData) {
  fileData.name = payload.name;
  fileData.size = payload.size;
  fileData.sender = payload.sender;
  fileData.mimeType = payload.mimeType;
  fileData.totalParts = payload.totalParts;
}

async function handlePart(payload: FilePart, fileData: FileData, id: string) {
  fileData.parts = fileData.parts || {};
  const i = String(payload.i);
  fileData.parts[i] = "";
  fileData.receivedParts = Object.keys(fileData.parts).length;

  const db = localforage.createInstance({ name: id });
  if (!(await db.keys()).includes(i)) {
    try {
      await db.setItem(i, payload.part);
    } catch (err) {
      console.log(err);
      fileData.parts[i] = payload.part;
    }
  }

  if (payload.name) {
    fileData.name = payload.name;
    fileData.totalParts = payload.totalParts;
  }
}
