import _ from 'lodash';
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { Bookmark } from '@/bookmarks';

export const useBookmarkModal = defineStore('bookmarkModal', () => {
  const isOpen = ref(false);
  const item = ref<Bookmark|undefined>();
  let resolvePromise: (value: boolean) => void;

  const open = (bookmark: Bookmark): Promise<boolean> => {
    item.value = _.cloneDeep(bookmark);
    isOpen.value = true;
    return new Promise((resolve) => resolvePromise = resolve);
  };

  const confirm = () => {
    isOpen.value = false;
    resolvePromise(true); // 확인 클릭 시 true 반환
  };

  const cancel = () => {
    isOpen.value = false;
    resolvePromise(false); // 취소 클릭 시 false 반환
  };
  return { isOpen, item, open, confirm, cancel };
});
