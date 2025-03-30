import { app, BrowserWindow, dialog } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { setupFileHandling } from "./Modules/fileHandling";
import { setupDialogHandler } from "./Modules/handleTesting";
import { openFile } from "./Utils/openFile";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let win: BrowserWindow | null;

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

  setupFileHandling(win);
  setupDialogHandler(win);
  return win;
}

app.whenReady().then(() => {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    const mainWindow = createWindow(); // Asumiendo que `createWindow()` retorna la ventana creada

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

    // Manejar el intento de abrir una segunda instancia
    app.on("second-instance", (_, argv) => {
      // Filtrar los parámetros buscando una ruta de archivo
      const filePath = argv.find(
        (arg) => path.extname(arg).toLowerCase() === ".mp3"
      ); // Cambia a otros tipos si es necesario

      if (filePath) {
        // Mostrar el mensaje con la ruta del archivo
        dialog.showMessageBox({
          type: "info",
          title: "Segunda instancia",
          message: `La segunda instancia intentó abrir el archivo: ${filePath}`,
        });

        // Llamar a la función openFile con la ruta del archivo y la ventana principal
        openFile(filePath, mainWindow);
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
