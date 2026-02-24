import { ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { BookmarksChannel } from ".";

/**
 * Microsoft Edge 북마크를 읽어서 JSON 객체로 반환하는 함수
 */
async function getEdgeBookmarks () {
  // 1. Edge 북마크 파일 경로 설정 (Windows 기준)
  // %LocalAppData%는 process.env.LOCALAPPDATA와 같습니다.
  const bookmarkPath = path.join(
    process.env.LOCALAPPDATA || '',
    'Microsoft/Edge/User Data/Default1/Bookmarks'
  );

  // 2. 파일 존재 여부 확인
  if (!fs.existsSync(bookmarkPath)) {
    throw '북마크 파일을 찾을 수 없습니다.';
  }

  // 3. 파일 읽기 (UTF-8 인코딩)
  const data = fs.readFileSync(bookmarkPath, 'utf-8');

  // 4. JSON 파싱
  const bookmarks = JSON.parse(data);

  // 5. 파싱된 데이터 반환
  return bookmarks;
};

export default function install () {
  ipcMain.handle(BookmarksChannel.EDGE, getEdgeBookmarks);
};
