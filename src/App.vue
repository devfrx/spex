<template>
  <ion-app>
    <!-- Global Alert Component -->
    <BaseAlert :visible="alertState.visible" :type="alertState.type" :title="alertState.title"
      :message="alertState.message" :confirm-text="alertState.confirmText" :cancel-text="alertState.cancelText"
      :show-cancel="alertState.showCancel" :close-on-overlay="alertState.closeOnOverlay" :loading="alertState.loading"
      @confirm="confirmAlert" @cancel="hideAlert" @close="hideAlert" />
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
  import { IonApp, IonRouterOutlet } from '@ionic/vue';
  import BaseAlert from '@/components/BaseAlert.vue';
  import { useAlert } from '@/composables/alertManager';

  const { alertState, hideAlert, confirmAlert } = useAlert();
</script>
