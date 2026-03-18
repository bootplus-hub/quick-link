import _ from "lodash";
import dayjs from "dayjs";
import { Ref, ref } from "vue";
import { Bookmark, BookmarkType, BrowserType, ChromiumBookmark, ChromiumBookmarks } from ".";
import { IPCResponse } from "@/ipc";
import { toast } from "vue-sonner";
import mitt from "mitt";

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
    this.type = type === 'url' ? 'url' : 'folder',
    this.name = name;
    this.visit = visit;
    this.browser = browser;
    this.url = url;
    this.parent = parent;
  }

  getPath (target?: BrowserType): string {
    if (this.type === 'folder') return `#/${this.guid}`;
    return this.browser === (target ?? 'edge')
      ? `microsoft-edge:${this.url ?? ''}`
      : `google-chrome:${this.url ?? ''}`;
  }

  getIconUrl (): string {
    if (!this.url) return '';
    return `favicon://${this.url}`;
  }

  getParentPath (): string {
    return `/${this.parent ?? ''}`;
  }

  static ofBrowser (browser: BrowserType, node: ChromiumBookmark, parent?: Bookmark): BookmarkImpl {
    return new BookmarkImpl(
      node.guid,
      node.type === 'url' ? 'url' : 'folder',
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
      if (a.visit !== b.visit) return b.visit - a.visit;
      else a.name.localeCompare(b.name);
    }
    return a.type === 'folder' ? -1 : 1;
  }
};

export interface ProviderData {
  edge?: BrowserSource,
  chrome?: BrowserSource,
  bookmarks?: Bookmark[],
  lastUpdateAt?: string,
};

export type ProviderEvents = {
  'update': string | undefined;
};

export interface BookmarkCreateDto {
  type: BookmarkType,
  name: string,
  browser: BrowserType,
  url?: string,
  parent?: string,
};
export interface BookmarkModifyDto {
  guid: string,
  name: string,
  browser: BrowserType,
  url?: string,
  parent?: string,
};

export class BookmarkProvider {
  private static singleton: BookmarkProvider;
  private edge: BrowserSource = {};
  private chrome: BrowserSource = {};
  private readonly bookmarks: Map<string, BookmarkImpl> = new Map<string, BookmarkImpl>();
  private readonly lastUpdateAt: Ref<string> = ref(timestamp());
  public readonly bus = mitt<ProviderEvents>();

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
    this.chrome.checksum = data.chrome?.checksum ?? undefined;
    this.chrome.timestamp = data.chrome?.timestamp ?? undefined;
    (data.bookmarks?.map(BookmarkImpl.ofBookmark) ?? [])
      .forEach(bookmark => this.bookmarks.set(bookmark.guid, bookmark));
    this.lastUpdateAt.value = data.lastUpdateAt ?? timestamp();
    this.bus.emit('update');
  }

  public async saveAsync () {
    const data: ProviderData = {};
    data.edge = this.edge;
    data.chrome = this.chrome;
    data.bookmarks = [...this.bookmarks.values()];
    data.lastUpdateAt = this.lastUpdateAt.value;
    const rst: IPCResponse = await window.ipcRenderer.dispatchBookmarks(data);
    if (rst.success) return;
    console.error(rst.error);
    toast.error('북마크 저장 실패');
  }

  public async loadEdgeBookmarksAsync () {
    try {
      window.ipcRenderer.syncEdgeFavicons();
      const res = await window.ipcRenderer.fetchEdgeBookmarks() as IPCResponse;
      if (!res.success) throw res.error;
      const data = res.data as ChromiumBookmarks;
      if (data.checksum === this.edge.checksum) throw 'Edge 브라우저에 새로운 내용이 없습니다.';
      const items = forFlatingToBookmarks('edge', data.roots.bookmark_bar.children)
          .filter(this.checkNewBookmark, this);
      items.forEach(item => this.bookmarks.set(item.guid, item));
      this.changeLatestUpdate();
      _.set(this.edge, 'checksum', data.checksum);
      _.set(this.edge, 'timestamp', this.lastUpdateAt.value);
      if (items.length === 0) throw 'Edge 브라우저에서 추가할 내용이 없습니다.';
    } catch (message) {
      if (typeof(message) === 'string')
        toast.info(message as string);
      else
        toast.error('북마크 정보를 가져오는데 실패 했습니다.');
    }
  }

  public async loadChromeBookmarksAsync () {
    try {
      window.ipcRenderer.syncChromeFavicons();
      const res = await window.ipcRenderer.fetchChromeBookmarks() as IPCResponse;
      if (!res.success) throw res.error;
      const data = res.data as ChromiumBookmarks;
      if (data.checksum === this.chrome.checksum) throw 'Chrome 브라우저에 새로운 내용이 없습니다.';
      const items = forFlatingToBookmarks('chrome', data.roots.bookmark_bar.children)
          .filter(this.checkNewBookmark, this);
      items.forEach(item => this.bookmarks.set(item.guid, item));
      this.changeLatestUpdate();
      _.set(this.chrome, 'checksum', data.checksum);
      _.set(this.chrome, 'timestamp', this.lastUpdateAt.value);
      if (items.length === 0) throw 'Chrome 브라우저에서 추가할 내용이 없습니다.';
    } catch (message) {
      if (typeof(message) === 'string')
        toast.info(message as string);
      else
        toast.error('북마크 정보를 가져오는데 실패 했습니다.');
    }
  }

  public getBookmark (guid: string): Bookmark | undefined {
    return this.bookmarks.get(guid);
  }

  public getBookmarks (path: string): Bookmark[] {
    const guid = _.last(path.split('/'));
    return [...this.bookmarks.values()]
      .filter(item => (item.parent ?? '') === guid)
      .sort(Sorter.compareDefault);
  }

  public getCommands (): Bookmark[] {
    return [...this.bookmarks.values()]
      .filter(item => item.type === 'url')
      .sort(Sorter.compareDefault);
  }

  public getRouterTreePath (bookmark?: Bookmark): string {
    if (_.isNil(bookmark?.parent)) return `/${bookmark?.guid ?? ''}`;
    return this.getRouterTreePath(this.getBookmark(bookmark.parent)) + `/${bookmark.guid}`;
  }

  public setBookmark (dto: BookmarkModifyDto): boolean {
    if (!dto.guid) return false;
    if (!this.bookmarks.has(dto.guid)) return false;
    const item = this.bookmarks.get(dto.guid)!;
    item.name = dto.name;
    item.browser = dto.browser;
    item.parent = dto.parent;
    if (item.type === 'url') {
      item.url = dto.url;
    }
    this.changeLatestUpdate();
    return true;
  }

  public addBookmark (dto: BookmarkCreateDto) {
    const guid = window.crypto.randomUUID();
    this.bookmarks.set(guid, new BookmarkImpl(
      guid,
      dto.type,
      dto.name,
      0,
      dto.browser,
      dto.url,
      dto.parent
    ));
    this.changeLatestUpdate();
  }

  public removeBookmark (guid: string): boolean {
    const rtn = this.bookmarks.delete(guid);
    if (rtn) this.changeLatestUpdate();
    return rtn;
  }

  public changeLatestUpdate () {
    this.lastUpdateAt.value = timestamp();
    this.bus.emit('update');
  }

  private checkNewBookmark (item: Bookmark): boolean {
    return !this.bookmarks.has(item.guid);
  }
};

export default BookmarkProvider.getInstance();
