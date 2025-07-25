import localforage from "localforage";

export { blobToBase64, splitString, readableSize, toPercent, exportFileToChat };

/**
 *
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
async function blobToBase64(blob) {
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

/**
 *
 * @param {string} string
 * @param {number} partsize
 * @returns {Array<string>}
 */
function splitString(string, partsize) {
  const length = string.length;
  const totalparts = Math.ceil(length / partsize);
  let parts = [];
  for (let i = 0; i < totalparts; i++) {
    const start = i * partsize;
    const end = start + partsize;
    const part = string.substring(start, end);
    parts.push(part);
  }
  return parts;
}

/**
 *
 * @param {number} size
 * @returns {string}
 */
function readableSize(size) {
  let i = Math.floor(Math.log(size) / Math.log(1000));
  if (size === 0) i = 0;
  return (
    +(size / Math.pow(1000, i)).toFixed(2) * 1 +
    " " +
    ["B", "KB", "MB", "GB"][i]
  );
}

/**
 *
 * @param {number} part
 * @param {number} total
 * @returns {number}
 */
const toPercent = (part, total) => (part / total) * 100;

/**
 * Universal function to export a file to chat
 * @param {string} fileId - The ID of the file
 * @param {Object} fileData - File data containing name, totalParts, and parts
 * @param {string} fileData.name - The name of the file
 * @param {number} fileData.totalParts - Total number of parts expected
 * @param {Object} fileData.parts - Object containing file parts (optional, for memory fallback)
 * @returns {Promise<void>}
 */
async function exportFileToChat(fileId, fileData) {
  let parts = { length: 0 };

  const db = localforage.createInstance({ name: fileId });
  await db.iterate((val, i) => {
    parts[i] = val;
    ++parts.length;
  });

  if (parts.length !== fileData.totalParts && fileData.parts) {
    Object.entries(fileData.parts).forEach(([i, val]) => {
      if (val) {
        parts[i] = val;
        ++parts.length;
      }
    });
  }

  if (parts.length !== fileData.totalParts) {
    throw new Error(`Missing file parts. Expected ${fileData.totalParts}, got ${parts.length}`);
  }

  await window.webxdc.sendToChat({
    file: {
      name: fileData.name,
      base64: Array.from(parts).join(""),
    },
  });
}
