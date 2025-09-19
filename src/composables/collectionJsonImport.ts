import { useComponentsStore } from "@/stores/useComponentsStore";
import { computeSHA256Hex } from "@/composables/sha256hash";

const componentsStore = useComponentsStore();

export const importComponentsCollection = async (file: File) => {
  if (!file) return false;

  const json = await file.text();
  const parsed = JSON.parse(json);

  // Support legacy array export (no token) or new object { components, token }
  if (Array.isArray(parsed)) {
    // legacy
    for (const componentData of parsed) {
      normalizeDates(componentData);
      componentsStore.addComponent(componentData);
    }
    return true;
  }

  const components = parsed.components;
  const receivedToken = parsed.token;

  if (!Array.isArray(components)) {
    throw new Error("Formato collection non valido.");
  }

  // verify token if present
  if (receivedToken) {
    const payloadJson = JSON.stringify(components);
    const expected = await computeSHA256Hex(payloadJson + "_collection");
    if (receivedToken !== expected) {
      throw new Error("Collection non valida (token mismatch).");
    }
  }

  // add components
  for (const componentData of components) {
    normalizeDates(componentData);
    componentsStore.addComponent(componentData);
  }

  return true;
};

function normalizeDates(obj: any) {
  if (!obj) return;
  if (obj.createdAt) obj.createdAt = new Date(obj.createdAt);
  if (obj.updatedAt) obj.updatedAt = new Date(obj.updatedAt);
}

/**
 * Apre un file picker (accetta .json) e restituisce il file scelto o null se annullato.
 */
async function pickFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.position = "fixed";
    input.style.left = "-10000px";
    document.body.appendChild(input);

    const cleanup = () => {
      input.removeEventListener("change", onChange);
      document.body.removeChild(input);
    };

    const onChange = () => {
      const file = input.files && input.files.length ? input.files[0] : null;
      cleanup();
      resolve(file);
    };

    input.addEventListener("change", onChange);
    // for some browsers the click must be deferred
    setTimeout(() => input.click(), 0);
  });
}

/**
 * Mostra il dialog per scegliere un file JSON e lo importa.
 * Ritorna true se l'import è andato a buon fine, false se annullato.
 */
export async function pickAndImportCollection(): Promise<boolean> {
  const file = await pickFile();
  if (!file) return false;

  // semplice validazione del nome/mime
  const isJson =
    file.type.includes("json") || file.name.toLowerCase().endsWith(".json");
  if (!isJson) {
    throw new Error("File non valido: selezionare un file JSON.");
  }

  await importComponentsCollection(file);
  return true;
}
