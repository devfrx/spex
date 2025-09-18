import { ref } from "vue";
import type { AlertType } from "@/components/BaseAlert.vue";

export interface AlertOptions {
  type?: AlertType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  closeOnOverlay?: boolean;
}

export interface AlertState {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
  closeOnOverlay: boolean;
  loading: boolean;
}
