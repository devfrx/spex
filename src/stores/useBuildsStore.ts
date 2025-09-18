import { defineStore } from "pinia";
import { PCBuild, Component, ComponentCategory } from "@/interfaces/builds";

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
      return Object.values(state.currentBuild.componentsByCategory)
        .flat()
        .reduce((total, component) => total + component.price, 0);
    },

    // Nuovo getter per ottenere tutti i componenti come array piatto
    getAllComponents: (state) => (build: PCBuild) => {
      return Object.values(build.componentsByCategory).flat();
    },

    // Getter per ottenere componenti di una categoria specifica
    getComponentsByCategory:
      (state) => (build: PCBuild, category: ComponentCategory) => {
        return build.componentsByCategory[category] || [];
      },
  },

  actions: {
    // Inizializza le categorie vuote per una build
    initializeEmptyCategories(): Record<ComponentCategory, Component[]> {
      const categories = {} as Record<ComponentCategory, Component[]>;
      Object.values(ComponentCategory).forEach((category) => {
        categories[category] = [];
      });
      return categories;
    },

    async createBuild(name: string, description?: string): Promise<PCBuild> {
      const build: PCBuild = {
        id: crypto.randomUUID(),
        name,
        description,
        componentsByCategory: this.initializeEmptyCategories(),
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

    async addBuild(build: PCBuild): Promise<void> {
      const exists = this.builds.some((b) => b.id === build.id);
      if (exists) throw new Error("Build con questo ID già esistente");
      this.builds.push(build);
    },

    async addComponentToBuild(
      buildId: string,
      component: Component
    ): Promise<void> {
      const build = this.getBuildById(buildId);
      if (!build) throw new Error("Build non trovata");

      // Inizializza la categoria se non esiste
      if (!build.componentsByCategory[component.category]) {
        build.componentsByCategory[component.category] = [];
      }

      // Aggiungi il componente alla categoria appropriata
      build.componentsByCategory[component.category].push(component);

      // Aggiorna prezzo totale
      build.totalPrice = Object.values(build.componentsByCategory)
        .flat()
        .reduce((total, c) => total + c.price, 0);

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

      // Trova e rimuovi il componente da tutte le categorie
      Object.keys(build.componentsByCategory).forEach((category) => {
        const categoryKey = category as ComponentCategory;
        build.componentsByCategory[categoryKey] = build.componentsByCategory[
          categoryKey
        ].filter((c) => c.id !== componentId);
      });

      // Aggiorna prezzo totale
      build.totalPrice = Object.values(build.componentsByCategory)
        .flat()
        .reduce((total, c) => total + c.price, 0);

      build.updatedAt = new Date();

      if (this.currentBuild?.id === buildId) {
        this.currentBuild = build;
      }
    },

    // Nuovo metodo per rimuovere un componente specifico da una categoria
    async removeSpecificComponentFromBuild(
      buildId: string,
      category: ComponentCategory,
      componentId: string
    ): Promise<void> {
      const build = this.getBuildById(buildId);
      if (!build) throw new Error("Build non trovata");

      if (build.componentsByCategory[category]) {
        build.componentsByCategory[category] = build.componentsByCategory[
          category
        ].filter((c) => c.id !== componentId);
      }

      // Aggiorna prezzo totale
      build.totalPrice = Object.values(build.componentsByCategory)
        .flat()
        .reduce((total, c) => total + c.price, 0);

      build.updatedAt = new Date();

      if (this.currentBuild?.id === buildId) {
        this.currentBuild = build;
      }
    },

    setCurrentBuild(build: PCBuild | null): void {
      this.currentBuild = build;
    },

    updateComponentReferences(updated: Component) {
      this.builds.forEach((build) => {
        let touched = false;
        Object.values(build.componentsByCategory).forEach((arr) => {
          arr.forEach((c, i) => {
            if (c.id === updated.id && c !== updated) {
              arr[i] = updated;
              touched = true;
            }
          });
        });
        if (touched) {
          build.totalPrice = Object.values(build.componentsByCategory)
            .flat()
            .reduce((t, comp) => t + comp.price, 0);
          build.updatedAt = new Date();
          if (this.currentBuild?.id === build.id) {
            this.currentBuild = build;
          }
        }
      });
    },

    rehydrateComponentReferences(components: Component[]) {
      const map = new Map(components.map((c) => [c.id, c]));
      this.builds.forEach((build) => {
        let changed = false;
        Object.keys(build.componentsByCategory).forEach((cat) => {
          const arr = build.componentsByCategory[cat as ComponentCategory];
          arr.forEach((c, i) => {
            const canonical = map.get(c.id);
            if (canonical && canonical !== c) {
              arr[i] = canonical;
              changed = true;
            }
          });
        });
        if (changed) {
          build.totalPrice = Object.values(build.componentsByCategory)
            .flat()
            .reduce((t, comp) => t + comp.price, 0);
          build.updatedAt = new Date();
        }
      });
      if (this.currentBuild) {
        const refreshed = this.builds.find(
          (b) => b.id === this.currentBuild?.id
        );
        if (refreshed) this.currentBuild = refreshed;
      }
    },

    // Metodo di migrazione per build esistenti
    migrateLegacyBuilds(): void {
      this.builds.forEach((build) => {
        // Se la build ha ancora il vecchio formato components[]
        if ("components" in build && Array.isArray((build as any).components)) {
          const legacyComponents = (build as any).components as Component[];
          build.componentsByCategory = this.initializeEmptyCategories();

          // Migra i componenti esistenti
          legacyComponents.forEach((component) => {
            if (!build.componentsByCategory[component.category]) {
              build.componentsByCategory[component.category] = [];
            }
            build.componentsByCategory[component.category].push(component);
          });

          // Rimuovi la vecchia proprietà
          delete (build as any).components;
        }
      });
    },
  },

  persist: true,
});
