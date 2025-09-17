export interface Component {
  id: string;
  category: ComponentCategory;
  title: string;
  model: string;
  specifications?: string[];
  price: number;
  amazonUrl?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PCBuild {
  id: string;
  name: string;
  description?: string;
  // Cambiamo da array semplice a mappa di array per categoria
  componentsByCategory: Record<ComponentCategory, Component[]>;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

// Manteniamo l'enum esistente
export enum ComponentCategory {
  CASE = "case",
  CPU = "cpu",
  MOTHERBOARD = "motherboard",
  GPU = "gpu",
  MEMORY = "memory",
  CPU_COOLER = "cpu_cooler",
  STORAGE_PRIMARY = "storage_primary",
  STORAGE_SECONDARY = "storage_secondary",
  PSU = "psu",
  MONITOR = "monitor",
  KEYBOARD = "keyboard",
  MOUSE = "mouse",
}

export interface AmazonProductInfo {
  title: string;
  price: number;
  imageUrl?: string;
  specifications?: string[];
}
