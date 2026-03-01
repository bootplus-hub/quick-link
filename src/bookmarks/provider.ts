import _ from "lodash";
import dayjs from "dayjs";
import { Ref, ref } from "vue";
import { Bookmark, ChromiumBookmark, ChromiumBookmarks } from ".";
import { BookmarkType, BrowserType } from "./enums";

const TIMESTAMP_FORMAT: string = 'YYYY-MM-DDTHH:mm:ss';

declare interface BrowserSource {
  checksum?: string,
  timestamp?: string
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
};

function forFlatingToBookmarks (browser: BrowserType, nodes: ChromiumBookmark[], parent?: Bookmark): Bookmark[] {
  const rtn: Bookmark[] = [];
  if (!Array.isArray(nodes) || nodes.length == 0) return rtn;
  nodes.forEach(node => {
    const mark = toBookmark(browser, node, parent);
    const marks = forFlatingToBookmarks(browser, node.children, mark);
    rtn.push(mark, ...marks);
  });
  return rtn.sort(Sorter.compareDefault);
};

class Sorter {
  public static compareDefault (a: Bookmark, b: Bookmark): number {
    return a.type === b.type ? a.name.localeCompare(b.name)
      : a.type === BookmarkType.FOLDER ? -1 : 1;
  }
};

export class BookmarkProvider {
  private static singleton: BookmarkProvider;
  private edge: BrowserSource = {};
  private bookmarks: Bookmark[] = [];
  public readonly lastUpdateAt: Ref<string> = ref(dayjs().format(TIMESTAMP_FORMAT));

  private constructor () {}
  public static getInstance () {
    if (!BookmarkProvider.singleton) {
      BookmarkProvider.singleton = new BookmarkProvider();
    }
    return BookmarkProvider.singleton;
  }

  public async loadEdgeBookmarks () {
    const data: ChromiumBookmarks = await window.ipcRenderer.fetchEdgeBookmarks();
    if (data.checksum === this.edge.checksum) return;
    this.bookmarks.push(...forFlatingToBookmarks(BrowserType.EDGE, data.roots.bookmark_bar.children));
    this.lastUpdateAt.value = dayjs().format(TIMESTAMP_FORMAT);
    _.set(this.edge, 'checksum', data.checksum);
    _.set(this.edge, 'timestamp', this.lastUpdateAt.value);
  }

  public getBookmark (guid: string): Bookmark | undefined {
    return this.bookmarks.find(item => item.guid === guid);
  }

  public getBookmarks (path: string): Bookmark[] {
    const guid = _.last(path.split('/'));
    return this.bookmarks.filter(item => (item.parent?.guid ?? '') === guid);
  }
};

export default BookmarkProvider.getInstance();
