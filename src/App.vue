<script setup lang="ts">
import "vue-sonner/style.css";
import { Toaster } from "@/components/ui/sonner";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { CommandDialog } from "@/components/ui/command";
import { Switch } from "@components/ui/switch";
import {
  CommandChunkList,
  GlobalAlertDialog,
  GlobalBookmarkModal,
} from "@/components";
import {
  SunIcon,
  MoonIcon,
  MenuIcon,
  SaveIcon,
  FolderPlusIcon,
  SquareStarIcon,
  ImportIcon,
} from "lucide-vue-next";
import { useMagicKeys, useColorMode, useDark, useToggle } from "@vueuse/core";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { Main } from "@views/main";
import { Bookmark, BookmarkType } from "./bookmarks";
import { AcceptableValue, type ListboxItemSelectEvent } from "reka-ui";
import { useRouter } from "vue-router";
import { useBookmarkModal } from "./stores";
import provider from "./bookmarks/provider";

useColorMode({
  selector: "html", // html 태그에 'dark' 클래스를 입힘
  attribute: "class",
  initialValue: "dark",
});

const { ctrl, k } = useMagicKeys();
const open = ref(false);
const isDark = useDark();
const toggleDark = useToggle(isDark);
const router = useRouter();
const bookmarkModal = useBookmarkModal();

const commands = ref<Bookmark[]>(provider.getCommands());

function refresh(_path?: string) {
  commands.value = provider.getCommands();
  provider.saveAsync();
}

onMounted(() => provider.bus.on("update", refresh));
onUnmounted(() => provider.bus.off("update", refresh));

// Ctrl + K 단축키 감지
watch([ctrl, k], ([ctrlValue, kValue]) => {
  if (ctrlValue && kValue) open.value = true;
});

function createBookmark(type: BookmarkType) {
  bookmarkModal.openCreate(type, router.currentRoute.value.path);
}

function loadEdgeBookmarks() {
  provider.loadEdgeBookmarksAsync();
}

function loadChromeBookmarks() {
  provider.loadChromeBookmarksAsync();
}

function importBackup() {
  provider.importAsync();
}

function exportBackup() {
  provider.exportAsync();
}

function selectCommand(event: ListboxItemSelectEvent<AcceptableValue>) {
  const item = event.detail.value as Bookmark;
  router.push(item.getParentPath());
  open.value = false;
}
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <header
      class="fixed start-0 top-0 flex h-10 w-full items-center justify-between border-b bg-background/80 backdrop-blur-md select-none"
      style="-webkit-app-region: drag"
    >
      <div class="flex w-full items-center justify-between">
        <div class="flex items-center px-4" style="-webkit-app-region: no-drag">
          <Menubar class="border-none bg-transparent shadow-none">
            <MenubarMenu>
              <MenubarTrigger class="text-xs bg-background/80 font-bold"
                ><MenuIcon class="size-4"
              /></MenubarTrigger>
              <MenubarContent>
                <MenubarItem class="text-xs" @select="createBookmark('folder')"
                  ><FolderPlusIcon />새 폴더</MenubarItem
                >
                <MenubarItem class="text-xs" @select="createBookmark('url')"
                  ><SquareStarIcon />새 북마크</MenubarItem
                >
                <MenubarSeparator />
                <MenubarSub>
                  <MenubarSubTrigger class="text-xs" inset
                    >가져오기</MenubarSubTrigger
                  >
                  <MenubarSubContent class="w-40">
                    <MenubarItem class="text-xs" @select="loadEdgeBookmarks()"
                      ><ImportIcon />Edge 데이터</MenubarItem
                    >
                    <MenubarItem class="text-xs" @select="loadChromeBookmarks()"
                      ><ImportIcon />Chrome 데이터</MenubarItem
                    >
                    <MenubarItem class="text-xs" @select="importBackup()"
                      ><ImportIcon />백업 데이터</MenubarItem
                    >
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarItem class="text-xs" @select="exportBackup()"
                  ><SaveIcon />내보내기</MenubarItem
                >
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        <div
          class="flex h-7 w-64 items-center justify-between rounded-md border bg-muted px-3 text-xs text-muted-foreground cursor-pointer hover:bg-accent"
          style="-webkit-app-region: no-drag"
          @click="open = true"
        >
          <span>Search ...</span>
          <kbd
            class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100"
          >
            Ctrl + K
          </kbd>
        </div>

        <Switch
          :model-value="isDark"
          @update:model-value="toggleDark"
          style="-webkit-app-region: no-drag"
        >
          <template #thumb>
            <div class="flex h-full w-full items-center justify-center">
              <MoonIcon v-if="isDark" class="h-3 w-3 text-yellow-500" />
              <SunIcon v-else class="h-3 w-3 text-gray-500" />
            </div>
          </template>
        </Switch>
      </div>

      <div class="w-50"></div>
    </header>

    <Main></Main>

    <CommandDialog v-model:open="open">
      <CommandChunkList :items="commands" @select="selectCommand" />
    </CommandDialog>

    <GlobalBookmarkModal />
    <GlobalAlertDialog />
    <Toaster position="top-right" />
  </div>
</template>
