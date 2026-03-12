import { defineStore } from 'pinia';
import { ref } from 'vue';

type AlertDialogType = 'alert' | 'confirm';

interface AlertDialogOptions {
  title: string;
  description?: string;
  type?: AlertDialogType;
  cancelText?: string;
  actionText?: string;
}

export const useAlertDialog = defineStore('alertDialog', () => {
  const isOpen = ref(false);
  const title = ref('');
  const description = ref('');
  const type = ref<AlertDialogType>('alert');
  const cancelText = ref('취소');
  const actionText = ref('확인');

  // Promise의 resolve 함수를 담을 변수
  let resolvePromise: (value: boolean) => void;

  const open = (options: AlertDialogOptions|string): Promise<boolean> => {
    if (typeof(options) == 'string') {
      title.value = options;
      description.value = '';
      type.value = 'alert';
      cancelText.value = '취소';
      actionText.value = '확인';
    } else {
      title.value = options.title;
      description.value = options.description ?? '';
      type.value = options.type ?? 'alert';
      cancelText.value = options.cancelText ?? '취소';
      actionText.value = options.actionText ?? '확인';
    }
    isOpen.value = true;

    // 새로운 Promise를 생성하고 resolve를 보관함
    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  const confirm = () => {
    isOpen.value = false;
    resolvePromise(true); // 확인 클릭 시 true 반환
  };

  const cancel = () => {
    isOpen.value = false;
    resolvePromise(false); // 취소 클릭 시 false 반환
  };

  return { isOpen, title, description, type, cancelText, actionText, open, confirm, cancel };
});
