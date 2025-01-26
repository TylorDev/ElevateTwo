import { app as n, BrowserWindow as d } from "electron";
import { fileURLToPath as u } from "node:url";
import o from "node:path";
import f from "node:fs";
const m = o.dirname(u(import.meta.url));
function c() {
  e = new d({
    icon: o.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: o.join(m, "preload.mjs"),
      autoplayPolicy: "no-user-gesture-required"
    }
  }), a ? e.loadURL(a) : e.loadFile(o.join(h, "index.html")), e.webContents.on("did-finish-load", () => {
    s && (_(s), s = null);
  });
}
function _(i) {
  f.readFile(i, { encoding: "base64" }, (t, r) => {
    if (t) {
      console.error("Error al leer el archivo:", t);
      return;
    }
    e == null || e.webContents.send("open-file", r);
  });
}
let e, s = null;
if (process.argv.length > 1) {
  const i = process.argv[process.argv.length - 1];
  f.existsSync(i) && (s = i);
}
n.whenReady().then(() => {
  n.requestSingleInstanceLock() ? (n.on("second-instance", (t, r) => {
    const l = r.find(
      (p) => p.endsWith(".mp3") || p.endsWith(".wav")
    );
    l && (e ? (e.isMinimized() && e.restore(), e.focus(), _(l)) : (s = l, c()));
  }), c(), n.on("activate", () => {
    d.getAllWindows().length === 0 && c();
  })) : n.quit();
});
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), e = null);
});
process.env.APP_ROOT = o.join(m, "..");
const a = process.env.VITE_DEV_SERVER_URL, g = o.join(process.env.APP_ROOT, "dist-electron"), h = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = a ? o.join(process.env.APP_ROOT, "public") : h;
export {
  g as MAIN_DIST,
  h as RENDERER_DIST,
  a as VITE_DEV_SERVER_URL
};
