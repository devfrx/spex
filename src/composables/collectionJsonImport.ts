import { useComponentsStore } from "@/stores/useComponentsStore";

const componentsStore = useComponentsStore();

export const importComponentsCollection = async (file: File) => {
  if (!file) return;

  const json = await file.text();
  const collectionData = JSON.parse(json);
  for (const componentData of collectionData) {
    componentsStore.addComponent(componentData);
  }
};

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
