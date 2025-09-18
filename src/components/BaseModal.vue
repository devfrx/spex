<template>
    <Teleport to="body">
        <Transition name="modal" appear>
            <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
                <div class="modal-content" :class="[sizeClass, customClass]" @click.stop>
                    <!-- Enhanced Header -->
                    <header v-if="showHeader" class="modal-header">
                        <div class="modal-title-section">
                            <div v-if="icon" class="modal-icon-wrapper">
                                <Icon :icon="icon" class="modal-icon" />
                            </div>
                            <div class="title-content">
                                <h2 class="modal-title">{{ title }}</h2>
                                <div class="title-divider"></div>
                            </div>
                        </div>
                        <button v-if="showCloseButton" @click="close" class="close-btn" :disabled="loading">
                            <Icon icon="mdi:close" />
                        </button>
                    </header>

                    <!-- Enhanced Body -->
                    <div class="modal-body" :class="{ 'no-header': !showHeader, 'no-footer': !showFooter }">
                        <div class="body-content">
                            <slot></slot>
                        </div>
                    </div>

                    <!-- Enhanced Footer -->
                    <footer v-if="showFooter" class="modal-footer">
                        <slot name="footer">
                            <div class="footer-actions">
                                <button v-if="showCancelButton" @click="cancel" class="cancel-btn" :disabled="loading">
                                    <Icon icon="mdi:close-circle-outline" />
                                    {{ cancelText }}
                                </button>
                                <button v-if="showConfirmButton" @click="confirm" class="confirm-btn"
                                    :disabled="confirmDisabled || loading" :class="{ 'loading': loading }">
                                    <Icon v-if="loading" icon="mdi:loading" class="loading-icon" />
                                    <Icon v-else-if="confirmIcon" :icon="confirmIcon" />
                                    {{ confirmText }}
                                </button>
                            </div>
                        </slot>
                    </footer>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
    import { computed } from 'vue';

    export interface BaseModalProps {
        modelValue: boolean;
        title?: string;
        icon?: string;
        size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
        customClass?: string;
        closeOnOverlay?: boolean;
        showHeader?: boolean;
        showFooter?: boolean;
        showCloseButton?: boolean;
        showCancelButton?: boolean;
        showConfirmButton?: boolean;
        cancelText?: string;
        confirmText?: string;
        confirmIcon?: string;
        confirmDisabled?: boolean;
        loading?: boolean;
    }

    const props = withDefaults(defineProps<BaseModalProps>(), {
        size: 'md',
        closeOnOverlay: true,
        showHeader: true,
        showFooter: true,
        showCloseButton: true,
        showCancelButton: true,
        showConfirmButton: true,
        cancelText: 'Cancel',
        confirmText: 'Confirm',
        confirmIcon: 'mdi:check',
        confirmDisabled: false,
        loading: false
    });

    const emit = defineEmits<{
        'update:modelValue': [value: boolean];
        'close': [];
        'cancel': [];
        'confirm': [];
    }>();

    const sizeClass = computed(() => {
        const sizes = {
            sm: 'modal-sm',
            md: 'modal-md',
            lg: 'modal-lg',
            xl: 'modal-xl',
            full: 'modal-full'
        };
        return sizes[props.size];
    });

    const handleOverlayClick = () => {
        if (props.closeOnOverlay && !props.loading) {
            close();
        }
    };

    const close = () => {
        if (!props.loading) {
            emit('update:modelValue', false);
            emit('close');
        }
    };

    const cancel = () => {
        if (!props.loading) {
            emit('cancel');
            close();
        }
    };

    const confirm = () => {
        if (!props.confirmDisabled && !props.loading) {
            emit('confirm');
        }
    };
</script>

