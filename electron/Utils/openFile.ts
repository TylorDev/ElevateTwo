import { BrowserWindow } from "electron";
import * as fs from "fs";

export async function openFile(filePath: string, win?: BrowserWindow) {
  try {
    const data = await fs.promises.readFile(filePath, { encoding: "base64" });
    win?.webContents.send("open-file", data); // Enviar el archivo al renderizado
  } catch (err) {
    console.error("Error al leer el archivo:", err);
  }
}
