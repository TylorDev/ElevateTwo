// fileHandling.ts
import { BrowserWindow } from "electron";
import * as fs from "fs";
import { openFile } from "../Utils/openFile";

let ArgFilePath: string | null = null;

export function setupFileHandling(win: BrowserWindow) {
  // Manejar archivos pasados como argumentos
  if (process.argv.length > 1) {
    const potentialFile = process.argv[process.argv.length - 1];
    if (fs.existsSync(potentialFile)) {
      ArgFilePath = potentialFile;
    }
  }

  win.webContents.on("did-finish-load", () => {
    if (ArgFilePath) {
      openFile(ArgFilePath, win);
      ArgFilePath = null; // Limpiar después de usarlo
    }
  });
}
