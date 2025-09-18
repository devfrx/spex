<!-- filepath: src/components/BaseAlert.vue -->
<template>
    <Teleport to="body">
        <Transition name="alert-overlay" appear>
            <div v-if="visible" class="alert-overlay" @click="handleOverlayClick">
                <Transition name="alert-content" appear>
                    <div v-if="visible" class="alert-content" :class="alertTypeClass" @click.stop>
                        <!-- Alert Header -->
                        <div class="alert-header">
                            <div class="alert-icon-wrapper" :class="iconWrapperClass">
                                <Icon :icon="alertIcon" class="alert-icon" />
                            </div>
                            <div class="alert-title-section">
                                <h3 class="alert-title">{{ title }}</h3>
                            </div>
                        </div>

                        <!-- Alert Body -->
                        <div class="alert-body">
                            <p class="alert-message">{{ message }}</p>
                            <div v-if="$slots.default" class="alert-slot-content">
                                <slot></slot>
                            </div>
                        </div>

                        <!-- Alert Actions -->
                        <div class="alert-footer">
                            <div class="alert-actions">
                                <button v-if="showCancel" @click="handleCancel" class="alert-btn cancel-btn"
                                    :disabled="loading">
                                    <Icon icon="mdi:close" />
                                    <span>{{ cancelText }}</span>
                                </button>

                                <button @click="handleConfirm" class="alert-btn confirm-btn" :class="confirmButtonClass"
                                    :disabled="loading || confirmDisabled">
                                    <Icon v-if="loading" icon="mdi:loading" class="loading-spin" />
                                    <Icon v-else :icon="confirmIcon" />
                                    <span>{{ loading ? 'Loading...' : confirmText }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
    import { computed, onMounted, onUnmounted } from 'vue';
    import { Icon } from '@iconify/vue';

    export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

    interface Props {
        visible: boolean;
        type?: AlertType;
        title?: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        showCancel?: boolean;
        confirmDisabled?: boolean;
        loading?: boolean;
        closeOnOverlay?: boolean;
    }

    const props = withDefaults(defineProps<Props>(), {
        type: 'info',
        title: '',
        confirmText: 'OK',
        cancelText: 'Cancel',
        showCancel: false,
        confirmDisabled: false,
        loading: false,
        closeOnOverlay: true
    });

    const emit = defineEmits<{
        confirm: [];
        cancel: [];
        close: [];
    }>();

    // Computed properties
    const alertTypeClass = computed(() => `alert-${props.type}`);

    const alertIcon = computed(() => {
        const icons = {
            info: 'mdi:information',
            success: 'mdi:check-circle',
            warning: 'mdi:alert',
            error: 'mdi:alert-circle',
            confirm: 'mdi:help-circle'
        };
        return icons[props.type];
    });

    const iconWrapperClass = computed(() => `icon-${props.type}`);

    const confirmButtonClass = computed(() => `confirm-${props.type}`);

    const confirmIcon = computed(() => {
        const icons = {
            info: 'mdi:check',
            success: 'mdi:check',
            warning: 'mdi:check',
            error: 'mdi:close',
            confirm: 'mdi:check'
        };
        return icons[props.type];
    });

    const defaultTitle = computed(() => {
        if (props.title) return props.title;

        const titles = {
            info: 'Information',
            success: 'Success',
            warning: 'Warning',
            error: 'Error',
            confirm: 'Confirm Action'
        };
        return titles[props.type];
    });

    const title = computed(() => defaultTitle.value);

    // Event handlers
    const handleConfirm = () => {
        emit('confirm');
    };

    const handleCancel = () => {
        emit('cancel');
    };

    const handleOverlayClick = () => {
        if (props.closeOnOverlay) {
            emit('close');
        }
    };

    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && props.visible) {
            emit('close');
        }
    };

    // Lifecycle
    onMounted(() => {
        document.addEventListener('keydown', handleEscape);
        // Prevent body scroll when alert is open
        if (props.visible) {
            document.body.style.overflow = 'hidden';
        }
    });

    onUnmounted(() => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
    });
</script>

