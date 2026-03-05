import { app, ipcMain, protocol } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import sqlite from "better-sqlite3";
import type { Database } from "better-sqlite3";
import { IPCResponse } from "@/ipc";
import { FaviconChannel } from "../ipc";

const DB_EDGE_PATH = path.join(app.getPath('userData'), 'favicons_edge.db');

export class FaviconFactory {
  private static factory:FaviconFactory;
  public static getInstance () {
    if (this.factory == null) this.factory = new FaviconFactory();
    return this.factory;
  }

  private dbEdge?:Database;

  private constructor() {
    this.syncEdgeFavicons();
  }

  async find (request: Request): Promise<Response> {
    const domain = request.url.replace(/^favicon:\/+https?\/+/i, '').split('/', 1)[0];
    try {
      const row = this.dbEdge?.prepare(`
        SELECT m.page_url, b.image_data
        FROM icon_mapping m
        JOIN favicon_bitmaps b ON m.icon_id = b.icon_id
        WHERE m.page_url LIKE ? OR m.page_url LIKE ?
        ORDER BY b.width DESC
        LIMIT 1
      `).get(`http://${domain}%`, `https://${domain}%`) as { page_url: string, image_data?: Buffer };

      if (!row?.image_data) throw 'not found';
      return new Response(new Uint8Array(row!.image_data), {
        headers: { 'Content-Type': 'image/png' }
      });
    } catch (err) {
      console.warn('FaviconFactory.find failed:', domain, err);
      return new Response(null, { status: 404 });
    }
  }

  async syncEdgeFavicons (_event?:Electron.IpcMainInvokeEvent): Promise<IPCResponse> {
    try {
      this.dbEdge?.close();
      const orgPath = path.join(
        process.env.LOCALAPPDATA || '',
        'Microsoft/Edge/User Data/Default/Favicons'
      );
      console.debug('FaviconFactory.syncEdgeFavicons', orgPath);
      await fs.copyFile(orgPath, DB_EDGE_PATH);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      this.dbEdge = new sqlite(DB_EDGE_PATH, {
        readonly: true, // 읽기 전용 모드 권장
        fileMustExist: true
      });
    }
  }
};

export default function install () {
  const factory = FaviconFactory.getInstance();
  protocol.handle('favicon', (req) => factory.find(req));
  ipcMain.handle(FaviconChannel.SYNC_EDGE, () => factory.syncEdgeFavicons());
};
