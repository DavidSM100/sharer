import localforage from "localforage";
import type { FileData, Parts } from "./types";

export { blobToBase64, splitString, readableSize, toPercent, exportFileToChat };

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      if (typeof reader.result === "string")
        resolve(reader.result.split(",")[1]);
    };
    reader.onerror = (err) => {
      console.log(err);
      alert(err);
      reject(err);
    };
  });
}

function splitString(string: string, partsize: number): string[] {
  const length = string.length;
  const totalparts = Math.ceil(length / partsize);
  let parts: string[] = [];
  for (let i = 0; i < totalparts; i++) {
    const start = i * partsize;
    const end = start + partsize;
    const part = string.substring(start, end);
    parts.push(part);
  }
  return parts;
}

function readableSize(size: number): string {
  let i = Math.floor(Math.log(size) / Math.log(1000));
  if (size === 0) i = 0;
  return (
    +(size / Math.pow(1000, i)).toFixed(2) * 1 +
    " " +
    ["B", "KB", "MB", "GB"][i]
  );
}

const toPercent = (part: number, total: number) => (part / total) * 100;

async function exportFileToChat(fileId: string, fileData: FileData) {
  let parts: Parts = { length: 0 };

  const db = localforage.createInstance({ name: fileId });
  await db.iterate((val: string, i: string) => {
    parts[Number(i)] = val;
    ++parts.length;
  });

  if (parts.length !== fileData.totalParts && fileData.parts) {
    Object.entries(fileData.parts).forEach(([i, val]) => {
      if (val) {
        parts[Number(i)] = val;
        ++parts.length;
      }
    });
  }

  if (parts.length !== fileData.totalParts) {
    throw new Error(
      `Missing file parts. Expected ${fileData.totalParts}, got ${parts.length}`
    );
  }

  await window.webxdc.sendToChat({
    file: {
      name: fileData.name!,
      base64: Array.from(parts).join(""),
    },
  });
}