<style scoped>

    /* Overlay */
    .alert-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(var(--color-bg-dark-rgb), 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: var(--z-modal);
        padding: var(--space-6);
        backdrop-filter: blur(var(--blur-lg));
    }

    /* Alert Content */
    .alert-content {
        position: relative;
        background: var(--color-surface-dark);
        border: var(--border-2) solid rgba(var(--color-primary-rgb), 0.3);
        border-radius: var(--radius-3xl);
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow: hidden;
        backdrop-filter: blur(var(--blur-xl));
        box-shadow:
            0 25px 50px rgba(var(--color-primary-rgb), 0.1),
            0 0 0 1px rgba(var(--color-primary-rgb), 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        transition: var(--transition-medium);
    }

    /* Alert variants */
    .alert-content.alert-success {
        border-color: rgba(var(--color-success-rgb), 0.4);
        box-shadow: 0 25px 50px rgba(var(--color-success-rgb), 0.15);
    }

    .alert-content.alert-warning {
        border-color: rgba(var(--color-warning-rgb), 0.4);
        box-shadow: 0 25px 50px rgba(var(--color-warning-rgb), 0.15);
    }

    .alert-content.alert-error {
        border-color: rgba(var(--color-error-rgb), 0.4);
        box-shadow: 0 25px 50px rgba(var(--color-error-rgb), 0.15);
    }

    .alert-content.alert-confirm {
        border-color: rgba(var(--color-info-rgb), 0.4);
        box-shadow: 0 25px 50px rgba(var(--color-info-rgb), 0.15);
    }

    /* Header */
    .alert-header {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-8);
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        flex-shrink: 0;
    }

    .alert-icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .alert-icon-wrapper.icon-info {
        background: rgba(var(--color-primary-rgb), 0.15);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
    }

    .alert-icon-wrapper.icon-success {
        background: rgba(var(--color-success-rgb), 0.15);
        border: var(--border-thin) solid rgba(var(--color-success-rgb), 0.3);
    }

    .alert-icon-wrapper.icon-warning {
        background: rgba(var(--color-warning-rgb), 0.15);
        border: var(--border-thin) solid rgba(var(--color-warning-rgb), 0.3);
    }

    .alert-icon-wrapper.icon-error {
        background: rgba(var(--color-error-rgb), 0.15);
        border: var(--border-thin) solid rgba(var(--color-error-rgb), 0.3);
    }

    .alert-icon-wrapper.icon-confirm {
        background: rgba(var(--color-info-rgb), 0.15);
        border: var(--border-thin) solid rgba(var(--color-info-rgb), 0.3);
    }

    .alert-icon {
        font-size: var(--font-size-2xl);
    }

    .icon-info .alert-icon {
        color: var(--color-primary);
    }

    .icon-success .alert-icon {
        color: var(--color-success);
    }

    .icon-warning .alert-icon {
        color: var(--color-warning);
    }

    .icon-error .alert-icon {
        color: var(--color-error);
    }

    .icon-confirm .alert-icon {
        color: var(--color-info);
    }

    .alert-title-section {
        flex: 1;
    }

    .alert-title {
        margin: 0;
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-dark);
        line-height: var(--line-height-tight);
    }

    /* Body */
    .alert-body {
        padding: var(--space-8);
        flex: 1;
        overflow-y: auto;
    }

    .alert-message {
        margin: 0 0 var(--space-4) 0;
        font-size: var(--font-size-md);
        color: var(--color-text-muted);
        line-height: var(--line-height-relaxed);
    }

    .alert-slot-content {
        margin-top: var(--space-6);
    }

    /* Footer */
    .alert-footer {
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border-top: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        flex-shrink: 0;
        padding: var(--space-6) var(--space-8);
    }

    .alert-actions {
        display: flex;
        gap: var(--space-4);
        justify-content: flex-end;
        align-items: center;
    }

    /* Buttons */
    .alert-btn {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-6);
        border-radius: var(--radius-lg);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: var(--transition-medium);
        font-size: var(--font-size-sm);
        min-width: 120px;
        justify-content: center;
        border: var(--border-2);
        position: relative;
        overflow: hidden;
    }

    .cancel-btn {
        background: rgba(var(--color-secondary-rgb), 0.1);
        border-color: rgba(var(--color-secondary-rgb), 0.3);
        color: var(--color-text-muted);
    }

    .cancel-btn:hover:not(:disabled) {
        background: rgba(var(--color-secondary-rgb), 0.2);
        border-color: rgba(var(--color-secondary-rgb), 0.5);
        color: var(--color-text-dark);
        transform: translateY(-1px);
    }

    .confirm-btn {
        font-weight: var(--font-weight-semibold);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .confirm-btn.confirm-info,
    .confirm-btn.confirm-confirm {
        background: var(--gradient-primary);
        border-color: var(--color-primary);
        color: var(--color-white);
    }

    .confirm-btn.confirm-success {
        background: linear-gradient(135deg, var(--color-success), var(--color-success-dark));
        border-color: var(--color-success);
        color: var(--color-white);
    }

    .confirm-btn.confirm-warning {
        background: linear-gradient(135deg, var(--color-warning), var(--color-warning-dark));
        border-color: var(--color-warning);
        color: var(--color-white);
    }

    .confirm-btn.confirm-error {
        background: linear-gradient(135deg, var(--color-error), var(--color-error-dark));
        border-color: var(--color-error);
        color: var(--color-white);
    }

    .confirm-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }

    .alert-btn:disabled {
        opacity: var(--opacity-50);
        cursor: not-allowed;
        transform: none !important;
    }

    .loading-spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }

    /* Transitions */
    .alert-overlay-enter-active,
    .alert-overlay-leave-active {
        transition: opacity var(--transition-medium);
    }

    .alert-overlay-enter-from,
    .alert-overlay-leave-to {
        opacity: 0;
    }

    .alert-content-enter-active,
    .alert-content-leave-active {
        transition: all var(--transition-medium);
    }

    .alert-content-enter-from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
    }

    .alert-content-leave-to {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }

    /* Responsive */
    @media (max-width: 768px) {
        .alert-overlay {
            padding: var(--space-4);
        }

        .alert-actions {
            flex-direction: column;
            gap: var(--space-3);
        }

        .alert-btn {
            width: 100%;
        }
    }
</style>