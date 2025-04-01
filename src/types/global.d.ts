export interface ImageData {
  data: Uint8Array;
  type: string;
}

export interface AudioMetadata {
  base64: string;
  name: string;
  artist: string;
  cover: Uint8Array | null;
  coverMimeType?: string;
}

declare global {
  interface Window {
    ipcRenderer: CustomIpcRenderer;
  }
}
