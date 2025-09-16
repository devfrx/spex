<template>
    <Teleport to="body">
        <Transition name="modal" appear>
            <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
                <div class="modal-content" :class="[sizeClass, customClass]" @click.stop>
                    <!-- Header -->
                    <header v-if="showHeader" class="modal-header">
                        <div class="modal-title-section">
                            <Icon v-if="icon" :icon="icon" class="modal-icon" />
                            <h2 class="modal-title">{{ title }}</h2>
                        </div>
                        <button v-if="showCloseButton" @click="close" class="close-btn" :disabled="loading">
                            <Icon icon="mdi:close" />
                        </button>
                    </header>

                    <!-- Body -->
                    <div class="modal-body" :class="{ 'no-header': !showHeader }">
                        <slot></slot>
                    </div>

                    <!-- Footer -->
                    <footer v-if="showFooter" class="modal-footer">
                        <slot name="footer">
                            <button v-if="showCancelButton" @click="cancel" class="cancel-btn" :disabled="loading">
                                {{ cancelText }}
                            </button>
                            <button v-if="showConfirmButton" @click="confirm" class="confirm-btn"
                                :disabled="confirmDisabled || loading" :class="{ 'loading': loading }">
                                <Icon v-if="loading" icon="mdi:loading" class="spin" />
                                <Icon v-else-if="confirmIcon" :icon="confirmIcon" />
                                {{ confirmText }}
                            </button>
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
        cancelText: 'Annulla',
        confirmText: 'Conferma',
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
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: var(--z-modal);
        padding: var(--space-4);
        backdrop-filter: blur(4px);
    }

    .modal-content {
        background: var(--color-surface-dark);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-xl);
        max-height: 90vh;
        overflow: hidden;
        backdrop-filter: blur(20px);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
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

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-6);
        border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1);
        flex-shrink: 0;
    }

    .modal-title-section {
        display: flex;
        align-items: center;
        gap: var(--space-3);
    }

    .modal-icon {
        font-size: 1.5rem;
        color: var(--color-primary);
    }

    .modal-title {
        margin: 0;
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
    }

    .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: rgba(var(--color-primary-rgb), 0.1);
        border: none;
        border-radius: var(--radius-md);
        color: var(--color-text-dark);
        cursor: pointer;
        transition: var(--transition-all);
    }

    .close-btn:hover:not(:disabled) {
        background: rgba(var(--color-primary-rgb), 0.2);
        color: var(--color-primary);
    }

    .close-btn:disabled {
        opacity: var(--opacity-50);
        cursor: not-allowed;
    }

    .modal-body {
        padding: var(--space-6);
        overflow-y: auto;
        flex: 1;
    }

    .modal-body.no-header {
        padding-top: var(--space-8);
    }

    .modal-footer {
        display: flex;
        gap: var(--space-3);
        padding: var(--space-6);
        border-top: 1px solid rgba(var(--color-primary-rgb), 0.1);
        justify-content: flex-end;
        flex-shrink: 0;
    }

    .cancel-btn,
    .confirm-btn {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-4);
        border-radius: var(--radius-md);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: var(--transition-all);
        font-size: var(--font-size-sm);
        min-width: 80px;
        justify-content: center;
    }

    .cancel-btn {
        background: rgba(var(--color-secondary-rgb), 0.1);
        border: 1px solid rgba(var(--color-secondary-rgb), 0.3);
        color: var(--color-text-muted);
    }

    .cancel-btn:hover:not(:disabled) {
        background: rgba(var(--color-secondary-rgb), 0.2);
        color: var(--color-text-dark);
    }

    .confirm-btn {
        background: var(--color-primary);
        border: 1px solid var(--color-primary);
        color: var(--color-white);
    }

    .confirm-btn:hover:not(:disabled) {
        background: var(--color-primary-light);
        border-color: var(--color-primary-light);
        transform: translateY(-1px);
    }

    .confirm-btn:disabled {
        opacity: var(--opacity-50);
        cursor: not-allowed;
    }

    .confirm-btn.loading {
        cursor: wait;
    }

    .spin {
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
        transition: all 0.3s ease;
    }

    .modal-enter-from,
    .modal-leave-to {
        opacity: 0;
    }

    .modal-enter-from .modal-content,
    .modal-leave-to .modal-content {
        transform: scale(0.9) translateY(-20px);
    }

    /* Responsive */
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

        .modal-footer {
            flex-direction: column-reverse;
        }

        .cancel-btn,
        .confirm-btn {
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        .modal-header {
            padding: var(--space-4);
        }

        .modal-body {
            padding: var(--space-4);
        }

        .modal-footer {
            padding: var(--space-4);
        }
    }
</style>