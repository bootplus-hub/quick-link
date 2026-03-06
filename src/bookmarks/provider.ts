import _ from "lodash";
import dayjs from "dayjs";
import { Ref, ref } from "vue";
import { Bookmark, ChromiumBookmark, ChromiumBookmarks } from ".";
import { BookmarkType, BrowserType } from "./enums";
import { IPCResponse } from "@/ipc";

function timestamp (): string {
  return dayjs().format('YYYY-MM-DDTHH:mm:ss');
}

declare interface BrowserSource {
  checksum?: string,
  timestamp?: string
};

class BookmarkImpl implements Bookmark {
  constructor (
    public guid: string,
    public type: BookmarkType,
    public name: string,
    public visit: number,
    public browser: BrowserType,
    public url?: string,
    public parent?: string
  ) {
    this.guid = guid;
    this.type = type === BookmarkType.URL ? BookmarkType.URL : BookmarkType.FOLDER,
    this.name = name;
    this.visit = visit;
    this.browser = browser;
    this.url = url;
    this.parent = parent;
  }

  getPath (): string {
    if (this.type === BookmarkType.FOLDER) return `#/${this.guid}`;
    return this.browser === BrowserType.EDGE
      ? `microsoft-edge:${this.url ?? ''}`
      : `microsoft-edge:${this.url ?? ''}`;
  }

  getIconUrl(): string {
    if (!this.url) return '';
    return `favicon://${this.url}`;
  }

  static ofBrowser (browser: BrowserType, node: ChromiumBookmark, parent?: Bookmark): BookmarkImpl {
    return new BookmarkImpl(
      node.guid,
      node.type === BookmarkType.URL ? BookmarkType.URL : BookmarkType.FOLDER,
      node.name,
      0,
      browser,
      node.url,
      parent?.guid
    );
  }

  static ofBookmark (src: Bookmark): BookmarkImpl {
    return new BookmarkImpl(
      src.guid,
      src.type,
      src.name,
      src.visit,
      src.browser,
      src.url,
      src.parent
    );
  }
};

function forFlatingToBookmarks (browser: BrowserType, nodes: ChromiumBookmark[], parent?: Bookmark): Bookmark[] {
  const rtn: Bookmark[] = [];
  if (!Array.isArray(nodes) || nodes.length == 0) return rtn;
  nodes.forEach(node => {
    const mark = BookmarkImpl.ofBrowser(browser, node, parent);
    const marks = forFlatingToBookmarks(browser, node.children, mark);
    rtn.push(mark, ...marks);
  });
  return rtn;
};

class Sorter {
  public static compareDefault (a: Bookmark, b: Bookmark): number {
    if (a.type === b.type) {
      if (a.visit !== b.visit) return a.visit - b.visit;
      else a.name.localeCompare(b.name);
    }
    return a.type === BookmarkType.FOLDER ? -1 : 1;
  }
};

export interface ProviderData {
  edge?: BrowserSource,
  bookmarks?: Bookmark[],
  lastUpdateAt?: string,
};

export class BookmarkProvider {
  private static singleton: BookmarkProvider;
  private edge: BrowserSource = {};
  private bookmarks: Bookmark[] = [];
  public readonly lastUpdateAt: Ref<string> = ref(timestamp());

  private constructor () {
    this.loadAsync();
  }
  public static getInstance () {
    if (!BookmarkProvider.singleton) {
      BookmarkProvider.singleton = new BookmarkProvider();
    }
    return BookmarkProvider.singleton;
  }

  public async loadAsync () {
    const data:ProviderData = await window.ipcRenderer.fetchBookmarks();
    this.edge.checksum = data.edge?.checksum ?? undefined;
    this.edge.timestamp = data.edge?.timestamp ?? undefined;
    this.bookmarks = data.bookmarks?.map(BookmarkImpl.ofBookmark) ?? [];
    this.lastUpdateAt.value = data.lastUpdateAt ?? timestamp();
  }

  public async saveAsync () {
    const data: ProviderData = {};
    data.edge = this.edge;
    data.bookmarks = this.bookmarks;
    data.lastUpdateAt = this.lastUpdateAt.value;
    const rst: IPCResponse = await window.ipcRenderer.dispatchBookmarks(data);
    if (rst.success) return;
    console.error(rst.error);
    throw '북마크 저장 실패';
  }

  public async loadEdgeBookmarksAsync () {
    window.ipcRenderer.syncEdgeFavicons();
    const data: ChromiumBookmarks = await window.ipcRenderer.fetchEdgeBookmarks();
    if (data.checksum === this.edge.checksum) throw '새로운 내용이 없습니다.';
    const items = forFlatingToBookmarks(BrowserType.EDGE, data.roots.bookmark_bar.children)
        .filter(this.checkNewBookmark, this);
    this.bookmarks.push(...items);
    this.lastUpdateAt.value = timestamp();
    _.set(this.edge, 'checksum', data.checksum);
    _.set(this.edge, 'timestamp', this.lastUpdateAt.value);
    if (items.length === 0) throw '추가할 내용이 없습니다.';
  }

  public getBookmark (guid: string): Bookmark | undefined {
    return this.bookmarks.find(item => item.guid === guid);
  }

  public getBookmarks (path: string): Bookmark[] {
    const guid = _.last(path.split('/'));
    return this.bookmarks.filter(item => (item.parent ?? '') === guid)
      .sort(Sorter.compareDefault);
  }

  public getCommands (): Bookmark[] {
    return this.bookmarks
      .filter(item => item.type === BookmarkType.URL)
      .sort(Sorter.compareDefault);
  }

  public getRouterTreePath (bookmark?: Bookmark): string {
    if (_.isNil(bookmark?.parent)) return `/${bookmark?.guid ?? ''}`;
    return this.getRouterTreePath(this.getBookmark(bookmark.parent)) + `/${bookmark.guid}`;
  }

  private checkNewBookmark (item: Bookmark): boolean {
    return !this.bookmarks.some(bookmark => bookmark.guid === item.guid || bookmark.url === item.url);
  }
};

export default BookmarkProvider.getInstance();
