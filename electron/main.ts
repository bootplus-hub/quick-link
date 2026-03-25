import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import bookmarks from "./bookmarks";
import favicons from "./favicon";
import launcher from "./launcher";

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

// --- 중복 실행 방지 로직 시작 ---
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // 이미 실행 중인 인스턴스가 있다면 현재 프로세스 종료
  app.quit()
} else {
  // 두 번째 인스턴스가 실행될 때 호출됨
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore() // 최소화되어 있다면 복구
      win.focus() // 포커스 이동
    }
  })

  // 앱 준비 완료 후 실행
  app.whenReady().then(createWindow)
}
// --- 중복 실행 방지 로직 끝 ---

function createWindow() {
  const isProd = !VITE_DEV_SERVER_URL;
  win = new BrowserWindow({
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#74b9ff'
    },
    icon: path.join(process.env.VITE_PUBLIC, 'icon-main.png'),
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.mjs'),
      nodeIntegration: false, // 보안을 위해 false 권장
      contextIsolation: true, // contextBridge를 쓰려면 true여야 함
      devTools: !isProd, // 배포 환경에서만 false
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.removeMenu(); // 상단 메뉴 제거
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  bookmarks();
  favicons();
  launcher();
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
