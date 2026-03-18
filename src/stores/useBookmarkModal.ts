import _ from 'lodash';
import { ref } from 'vue';
import { toast } from "vue-sonner";
import { defineStore } from 'pinia';
import { Bookmark, BookmarkType } from '@/bookmarks';
import provider, { BookmarkCreateDto, BookmarkModifyDto } from '@/bookmarks/provider';

export type BookmarkModalType = 'create' | 'modify';

export const useBookmarkModal = defineStore('bookmarkModal', () => {
  const isOpen = ref(false);
  const item = ref<BookmarkModifyDto|undefined>();
  const modalType = ref<BookmarkModalType>('create');
  const createType = ref<BookmarkType|undefined>();
  let resolvePromise: (value: boolean) => void;

  const open = (): Promise<boolean> => {
    isOpen.value = true;
    return new Promise((resolve) => resolvePromise = resolve);
  };
  const openModify = (bookmark: Bookmark): Promise<boolean> => {
    item.value = _.cloneDeep(bookmark);
    modalType.value = 'modify';
    createType.value = undefined;
    return open();
  };
  const openCreate = (type: BookmarkType): Promise<boolean> => {
    item.value = undefined;
    modalType.value = 'create';
    createType.value = type;
    return open();
  };

  const save = (dto: BookmarkCreateDto|BookmarkModifyDto): boolean => {
    if (modalType.value === 'modify') {
      if (!provider.setBookmark(dto as BookmarkModifyDto)) {
        toast.error('저장을 실패 했습니다.');
        return false;
      }
    } else {
      provider.addBookmark(dto as BookmarkCreateDto);
    }
    isOpen.value = false;
    resolvePromise(true);
    toast.info('저장을 성공 했습니다.');
    item.value = undefined;
    return true;
  };

  const cancel = () => {
    isOpen.value = false;
    resolvePromise(false);
    item.value = undefined;
  };
  return { isOpen, item, modalType, createType, openModify, openCreate, save, cancel };
});
