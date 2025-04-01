import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { setupDialogHandler } from "./Modules/handleTesting";
import * as fs from "fs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let win: BrowserWindow | null;
const DEFAULT_FILE_PATH = "D:\\My Way.mp3";

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      autoplayPolicy: "no-user-gesture-required",
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  setupDialogHandler(win);
  return win;
}

app.whenReady().then(() => {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    const mainWindow = createWindow(); // Asumiendo que `createWindow()` retorna la ventana creada
    app.on("second-instance", (_event, commandLine) => {
      // Extraer el archivo del segundo argumento (ignorando el ejecutable)
      const newFilePath = commandLine
        .slice(1)
        .find((arg) => fs.existsSync(arg) && arg.endsWith(".mp3"));

      if (newFilePath && mainWindow) {
        mainWindow.webContents.send("file-selected", newFilePath);
        mainWindow.focus(); // Traer la ventana al frente
      }
    });
    // Capturar argumentos pasados
    const args = process.argv.slice(1); // Ignorar el primer argumento (ejecutable)
    let filePath = args.find(
      (arg) => fs.existsSync(arg) && arg.endsWith(".mp3")
    );

    // Si no hay argumento válido, usar el archivo predeterminado
    if (!filePath && fs.existsSync(DEFAULT_FILE_PATH)) {
      filePath = DEFAULT_FILE_PATH;
    }
    if (filePath) {
      mainWindow.webContents.once("did-finish-load", () => {
        mainWindow?.webContents.send("file-selected", filePath);
      });
    }

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  }
});

process.env.APP_ROOT = path.join(__dirname, "..");
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;