<style scoped>
    .modal-overlay {
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

    .modal-content {
        position: relative;
        background: var(--color-surface-dark);
        border: var(--border-2) solid rgba(var(--color-primary-rgb), 0.3);
        border-radius: var(--radius-3xl);
        max-height: 90vh;
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

    .modal-content::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--gradient-primary);
        opacity: var(--opacity-80);
    }

    /* Size variants */
    .modal-sm {
        width: 100%;
        max-width: 400px;
    }

    .modal-md {
        width: 100%;
        max-width: 500px;
    }

    .modal-lg {
        width: 100%;
        max-width: 700px;
    }

    .modal-xl {
        width: 100%;
        max-width: 900px;
    }

    .modal-full {
        width: 95vw;
        height: 95vh;
        max-width: none;
        max-height: none;
    }

    /* Enhanced Header */
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-8);
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        flex-shrink: 0;
        position: relative;
    }

    .modal-title-section {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        flex: 1;
    }

    .modal-icon-wrapper {
        width: 48px;
        height: 48px;
        background: rgba(var(--color-primary-rgb), 0.15);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
        border-radius: var(--radius-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .modal-icon {
        font-size: var(--font-size-2xl);
        color: var(--color-primary);
    }

    .title-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    .modal-title {
        margin: 0;
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-dark);
        line-height: var(--line-height-tight);
        background: linear-gradient(135deg, var(--color-text-dark), var(--color-primary-light));
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .title-divider {
        height: 2px;
        background: linear-gradient(90deg, var(--color-primary), transparent);
        border-radius: var(--radius-full);
        max-width: 100px;
    }

    .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: rgba(var(--color-error-rgb), 0.1);
        border: var(--border-thin) solid rgba(var(--color-error-rgb), 0.3);
        border-radius: var(--radius-lg);
        color: var(--color-error);
        cursor: pointer;
        transition: var(--transition-medium);
        font-size: var(--font-size-lg);
        flex-shrink: 0;
    }

    .close-btn:hover:not(:disabled) {
        background: rgba(var(--color-error-rgb), 0.2);
        border-color: rgba(var(--color-error-rgb), 0.5);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--color-error-rgb), 0.3);
    }

    .close-btn:disabled {
        opacity: var(--opacity-50);
        cursor: not-allowed;
    }

    /* Enhanced Body */
    .modal-body {
        overflow-y: auto;
        flex: 1;
        position: relative;
    }

    .modal-body.no-header {
        padding-top: var(--space-8);
    }

    .modal-body.no-footer {
        padding-bottom: var(--space-8);
    }

    .body-content {
        padding: var(--space-8);
    }

    /* Enhanced Footer */
    .modal-footer {
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border-top: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        flex-shrink: 0;
        padding: var(--space-6) var(--space-8);
    }

    .footer-actions {
        display: flex;
        gap: var(--space-4);
        justify-content: flex-end;
        align-items: center;
    }

    .cancel-btn,
    .confirm-btn {
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
        box-shadow: 0 4px 12px rgba(var(--color-secondary-rgb), 0.2);
    }

    .confirm-btn {
        background: var(--gradient-primary);
        border-color: var(--color-primary);
        color: var(--color-white);
        box-shadow: var(--shadow-primary);
    }

    .confirm-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left var(--transition-medium);
    }

    .confirm-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.4);
        border-color: var(--color-primary-light);
    }

    .confirm-btn:hover:not(:disabled)::before {
        left: 100%;
    }

    .confirm-btn:disabled {
        opacity: var(--opacity-60);
        cursor: not-allowed;
        transform: none;
        box-shadow: var(--shadow-sm);
    }

    .confirm-btn.loading {
        cursor: wait;
    }

    .loading-icon {
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
    .modal-enter-active,
    .modal-leave-active {
        transition: var(--transition-medium);
    }

    .modal-enter-from,
    .modal-leave-to {
        opacity: 0;
        backdrop-filter: blur(0);
    }

    .modal-enter-from .modal-content,
    .modal-leave-to .modal-content {
        transform: scale(0.9) translateY(-20px);
        opacity: 0;
    }

    /* Custom scrollbar for modal body */
    .modal-body::-webkit-scrollbar {
        width: 6px;
    }

    .modal-body::-webkit-scrollbar-track {
        background: rgba(var(--color-secondary-rgb), 0.1);
        border-radius: var(--radius-full);
    }

    .modal-body::-webkit-scrollbar-thumb {
        background: rgba(var(--color-primary-rgb), 0.3);
        border-radius: var(--radius-full);
    }

    .modal-body::-webkit-scrollbar-thumb:hover {
        background: rgba(var(--color-primary-rgb), 0.5);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
        .modal-overlay {
            padding: var(--space-4);
        }

        .modal-header {
            padding: var(--space-6);
        }

        .body-content {
            padding: var(--space-6);
        }

        .modal-footer {
            padding: var(--space-4) var(--space-6);
        }
    }

    @media (max-width: 768px) {
        .modal-overlay {
            padding: var(--space-2);
        }

        .modal-sm,
        .modal-md,
        .modal-lg,
        .modal-xl {
            max-width: none;
            width: 100%;
        }

        .modal-full {
            width: 100vw;
            height: 100vh;
            border-radius: 0;
        }

        .modal-header {
            padding: var(--space-5);
            flex-direction: column;
            gap: var(--space-4);
            align-items: flex-start;
        }

        .modal-title-section {
            width: 100%;
        }

        .close-btn {
            position: absolute;
            top: var(--space-4);
            right: var(--space-4);
        }

        .footer-actions {
            flex-direction: column-reverse;
            gap: var(--space-3);
        }

        .cancel-btn,
        .confirm-btn {
            width: 100%;
            min-width: none;
        }
    }

    @media (max-width: 640px) {
        .modal-header {
            padding: var(--space-4);
        }

        .body-content {
            padding: var(--space-4);
        }

        .modal-footer {
            padding: var(--space-4);
        }

        .modal-title-section {
            gap: var(--space-3);
        }

        .modal-icon-wrapper {
            width: 40px;
            height: 40px;
        }

        .modal-icon {
            font-size: var(--font-size-xl);
        }

        .modal-title {
            font-size: var(--font-size-xl);
        }

        .close-btn {
            width: 36px;
            height: 36px;
            top: var(--space-3);
            right: var(--space-3);
        }
    }
</style>