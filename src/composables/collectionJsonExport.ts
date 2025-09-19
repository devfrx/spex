import { useComponentsStore } from "@/stores/useComponentsStore";
import { computeSHA256Hex } from "@/composables/sha256hash";

const componentsStore = useComponentsStore();

export async function exportComponentsCollection() {
  try {
    const exportData = componentsStore.components;
    // payload canonico per hashing: array di componenti (senza token)
    const payloadJson = JSON.stringify(exportData);
    const token = await computeSHA256Hex(payloadJson + "_collection");

    const finalData = { components: exportData, token };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(finalData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `collection_export_${new Date().toISOString()}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  } catch (error) {
    console.error(
      "Errore nell'esportazione della collezione di componenti:",
      error
    );
  }
}
