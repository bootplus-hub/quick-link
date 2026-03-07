import _ from "lodash";
import { BookmarkType, BrowserType } from "./enums.ts";

export interface Bookmark {
  url?: string,
  parent?: string,
  guid: string,
  type: BookmarkType,
  name: string,
  visit: number,
  browser: BrowserType,
  getPath (): string,
  getIconUrl (): string,
  getParentPath (): string,
};

export interface ChromiumBookmark {
  guid: string,
  id?: string,
  name: string,
  source?: string,
  type: string,
  url?: string,
  date_added?: string,
  date_last_used?: string,
  date_modified?: string,
  children: ChromiumBookmark[],
};

export interface ChromiumBookmarkRoot {
  bookmark_bar: ChromiumBookmark,
  other?: ChromiumBookmark,
  synced?: ChromiumBookmark,
  workspaces_v2?: ChromiumBookmark,
};

export interface ChromiumBookmarks {
  checksum: string,
  roots: ChromiumBookmarkRoot,
  version?: number
};
