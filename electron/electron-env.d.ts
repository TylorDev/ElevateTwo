/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string;
    VITE_PUBLIC: string;
  }
}

interface CustomIpcRenderer {
  // Métodos estándar de IpcRenderer
  on: (...args: Parameters<Electron.IpcRenderer["on"]>) => Electron.IpcRenderer;
  off: (
    ...args: Parameters<Electron.IpcRenderer["off"]>
  ) => Electron.IpcRenderer;
  send: (...args: Parameters<Electron.IpcRenderer["send"]>) => void;
  invoke: <T = any>(
    ...args: Parameters<Electron.IpcRenderer["invoke"]>
  ) => Promise<T>;

  // Métodos personalizados
  onFileOpen: (callback: (filePath: string) => void) => void;
  offFileOpen: () => void;
}

// Usa la interfaz extendida en el objeto `window`
declare global {
  interface Window {
    ipcRenderer: CustomIpcRenderer;
  }
}
