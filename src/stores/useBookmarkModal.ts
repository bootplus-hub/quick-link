import _ from 'lodash';
import { ref } from 'vue';
import { toast } from "vue-sonner";
import { defineStore } from 'pinia';
import { Bookmark, BookmarkType } from '@/bookmarks';
import provider, { BookmarkCreateDto, BookmarkModifyDto } from '@/bookmarks/provider';

export type BookmarkModalType = 'create' | 'modify';
export interface CreateDto {
  type: BookmarkType,
  location: string,
};

export const useBookmarkModal = defineStore('bookmarkModal', () => {
  const isOpen = ref(false);
  const modalType = ref<BookmarkModalType>('create');
  const modifyDto = ref<BookmarkModifyDto|undefined>();
  const createDto = ref<CreateDto|undefined>();
  let resolvePromise: (value: boolean) => void;

  const open = (): Promise<boolean> => {
    isOpen.value = true;
    return new Promise((resolve) => resolvePromise = resolve);
  };
  const openModify = (bookmark: Bookmark): Promise<boolean> => {
    modalType.value = 'modify';
    modifyDto.value = _.cloneDeep(bookmark);
    createDto.value = undefined;
    return open();
  };
  const openCreate = (type: BookmarkType, location: string): Promise<boolean> => {
    modalType.value = 'create';
    modifyDto.value = undefined;
    createDto.value = { type, location };
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
    modifyDto.value = undefined;
    return true;
  };

  const cancel = () => {
    isOpen.value = false;
    resolvePromise(false);
    modifyDto.value = undefined;
  };
  return { isOpen, modifyDto, modalType, createDto, openModify, openCreate, save, cancel };
});
