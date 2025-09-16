import { defineStore } from "pinia";
import { PCBuild, Component } from "@/interfaces/builds";

export const useBuildsStore = defineStore("builds", {
  state: () => ({
    builds: [] as PCBuild[],
    currentBuild: null as PCBuild | null,
  }),

  getters: {
    getBuildById: (state) => (id: string) =>
      state.builds.find((b) => b.id === id),

    totalBuilds: (state) => state.builds.length,

    currentBuildTotalPrice: (state) => {
      if (!state.currentBuild) return 0;
      return state.currentBuild.components.reduce(
        (total, component) => total + component.price,
        0
      );
    },
  },

  actions: {
    async createBuild(name: string, description?: string): Promise<PCBuild> {
      const build: PCBuild = {
        id: crypto.randomUUID(),
        name,
        description,
        components: [],
        totalPrice: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.builds.push(build);
      this.currentBuild = build;
      return build;
    },

    async updateBuild(id: string, updates: Partial<PCBuild>): Promise<PCBuild> {
      const index = this.builds.findIndex((b) => b.id === id);
      if (index === -1) throw new Error("Build non trovata");

      this.builds[index] = {
        ...this.builds[index],
        ...updates,
        updatedAt: new Date(),
      };

      if (this.currentBuild?.id === id) {
        this.currentBuild = this.builds[index];
      }

      return this.builds[index];
    },

    async deleteBuild(id: string): Promise<void> {
      const index = this.builds.findIndex((b) => b.id === id);
      if (index === -1) throw new Error("Build non trovata");

      if (this.currentBuild?.id === id) {
        this.currentBuild = null;
      }

      this.builds.splice(index, 1);
    },

    async addComponentToBuild(
      buildId: string,
      component: Component
    ): Promise<void> {
      const build = this.getBuildById(buildId);
      if (!build) throw new Error("Build non trovata");

      // Rimuovi componente esistente della stessa categoria
      build.components = build.components.filter(
        (c) => c.category !== component.category
      );

      // Aggiungi nuovo componente
      build.components.push(component);

      // Aggiorna prezzo totale
      build.totalPrice = build.components.reduce(
        (total, c) => total + c.price,
        0
      );
      build.updatedAt = new Date();

      // Aggiorna currentBuild se necessario
      if (this.currentBuild?.id === buildId) {
        this.currentBuild = build;
      }
    },

    async removeComponentFromBuild(
      buildId: string,
      componentId: string
    ): Promise<void> {
      const build = this.getBuildById(buildId);
      if (!build) throw new Error("Build non trovata");

      build.components = build.components.filter((c) => c.id !== componentId);
      build.totalPrice = build.components.reduce(
        (total, c) => total + c.price,
        0
      );
      build.updatedAt = new Date();

      if (this.currentBuild?.id === buildId) {
        this.currentBuild = build;
      }
    },

    setCurrentBuild(build: PCBuild | null): void {
      this.currentBuild = build;
    },
  },

  persist: true,
});
