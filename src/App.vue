<script setup lang="ts">
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from '@/components/ui/menubar'
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { useMagicKeys, useColorMode } from '@vueuse/core'
import { ref, watch } from 'vue'
import Main from '@views/Main.vue';

const mode = useColorMode({
  selector: 'html', // html 태그에 'dark' 클래스를 입힘
  attribute: 'class',
  initialValue: 'dark'
});

mode.value = 'dark';

const { ctrl, k } = useMagicKeys()
const open = ref(false)

// Ctrl + K 단축키 감지
watch([ctrl, k], ([ctrlValue, kValue]) => {
  if (ctrlValue && kValue) open.value = true
})
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <header
      class="fixed start-0 top-0 flex h-10 w-full items-center justify-between border-b bg-background/80 backdrop-blur-md select-none"
      style="-webkit-app-region: drag"
    >
      <div class="flex items-center px-4" style="-webkit-app-region: no-drag">
        <Menubar class="border-none bg-transparent shadow-none">
          <MenubarMenu>
            <MenubarTrigger class="text-xs bg-background/80 font-bold">File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem class="text-xs">New Window</MenubarItem>
              <MenubarItem class="text-xs">Settings</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <div
        class="flex h-7 w-64 items-center justify-between rounded-md border bg-muted px-3 text-xs text-muted-foreground cursor-pointer hover:bg-accent"
        style="-webkit-app-region: no-drag"
        @click="open = true"
      >
        <span>Search commands...</span>
        <kbd class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span class="text-xs">⌘</span>K
        </kbd>
      </div>

      <div class="w-35"></div>
    </header>

    <Main />

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
