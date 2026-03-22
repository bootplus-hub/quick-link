import { ipcMain, app, dialog } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import _ from "lodash";
import { ChannelBookmarks } from "../ipc";
import type { IPCResponse } from "@/ipc";
import type { ProviderData } from "@/bookmarks/provider";

async function getBookmarks (path: string): Promise<IPCResponse> {
  try {
    // 2. 파일 읽기 (UTF-8 인코딩)
    const data = await fs.readFile(path, 'utf-8');
    // 3. JSON 파싱
    const bookmarks = JSON.parse(data);
    // 4. 파싱된 데이터 반환
    return { success: true, data: bookmarks };
  } catch (err) {
    console.error('getBookmarks', err);
    return { success: false, error: '북마크 파일을 가져올 수 없습니다.' };
  }
}

/**
 * Microsoft Edge 북마크를 읽어서 JSON 객체로 반환하는 함수
 */
async function getEdgeBookmarks (_event:Electron.IpcMainInvokeEvent) {
  const bookmarkPath = path.join(
    process.env.LOCALAPPDATA || '',
    'Microsoft/Edge/User Data/Default/Bookmarks'
  );

  return getBookmarks(bookmarkPath);
};

/**
 * Google Chrome 북마크를 읽어서 JSON 객체로 반환하는 함수
 */
async function getChromeBookmarks (_event:Electron.IpcMainInvokeEvent) {
  const bookmarkPath = path.join(
    process.env.LOCALAPPDATA || '',
    'Google/Chrome/User Data/Default/Bookmarks'
  );

  return getBookmarks(bookmarkPath);
};

const STORE_PATH = path.join(app.getPath('userData'), 'bookmarks.json');

async function loadBookmarks (_event:Electron.IpcMainInvokeEvent): Promise<ProviderData> {
  try {
    console.log('loadBookmarks', STORE_PATH);
    const json = await fs.readFile(STORE_PATH, 'utf-8');
    const data: ProviderData = JSON.parse(json);
    return data;
  } catch (err) {
    return {};
  }
};

async function saveBookmarks (_event:Electron.IpcMainInvokeEvent, data: any): Promise<IPCResponse> {
  try {
    console.log('saveBookmarks', STORE_PATH);
    const json = JSON.stringify(data);
    await fs.writeFile(STORE_PATH, json, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

async function exportBookmarks (_event:Electron.IpcMainInvokeEvent, data: any): Promise<IPCResponse> {
  try {
    const result = await dialog.showSaveDialog({
      title: '내보내기',
      defaultPath: path.join(app.getPath('desktop'), 'bookmarks.json'),
      filters: [{ name: 'Bookmark Files', extensions: ['json'] }]
    });
    if (!result.canceled) {
      const json = JSON.stringify(data);
      await fs.writeFile(result.filePath, json, 'utf-8');
    }
    return { success: true, canceled: result.canceled };
  } catch (error) {
    return { success: false, error };
  }
}

async function importBookmarks (_event:Electron.IpcMainInvokeEvent): Promise<IPCResponse> {
  try {
    const result = await dialog.showOpenDialog({
      title: '가져오기',
      defaultPath: app.getPath('desktop'),
      filters: [{ name: 'Bookmark Files', extensions: ['json'] }],
      properties: ['openFile']
    });
    if (result.canceled) return { success: true, canceled: result.canceled };
    const json = await fs.readFile(result.filePaths[0], 'utf-8');
    return { success: true, canceled: result.canceled, data: JSON.parse(json) as ProviderData };
  } catch (error) {
    return { success: false, error };
  }
}

export default function install () {
  ipcMain.handle(ChannelBookmarks.GET_EDGE, getEdgeBookmarks);
  ipcMain.handle(ChannelBookmarks.GET_CHROME, getChromeBookmarks);
  ipcMain.handle(ChannelBookmarks.LOAD_BOOKMARKS, loadBookmarks);
  ipcMain.handle(ChannelBookmarks.SAVE_BOOKMARKS, saveBookmarks);
  ipcMain.handle(ChannelBookmarks.EXPORT_BOOKMARKS, exportBookmarks);
  ipcMain.handle(ChannelBookmarks.IMPORT_BOOKMARKS, importBookmarks);
};
