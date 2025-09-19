import { useBuildsStore } from "@/stores/useBuildsStore";
import { computeSHA256Hex } from "@/composables/sha256hash";

const buildsStore = useBuildsStore();

export async function exportBuild(buildId: string) {
  if (!buildId) return;

  try {
    const exportData = buildsStore.getBuildById(buildId);
    if (!exportData) throw new Error("Build non trovata");

    // Uso una copia senza token e serializzo in JSON canonico per il calcolo dell'hash
    const payload = { ...exportData };
    delete (payload as any).token; // Rimuovo token se esiste
    const payloadJson = JSON.stringify(payload); // Canonical JSON

    const toHash = payloadJson + "_build";
    const token = await computeSHA256Hex(toHash);

    // Imposta il token sulla copia originale che verrà esportata
    const finalData = { ...payload, token };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(finalData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `builds_export_${new Date().toISOString()}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  } catch (error) {
    console.error("Errore nell'esportazione della build:", error);
    return false;
  }
}
