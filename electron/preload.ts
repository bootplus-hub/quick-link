import { ipcRenderer, contextBridge } from 'electron'
import { BookmarksChannel, FaviconChannel } from "./ipc";
import { ChromiumBookmarks } from '@/bookmarks';
import { ProviderData } from '@/bookmarks/provider';
import { IPCResponse } from '@/ipc';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // 여기 추가시, src/vite-env.d.ts 에 정의 추가
  // ...
  fetchEdgeBookmarks(): Promise<ChromiumBookmarks> {
    return ipcRenderer.invoke(BookmarksChannel.GET_EDGE);
  },
  fetchBookmarks(): Promise<ProviderData> {
    return ipcRenderer.invoke(BookmarksChannel.LOAD_BOOKMARKS);
  },
  dispatchBookmarks(data: ProviderData): Promise<IPCResponse> {
    return ipcRenderer.invoke(BookmarksChannel.SAVE_BOOKMARKS, data);
  },
  syncEdgeFavicons(): Promise<IPCResponse> {
    return ipcRenderer.invoke(FaviconChannel.SYNC_EDGE);
  },
})
