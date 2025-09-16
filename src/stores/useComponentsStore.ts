import { defineStore } from "pinia";
import {
  Component,
  ComponentCategory,
  AmazonProductInfo,
} from "@/interfaces/builds";

export const useComponentsStore = defineStore("components", {
  state: () => ({
    components: [] as Component[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getComponentById: (state) => (id: string) =>
      state.components.find((c) => c.id === id),

    getComponentsByCategory: (state) => (category: ComponentCategory) =>
      state.components.filter((c) => c.category === category),

    totalComponents: (state) => state.components.length,
  },

  actions: {
    async fetchAmazonProductInfo(url: string): Promise<AmazonProductInfo> {
      this.loading = true;
      this.error = null;

      try {
        // Chiamata al backend invece del mock
        const response = await fetch("/api/amazon/product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error("Errore nel recupero dati Amazon");
        }

        const productInfo = await response.json();
        return productInfo;
      } catch (error) {
        console.error("Errore fetching Amazon:", error);
        this.error = "Errore nel recupero delle informazioni da Amazon";

        // Fallback al mock in caso di errore
        return this.getMockAmazonData(url);
      } finally {
        this.loading = false;
      }
    },

    getMockAmazonData(url: string): AmazonProductInfo {
      // Mock data per simulare l'API Amazon
      const mockProducts: Record<string, AmazonProductInfo> = {
        imkvN6F: {
          title: "Montech King 95 PRO",
          price: 154.14,
          specifications: ["Mid-Tower", "Vetro Temperato Nero"],
        },
        "12e2Cvs": {
          title: "AMD Ryzen 9 7900X",
          price: 307.23,
          specifications: ["12 Core / 24 Thread", "AM5", "Radeon Graphics"],
        },
        // Aggiungi altri prodotti mock...
      };

      const productId = url.split("/d/")[1] || url.split("=")[1];
      return (
        mockProducts[productId] || {
          title: "Prodotto non trovato",
          price: 0,
          specifications: [],
        }
      );
    },

    async createComponent(
      componentData: Omit<Component, "id" | "createdAt" | "updatedAt">
    ): Promise<Component> {
      const component: Component = {
        ...componentData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.components.push(component);
      return component;
    },

    async updateComponent(
      id: string,
      updates: Partial<Component>
    ): Promise<Component> {
      const index = this.components.findIndex((c) => c.id === id);
      if (index === -1) throw new Error("Componente non trovato");

      this.components[index] = {
        ...this.components[index],
        ...updates,
        updatedAt: new Date(),
      };

      return this.components[index];
    },

    async deleteComponent(id: string): Promise<void> {
      const index = this.components.findIndex((c) => c.id === id);
      if (index === -1) throw new Error("Componente non trovato");

      this.components.splice(index, 1);
    },

    async createFromAmazonUrl(
      category: ComponentCategory,
      amazonUrl: string
    ): Promise<Component> {
      const productInfo = await this.fetchAmazonProductInfo(amazonUrl);

      return this.createComponent({
        category,
        title: this.getCategoryDisplayName(category),
        model: productInfo.title,
        specifications: productInfo.specifications,
        price: productInfo.price,
        amazonUrl,
        imageUrl: productInfo.imageUrl,
      });
    },

    getCategoryDisplayName(category: ComponentCategory): string {
      const names: Record<ComponentCategory, string> = {
        [ComponentCategory.CASE]: "Case",
        [ComponentCategory.CPU]: "Processore",
        [ComponentCategory.MOTHERBOARD]: "Motherboard",
        [ComponentCategory.GPU]: "Graphics Card",
        [ComponentCategory.MEMORY]: "Memory",
        [ComponentCategory.CPU_COOLER]: "CPU Cooler",
        [ComponentCategory.STORAGE_PRIMARY]: "Primary SSD",
        [ComponentCategory.STORAGE_SECONDARY]: "Secondary SSD",
        [ComponentCategory.PSU]: "Power Supply",
        [ComponentCategory.MONITOR]: "Monitor",
        [ComponentCategory.KEYBOARD]: "Keyboard",
        [ComponentCategory.MOUSE]: "Mouse",
      };
      return names[category];
    },
  },

  persist: true,
});
