import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

  win.webContents.on("did-finish-load", () => {
    if (ArgFilePath) {
      openFile(ArgFilePath); // Función para enviar el archivo al renderizado
      ArgFilePath = null; // Limpiar después de usarlo
    }
  });
}

function openFile(filePath: string) {
  fs.readFile(filePath, { encoding: "base64" }, (err, data) => {
    if (err) {
      console.error("Error al leer el archivo:", err);
      return;
    }
    win?.webContents.send("open-file", data); // Enviar el archivo al renderizado
  });
}

let win: BrowserWindow | null;
let ArgFilePath: string | null = null;

// Manejar archivos pasados como argumentos
if (process.argv.length > 1) {
  const potentialFile = process.argv[process.argv.length - 1];
  if (fs.existsSync(potentialFile)) {
    ArgFilePath = potentialFile;
  }
}

app.whenReady().then(() => {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on("second-instance", (_, commandLine) => {
      const filePath = commandLine.find(
        (arg) => arg.endsWith(".mp3") || arg.endsWith(".wav")
      );
      if (filePath) {
        if (win) {
          // Enfocar la ventana y enviar el archivo
          if (win.isMinimized()) win.restore();
          win.focus();
          openFile(filePath);
        } else {
          ArgFilePath = filePath;
          createWindow();
        }
      }
    });

    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

process.env.APP_ROOT = path.join(__dirname, "..");
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;
