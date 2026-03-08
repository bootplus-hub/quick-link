import { app, ipcMain, protocol } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import sqlite from "better-sqlite3";
import _ from "lodash";
import type { Database } from "better-sqlite3";
import { IPCResponse } from "@/ipc";
import { FaviconChannel } from "../ipc";

const DB_EDGE_PATH = path.join(app.getPath('userData'), 'favicons_edge.db');
const DB_CHROME_PATH = path.join(app.getPath('userData'), 'favicons_chrome.db');

declare interface FaviconRow {
  image_data?: Buffer,
  width?: number,
};

async function doQuery (domain: string, from?: Database): Promise<FaviconRow> {
  try {
    const row = from?.prepare(`
      SELECT b.image_data, b.width
      FROM icon_mapping m
      JOIN favicon_bitmaps b ON m.icon_id = b.icon_id
      WHERE m.page_url LIKE ? OR m.page_url LIKE ?
      ORDER BY b.width DESC
      LIMIT 1
    `).get(`http://${domain}%`, `https://${domain}%`) as FaviconRow;
    return row ?? {};
  } catch {
    return {};
  }
}

export class FaviconFactory {
  private static factory:FaviconFactory;
  public static getInstance () {
    if (this.factory == null) this.factory = new FaviconFactory();
    return this.factory;
  }

  private dbEdge?:Database;
  private dbChrome?:Database;

  private constructor() {
    this.syncEdgeFavicons();
    this.syncChromeFavicons();
  }

  async find (request: Request): Promise<Response> {
    const domain = request.url.replace(/^favicon:\/+[\w\-]*\/+/i, '').split('/', 1)[0];
    try {
      const rows = [
        await doQuery(domain, this.dbEdge),
        await doQuery(domain, this.dbChrome),
      ];
      const row = _.first(rows
        .filter(item => item.image_data && item.width)
        .sort((a, b) => (b.width ?? 0) - (a.width ?? 0)));
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

  async syncChromeFavicons (_event?:Electron.IpcMainInvokeEvent): Promise<IPCResponse> {
    try {
      this.dbChrome?.close();
      const orgPath = path.join(
        process.env.LOCALAPPDATA || '',
        'Google/Chrome/User Data/Default/Favicons'
      );
      console.debug('FaviconFactory.syncChromeFavicons', orgPath);
      await fs.copyFile(orgPath, DB_CHROME_PATH);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      this.dbChrome = new sqlite(DB_CHROME_PATH, {
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
  ipcMain.handle(FaviconChannel.SYNC_CHROME, () => factory.syncChromeFavicons());
};
