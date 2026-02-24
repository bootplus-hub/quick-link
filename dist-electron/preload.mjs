"use strict";
const electron = require("electron");
var BookmarksChannel = /* @__PURE__ */ ((BookmarksChannel2) => {
  BookmarksChannel2["EDGE"] = "get-edge-bookmarks";
  BookmarksChannel2["CHROME"] = "get-chrome-bookmarks";
  return BookmarksChannel2;
})(BookmarksChannel || {});
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  // You can expose other APTs you need here.
  // ...
  fetchEdgeBookmarks() {
    return electron.ipcRenderer.invoke(BookmarksChannel.EDGE);
  }
});
