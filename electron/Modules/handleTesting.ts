import { BrowserWindow, ipcMain, dialog } from "electron";
import * as fs from "fs";
import { parseFile } from "music-metadata";
import { AudioMetadata } from "../electron-env.d.ts";

export function setupDialogHandler(browserWindow: BrowserWindow) {
  ipcMain.handle("dialog:openFile", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(browserWindow, {
      title: "Seleccionar archivo MP3",
      filters: [{ name: "Audio Files", extensions: ["mp3"] }],
      properties: ["openFile"],
    });

    if (!canceled && filePaths.length > 0) {
      const filePath = filePaths[0];
      return readAudioFile(filePath);
    }
    return null;
  });
}

export async function readAudioFile(
  filePath: string
): Promise<AudioMetadata | null> {
  try {
    // Leer el archivo como base64
    const base64 = fs.readFileSync(filePath, { encoding: "base64" });

    // Extraer metadata
    const metadata = await parseFile(filePath);
    const name = metadata.common.title ?? "Desconocido";
    const artist = metadata.common.artist ?? "Desconocido";
    const cover = metadata.common.picture?.[0];

    // Procesar cover art si existe
    const coverData = cover ? new Uint8Array(cover.data) : null;
    const coverMimeType = cover?.format;

    return {
      base64,
      name,
      artist,
      cover: coverData,
      coverMimeType,
    };
  } catch (err) {
    console.error("Error al leer el archivo:", err);
    return null;
  }
}
