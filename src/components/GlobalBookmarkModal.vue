<script setup lang="ts">
import * as z from "zod";
import { computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { SaveIcon } from "lucide-vue-next";
import { useBookmarkModal } from "@/stores";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogFooter, DialogTitle } from "./ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Input } from "./ui/input";
import Breadcrumb from "./Breadcrumb.vue";

const store = useBookmarkModal();
const modifyFormSchema = z.object({
  name: z.string().min(1, { message: '* 이름은 최소 1글자 이상이어야 합니다.' }),
  url: z.string().url('* URL 형식이 아닙니다.').nullable(),
  browser: z.enum(['edge', 'chrome']),
  type: z.enum(['folder', 'url']).nullable(),
  location: z.string(),
});
type ModifyFormValues = z.infer<typeof modifyFormSchema>;
const form = useForm<ModifyFormValues>({
  validationSchema: toTypedSchema(modifyFormSchema),
  initialValues: {
    name: '',
    url: '',
    browser: 'edge',
    type: null,
    location: '/',
  }
});

const hasUrl = computed<boolean>(() => {
  if (store.modalType === 'create' && store.createDto?.type === 'url') return true;
  if (store.modalType === 'modify' && store.modifyDto?.url) return true;
  return false;
});

const title = computed<string>(() => {
  if (store.modalType === 'modify') return '편집';
  return `새 ${store.createDto?.type === 'folder' ? '폴더' : '북마크'}`
});

watch(() => store.isOpen, val => {
  if (val) {
    form.setValues({
      name: store.modifyDto?.name ?? '',
      url: store.modifyDto?.url ?? null,
      browser: store.modifyDto?.browser ?? 'edge',
      type: store.createDto?.type ?? null,
      location: store.createDto?.location ?? `/${store.modifyDto?.parent ?? ''}`
    });
  }
});

function handleOpenChange (_open: boolean) {
  store.cancel();
  form.resetForm();
}

const handleSubmit = form.handleSubmit(values => {
  if (store.modalType === 'modify') {
    if (!store.save({
      guid: store.modifyDto!.guid,
      name: values.name,
      browser: values.browser,
      url: values.url ?? undefined,
      parent: values.location === '/' ? undefined : values.location.substring(1),
    })) return;
  } else {
    if (!store.save({
      type: store.createDto!.type,
      name: values.name,
      browser: values.browser,
      url: values.url ?? undefined,
      parent: values.location === '/' ? undefined : values.location.substring(1),
    })) return;
  }
  form.resetForm();
});
</script>

<template>
  <Dialog :open="store.isOpen" @update:open="handleOpenChange">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ store.modalType === 'modify' ? '편집' : '작성' }} 후 저장을 눌러주세요</DialogDescription>
      </DialogHeader>
      <form @submit="handleSubmit" class="flex flex-col gap-4">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>이름</FormLabel>
            <FormControl>
              <Input type="text" placeholder="이름을 입력해주세요." v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <template v-if="hasUrl">
          <FormField v-slot="{ componentField }" name="url">
            <FormItem>
              <FormLabel>URL 주소</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="browser">
            <FormItem>
              <FormLabel>Browser</FormLabel>
              <FormControl>
                <ToggleGroup variant="outline" v-bind="componentField" class="[&_button]:w-25">
                  <ToggleGroupItem value="edge">Edge</ToggleGroupItem>
                  <ToggleGroupItem value="chrome">Chrome</ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </template>
        <FormField v-slot="{ componentField }" name="location">
          <FormItem>
            <FormLabel>위치</FormLabel>
            <FormControl>
              <Breadcrumb v-bind="componentField" type="selector" :limit="2" :target="store.modifyDto" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <DialogFooter>
          <Button type="submit" variant="secondary"><SaveIcon /> 저장</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
