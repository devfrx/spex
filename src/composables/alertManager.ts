import { ref } from "vue";
import type { AlertOptions, AlertState } from "@/interfaces/alerts";

let resolvePromise: ((result: boolean) => void) | null = null;

const alertState = ref<AlertState>({
  visible: false,
  type: "info",
  title: "",
  message: "",
  confirmText: "OK",
  cancelText: "Cancel",
  showCancel: false,
  closeOnOverlay: true,
  loading: false,
});

export function useAlert() {
  const showAlert = (options: AlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      alertState.value = {
        visible: true,
        type: options.type || "info",
        title: options.title || "",
        message: options.message,
        confirmText: options.confirmText || "OK",
        cancelText: options.cancelText || "Cancel",
        showCancel: options.showCancel || false,
        closeOnOverlay: options.closeOnOverlay !== false,
        loading: false,
      };

      resolvePromise = resolve;
    });
  };

  const hideAlert = () => {
    alertState.value.visible = false;
    if (resolvePromise) {
      resolvePromise(false);
      resolvePromise = null;
    }
  };

  const confirmAlert = () => {
    alertState.value.visible = false;
    if (resolvePromise) {
      resolvePromise(true);
      resolvePromise = null;
    }
  };

  const setLoading = (loading: boolean) => {
    alertState.value.loading = loading;
  };

  // Helper methods for common alert types
  const alert = (message: string, title?: string) => {
    return showAlert({
      type: "info",
      title,
      message,
      showCancel: false,
    });
  };

  const confirm = (message: string, title?: string) => {
    return showAlert({
      type: "confirm",
      title: title || "Confirm Action",
      message,
      showCancel: true,
      confirmText: "Confirm",
      cancelText: "Cancel",
    });
  };

  const success = (message: string, title?: string) => {
    return showAlert({
      type: "success",
      title: title || "Success",
      message,
      showCancel: false,
      confirmText: "Great!",
    });
  };

  const warning = (message: string, title?: string) => {
    return showAlert({
      type: "warning",
      title: title || "Warning",
      message,
      showCancel: false,
      confirmText: "Got it",
    });
  };

  const error = (message: string, title?: string) => {
    return showAlert({
      type: "error",
      title: title || "Error",
      message,
      showCancel: false,
      confirmText: "Close",
    });
  };

  return {
    alertState,
    showAlert,
    hideAlert,
    confirmAlert,
    setLoading,
    alert,
    confirm,
    success,
    warning,
    error,
  };
}
