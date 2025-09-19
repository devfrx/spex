import { useComponentsStore } from "@/stores/useComponentsStore";
import { computeSHA256Hex } from "@/composables/sha256hash";

const componentsStore = useComponentsStore();

export async function exportComponent(componentId: string) {
  try {
    const exportData = componentsStore.components.find(
      (component) => component.id === componentId
    );
    if (!exportData) throw new Error("Componente non trovato.");

    const payloadJson = JSON.stringify(exportData);
    const token = await computeSHA256Hex(payloadJson + "_component");

    const finalData = { component: exportData, token };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(finalData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `component_export_${new Date().toISOString()}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  } catch (error) {
    console.error("Errore nell'esportazione del componente:", error);
  }
}
