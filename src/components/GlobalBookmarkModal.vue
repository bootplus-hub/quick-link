<script setup lang="ts">
import * as z from "zod";
import { watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { SaveIcon } from "lucide-vue-next";
import { useBookmarkModal } from "@/stores";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogFooter, DialogTitle } from "./ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Input } from "./ui/input";

const store = useBookmarkModal();
const modifyFormSchema = z.object({
  name: z.string().min(1, { message: '* 이름은 최소 1글자 이상이어야 합니다.' }),
  url: z.string().url('* URL 형식이 아닙니다.').nullable(),
  browser: z.enum(['edge', 'chrome']),
  type: z.enum(['folder', 'url']).nullable(),
});
type ModifyFormValues = z.infer<typeof modifyFormSchema>;
const form = useForm<ModifyFormValues>({
  validationSchema: toTypedSchema(modifyFormSchema),
  initialValues: {
    name: '',
    url: '',
    browser: 'edge',
    type: null,
  }
});

watch(() => store.isOpen, val => {
  if (val) {
    form.setValues({
      name: store.item?.name ?? '',
      url: store.item?.url ?? null,
      browser: store.item?.browser ?? 'edge',
      type: store.createType ?? null,
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
      guid: store.item!.guid,
      name: values.name,
      browser: values.browser,
      url: values.url ?? undefined,
      parent: store.item?.parent,
    })) return;
  } else {
    if (!store.save({
      type: store.createType!,
      name: values.name,
      browser: values.browser,
      url: values.url ?? undefined,
      parent: store.item?.parent,
    })) return;
  }
  form.resetForm();
});
</script>

<template>
  <Dialog :open="store.isOpen" @update:open="handleOpenChange">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>편집</DialogTitle>
        <DialogDescription>편집 후 저장을 눌러주세요</DialogDescription>
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
        <template v-if="store.item?.url">
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
        <DialogFooter>
          <Button type="submit" variant="secondary"><SaveIcon /> 저장</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
