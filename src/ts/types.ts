export interface FileInfo {
  type: "info",
  id: string,
  name: string,
  totalParts: number,
  size: number,
  sender: string,
}

export interface FilePart {
  type: "part",
  id: string,
  name?: string,
  totalParts?: number,
  i: number,
  part: string,
}

export interface FileData {
  name?: string,
  size?: number,
  sender?: string,
  totalParts?: number,
  parts?: {
    [index: string]: string
  },
  receivedParts?: number,
}

export interface FilesData {
  [id: string]: FileData,
}