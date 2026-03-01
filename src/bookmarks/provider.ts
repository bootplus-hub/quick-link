import _ from "lodash";
import dayjs from "dayjs";
import { Bookmark, ChromiumBookmark, ChromiumBookmarks } from ".";
import { BookmarkType, BrowserType } from "./enums";

declare interface BrowserSource {
  checksum?: string,
  timestamp?: string
};

declare interface Provider {
  edge: BrowserSource,
  chrome: BrowserSource,
  automatic: boolean,
  bookmarks: Bookmark[],
};

function toBookmark (browser: BrowserType, node: ChromiumBookmark, parent?: Bookmark): Bookmark {
  return {
    parent: parent,
    guid: node.guid,
    name: node.name,
    type: node.type === BookmarkType.URL ? BookmarkType.URL : BookmarkType.FOLDER,
    url: node.url,
    visit: 0,
    browser: browser
  };
}

function forFlatingToBookmarks (browser: BrowserType, nodes: ChromiumBookmark[], parent?: Bookmark): Bookmark[] {
  const rtn: Bookmark[] = [];
  if (!Array.isArray(nodes) || nodes.length == 0) return rtn;
  nodes.forEach(node => {
    const mark = toBookmark(browser, node, parent);
    const marks = forFlatingToBookmarks(browser, node.children, mark);
    rtn.push(mark, ...marks);
  });
  return rtn.sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name)
    : a.type === BookmarkType.FOLDER ? -1 : 1);
}

export default class BookmarkProvider implements Provider {
  edge: BrowserSource = {};
  chrome: BrowserSource = {};
  automatic: boolean = false;
  bookmarks: Bookmark[] = [];

  async loadEdgeBookmarks () {
    const data: ChromiumBookmarks = await window.ipcRenderer.fetchEdgeBookmarks();
    if (data.checksum === this.edge.checksum) return;
    _.set(this.edge, 'checksum', data.checksum);
    _.set(this.edge, 'timestamp', dayjs().format('YYYY-MM-DDTHH:mm:ss'));

    this.bookmarks.push(...forFlatingToBookmarks(BrowserType.EDGE, data.roots.bookmark_bar.children));
  }
}
