import _ from "lodash";
import { BookmarkType, BrowserType } from "./enums.ts";

export interface Bookmark {
  url?: string,
  parent?: Bookmark,
  guid: string,
  type: BookmarkType,
  name: string,
  visit: number,
  browser: BrowserType
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

export class RouteUtil {
  public static toTreePath(bookmark?: Bookmark): string {
    if (_.isNil(bookmark?.parent)) return `/${bookmark?.guid ?? ''}`;
    return RouteUtil.toTreePath(bookmark.parent) + `/${bookmark.guid}`;
  }
}
