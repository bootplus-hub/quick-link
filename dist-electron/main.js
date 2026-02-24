import { ipcMain, app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import fs from "fs";
import path from "path";
var BookmarksChannel = /* @__PURE__ */ ((BookmarksChannel2) => {
  BookmarksChannel2["EDGE"] = "get-edge-bookmarks";
  BookmarksChannel2["CHROME"] = "get-chrome-bookmarks";
  return BookmarksChannel2;
})(BookmarksChannel || {});
async function getEdgeBookmarks() {
  const bookmarkPath = path.join(
    process.env.LOCALAPPDATA || "",
    "Microsoft/Edge/User Data/Default1/Bookmarks"
  );
  if (!fs.existsSync(bookmarkPath)) {
    throw "북마크 파일을 찾을 수 없습니다.";
  }
  const data = fs.readFileSync(bookmarkPath, "utf-8");
  const bookmarks = JSON.parse(data);
  return bookmarks;
}
function install() {
  ipcMain.handle(BookmarksChannel.EDGE, getEdgeBookmarks);
}
createRequire(import.meta.url);
const __dirname$1 = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#00000000",
      symbolColor: "#74b9ff"
    },
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.resolve(__dirname$1, "preload.mjs"),
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
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
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
