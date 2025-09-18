import { useComponentsStore } from "@/stores/useComponentsStore";

const componentsStore = useComponentsStore();

export function exportComponentsCollection() {
  try {
    const exportData = componentsStore.components;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(exportData, null, 2));
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
