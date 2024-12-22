export { blobToBase64, splitString, readableSize, toPercent };

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
