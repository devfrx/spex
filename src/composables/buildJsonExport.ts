import { useBuildsStore } from "@/stores/useBuildsStore";

const buildsStore = useBuildsStore();

export function exportBuild(buildId: string) {
  if (!buildId) return;

  try {
    const exportData = buildsStore.getBuildById(buildId);
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(exportData, null, 2));
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
  }
}
