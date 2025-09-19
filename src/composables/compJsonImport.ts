import { useComponentsStore } from "@/stores/useComponentsStore";
import { computeSHA256Hex } from "@/composables/sha256hash";

const componentsStore = useComponentsStore();

export const importComponent = async (file: File) => {
  if (!file) return false;

  const json = await file.text();
  const parsed = JSON.parse(json);

  // Support legacy single-object export or new { component, token } format
  let componentData: any;
  let receivedToken: string | undefined;

  if (parsed && parsed.component) {
    componentData = parsed.component;
    receivedToken = parsed.token;
  } else {
    componentData = parsed;
  }

  // verify token if present
  if (receivedToken) {
    const payloadJson = JSON.stringify(componentData);
    const expected = await computeSHA256Hex(payloadJson + "_component");
    if (receivedToken !== expected) {
      throw new Error("Componente non valido (token mismatch).");
    }
  }

  // normalize dates
  if (componentData.createdAt)
    componentData.createdAt = new Date(componentData.createdAt);
  if (componentData.updatedAt)
    componentData.updatedAt = new Date(componentData.updatedAt);

  componentsStore.addComponent(componentData);
  return true;
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
export async function pickAndImportComponent(): Promise<boolean> {
  const file = await pickFile();
  if (!file) return false;

  // semplice validazione del nome/mime
  const isJson =
    file.type.includes("json") || file.name.toLowerCase().endsWith(".json");
  if (!isJson) {
    throw new Error("File non valido: selezionare un file JSON.");
  }

  await importComponent(file);
  return true;
}
