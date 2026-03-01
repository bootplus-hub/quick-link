import { ipcMain, app } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { BookmarksChannel } from ".";

/**
 * Microsoft Edge 북마크를 읽어서 JSON 객체로 반환하는 함수
 */
async function getEdgeBookmarks () {
  // 1. Edge 북마크 파일 경로 설정 (Windows 기준)
  // %LocalAppData%는 process.env.LOCALAPPDATA와 같습니다.
  const bookmarkPath = path.join(
    process.env.LOCALAPPDATA || '',
    'Microsoft/Edge/User Data/Default/Bookmarks'
  );

  try {
    // 2. 파일 읽기 (UTF-8 인코딩)
    const data = await fs.readFile(bookmarkPath, 'utf-8');
    // 3. JSON 파싱
    const bookmarks = JSON.parse(data);
    // 4. 파싱된 데이터 반환
    return bookmarks;
  } catch (err) {
    throw '북마크 파일을 가져올 수 없습니다.';
  }
};

export default function install () {
  ipcMain.handle(BookmarksChannel.EDGE, getEdgeBookmarks);
};
