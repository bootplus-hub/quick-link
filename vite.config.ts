import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 현재 모드(development/production)에 맞는 .env 파일을 로드
  const env = loadEnv(mode, process.cwd());
  return {
    // build: env.VITE_USE_ELECTRON === 'false' ? {
    //   ssr: true,
    //   rollupOptions: {
    //     input: 'electron/main.ts',
    //   },
    //   outDir: 'dist-electron',
    // } : undefined,
    plugins: [
      vue(),
      tailwindcss(),
      // .env 파일의 VITE_USE_ELECTRON 값이 'true'일 때만 플러그인 실행
      // env.VITE_USE_ELECTRON === 'true' && electron({
      electron({
        main: {
          // Shortcut of `build.lib.entry`.
          entry: 'electron/main.ts',
          vite: {
            build: {
              sourcemap: env.VITE_USE_SOURCE_MAP === 'true',
              outDir: 'dist-electron',
            },
          },
          onstart(options) {
            if (env.VITE_USE_ELECTRON === 'true')
              options.startup();
          }
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: path.join(__dirname, 'electron/preload.ts'),
          vite: {
            build: {
              outDir: 'dist-electron',
            }
          }
        },
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: process.env.NODE_ENV === 'test'
          // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
          ? undefined
          : {},
      }),
    ].filter(Boolean), // false나 null 값을 제거하여 플러그인 목록 정제,
    resolve: {
      alias: [
        { find: "@", replacement: path.resolve(__dirname, "src") },
        { find: "@views", replacement: path.resolve(__dirname, "src/views") },
        { find: "@components", replacement: path.resolve(__dirname, "src/components") },
      ]
    }
  }
});
