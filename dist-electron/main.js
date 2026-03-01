import { ipcMain, app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
var BookmarksChannel = /* @__PURE__ */ ((BookmarksChannel2) => {
  BookmarksChannel2["EDGE"] = "get-edge-bookmarks";
  BookmarksChannel2["CHROME"] = "get-chrome-bookmarks";
  return BookmarksChannel2;
})(BookmarksChannel || {});
async function getEdgeBookmarks() {
  const bookmarkPath = path.join(
    process.env.LOCALAPPDATA || "",
    "Microsoft/Edge/User Data/Default/Bookmarks"
  );
  try {
    const data = await fs.readFile(bookmarkPath, "utf-8");
    const bookmarks = JSON.parse(data);
    return bookmarks;
  } catch (err) {
    throw "북마크 파일을 가져올 수 없습니다.";
  }
}
function install() {
  ipcMain.handle(BookmarksChannel.EDGE, getEdgeBookmarks);
}
createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#00000000",
      symbolColor: "#74b9ff"
    },
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.resolve(__dirname$1, "preload.mjs"),
      nodeIntegration: false,
      // 보안을 위해 false 권장
      contextIsolation: true
      // contextBridge를 쓰려면 true여야 함
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  install();
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
//# sourceMappingURL=main.js.map
