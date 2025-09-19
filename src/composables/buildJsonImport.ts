import { useBuildsStore } from "@/stores/useBuildsStore";
import { computeSHA256Hex } from "@/composables/sha256hash";

const buildsStore = useBuildsStore();

export const importBuild = async (file: File) => {
  if (!file) return false;

  try {
    const json = await file.text();
    // Parse prima per ottenere l'oggetto (contiene il token)
    const buildData = JSON.parse(json);

    // Estrai token e ricostruisci il payload canonico (senza token)
    const receivedToken = buildData.token;
    const payloadCopy = { ...buildData };
    delete (payloadCopy as any).token;
    const payloadJson = JSON.stringify(payloadCopy);

    const expectedHash = await computeSHA256Hex(payloadJson + "_build");

    if (receivedToken !== expectedHash) {
      throw new Error("Build non valida (token mismatch).");
    }

    // Normalizza date (string -> Date) sia per la build che per i componenti
    if (buildData.createdAt)
      buildData.createdAt = new Date(buildData.createdAt);
    if (buildData.updatedAt)
      buildData.updatedAt = new Date(buildData.updatedAt);
    if (Array.isArray(buildData.componentsByCategory)) {
      // vecchio formato migrato altrove; lasciare gestione se necessario
    } else {
      Object.values(buildData.componentsByCategory || {}).forEach(
        (arr: any[]) => {
          arr.forEach((c) => {
            if (c.createdAt) c.createdAt = new Date(c.createdAt);
            if (c.updatedAt) c.updatedAt = new Date(c.updatedAt);
          });
        }
      );
    }

    await buildsStore.addBuild(buildData);
    return true;
  } catch (e) {
    // Rilancia / logga per far vedere il problema al chiamante
    console.error("Errore durante l'import del file:", (e as Error).message);
    throw e;
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
export async function pickAndImportBuild(): Promise<boolean> {
  const file = await pickFile();
  if (!file) return false;

  // semplice validazione del nome/mime
  const isJson =
    file.type.includes("json") || file.name.toLowerCase().endsWith(".json");
  if (!isJson) {
    throw new Error("File non valido: selezionare un file JSON.");
  }

  await importBuild(file);
  return true;
}
