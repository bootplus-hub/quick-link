import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { MainBookmarks } from "@views/main";

const routes: RouteRecordRaw[] = [
  {
    // 모든 경로를 캡처하는 정규표현식 패턴
    path: '/:pathMatch(.*)*',
    name: 'dispatcher',
    component: MainBookmarks
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
