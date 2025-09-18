import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import HomePage from "../views/HomePage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/builds",
    name: "Builds",
    component: () => import("@/views/BuildsPage.vue"),
  },
  {
    path: "/builds/:id",
    name: "BuildDetail",
    component: () => import("@/views/BuildDetailPage.vue"),
    props: true,
  },
  {
    path: "/builds/:id/edit",
    name: "EditBuild",
    component: () => import("@/views/EditBuildPage.vue"),
    props: true,
  },
  {
    path: "/components",
    name: "Components",
    component: () => import("@/views/ComponentsPage.vue"),
  },
  // {
  //   path: "/components/create",
  //   name: "CreateComponent",
  //   component: () => import("@/views/CreateComponentPage.vue"),
  // },
  {
    path: "/components/:id/edit",
    name: "EditComponent",
    component: () => import("@/views/EditComponentPage.vue"),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
