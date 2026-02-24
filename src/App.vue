<script setup lang="ts">
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from '@/components/ui/menubar';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Switch } from "@components/ui/switch";
import { SunIcon, MoonIcon, FileBracesCornerIcon, MenuIcon } from "lucide-vue-next";
import { useMagicKeys, useColorMode, useDark, useToggle } from '@vueuse/core';
import { ref, watch } from 'vue';
import { Main } from '@views/main';

useColorMode({
  selector: 'html', // html 태그에 'dark' 클래스를 입힘
  attribute: 'class',
  initialValue: 'dark'
});

const { ctrl, k } = useMagicKeys();
const open = ref(false);
const isDark = useDark();
const toggleDark = useToggle(isDark);
const edgeBookmarks = ref({});

// Ctrl + K 단축키 감지
watch([ctrl, k], ([ctrlValue, kValue]) => {
  if (ctrlValue && kValue) open.value = true
});

async function loadEdgeBookmarks () {
  const data = await window.ipcRenderer.fetchEdgeBookmarks();
  console.log(data);
}

</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <header
      class="fixed start-0 top-0 flex h-10 w-full items-center justify-between border-b bg-background/80 backdrop-blur-md select-none"
      style="-webkit-app-region: drag">

      <div class="flex w-full items-center justify-between">

        <div class="flex items-center px-4" style="-webkit-app-region: no-drag">
          <Menubar class="border-none bg-transparent shadow-none">
            <MenubarMenu>
              <MenubarTrigger class="text-xs bg-background/80 font-bold"><MenuIcon class="size-4" /></MenubarTrigger>
              <MenubarContent>
                <MenubarItem class="text-xs" @select="loadEdgeBookmarks"><FileBracesCornerIcon />Edge 즐겨찾기 가져오기</MenubarItem>
                <MenubarItem class="text-xs">Settings</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        <div
          class="flex h-7 w-64 items-center justify-between rounded-md border bg-muted px-3 text-xs text-muted-foreground cursor-pointer hover:bg-accent"
          style="-webkit-app-region: no-drag"
          @click="open = true">
          <span>Search commands...</span>
          <kbd class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span class="text-xs">⌘</span>K
          </kbd>
        </div>

        <Switch :model-value="isDark" @update:model-value="toggleDark" style="-webkit-app-region: no-drag">
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
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem value="settings">Settings</CommandItem>
          <CommandItem value="theme">Change Theme</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  </div>
</template>
