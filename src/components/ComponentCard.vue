<template>
    <div class="component-card" :class="{ 'clickable': clickable }" @click="handleClick">
        <div class="card-glow"></div>

        <!-- Premium Header -->
        <div class="card-header">
            <div class="category-badge">
                <Icon :icon="categoryIcon" class="category-icon" />
                <span>{{ categoryName }}</span>
            </div>
            <div class="card-actions" v-if="showActions">
                <button v-if="canDuplicate" @click.stop="$emit('duplicate', component)" class="action-btn"
                    title="Duplica">
                    <Icon icon="mdi:content-copy" />
                </button>
                <button v-if="canDelete" @click.stop="$emit('delete', component)" class="action-btn danger"
                    title="Elimina">
                    <Icon icon="mdi:delete" />
                </button>
            </div>
        </div>

        <!-- Premium Content -->
        <div class="card-content">
            <!-- Component Identity -->
            <div class="component-identity">
                <div class="component-thumbnail" v-if="component.imageUrl">
                    <img :src="component.imageUrl" :alt="component.model" />
                </div>
                <div class="component-placeholder" v-else>
                    <Icon :icon="categoryIcon" />
                </div>

                <div class="component-details">
                    <h3 class="component-name">{{ component.model }}</h3>
                    <div class="component-category-text">{{ categoryName }}</div>
                </div>
            </div>

            <!-- Specifications -->
            <div class="component-specs" v-if="component.specifications?.length">
                <div class="specs-header">
                    <Icon icon="mdi:format-list-bulleted" />
                    <span>Specifications</span>
                </div>
                <div class="specs-container">
                    <span v-for="spec in visibleSpecs" :key="spec" class="spec-chip">
                        {{ spec }}
                    </span>
                    <span v-if="hasMoreSpecs" class="spec-overflow">
                        +{{ component.specifications.length - maxVisibleSpecs }}
                    </span>
                </div>
            </div>

            <!-- Pricing & Actions -->
            <div class="component-footer">
                <div class="price-section">
                    <div class="price-label">Price</div>
                    <div class="price-tag">€{{ component.price.toFixed(2) }}</div>
                </div>

                <div class="component-actions">
                    <a v-if="component.amazonUrl" :href="component.amazonUrl" target="_blank" @click.stop
                        class="action-link amazon" title="View on Amazon">
                        <Icon icon="mdi:shopping" />
                    </a>
                    <slot name="custom-actions" :component="component"></slot>
                </div>
            </div>
        </div>

        <!-- Card Footer -->
        <div class="card-bottom" v-if="showDate">
            <div class="creation-info">
                <Icon icon="mdi:calendar-clock" class="date-icon" />
                <span>Added {{ formatDate(component.createdAt) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { useComponentsStore } from '@/stores/useComponentsStore';
    import { Component, ComponentCategory } from '@/interfaces/builds';

    interface Props {
        component: Component;
        clickable?: boolean;
        showActions?: boolean;
        showDate?: boolean;
        canDuplicate?: boolean;
        canDelete?: boolean;
        maxVisibleSpecs?: number;
    }

    const props = withDefaults(defineProps<Props>(), {
        clickable: true,
        showActions: true,
        showDate: true,
        canDuplicate: true,
        canDelete: true,
        maxVisibleSpecs: 3
    });

    const emit = defineEmits<{
        click: [component: Component];
        duplicate: [component: Component];
        delete: [component: Component];
    }>();

    const componentsStore = useComponentsStore();

    const categoryIcon = computed(() => {
        const icons: Record<ComponentCategory, string> = {
            [ComponentCategory.CASE]: 'mdi:desktop-tower',
            [ComponentCategory.CPU]: 'mdi:cpu-64-bit',
            [ComponentCategory.MOTHERBOARD]: 'mdi:expansion-card',
            [ComponentCategory.GPU]: 'mdi:expansion-card-variant',
            [ComponentCategory.MEMORY]: 'mdi:memory',
            [ComponentCategory.CPU_COOLER]: 'mdi:fan',
            [ComponentCategory.STORAGE_PRIMARY]: 'mdi:harddisk',
            [ComponentCategory.STORAGE_SECONDARY]: 'mdi:harddisk',
            [ComponentCategory.PSU]: 'mdi:power-plug',
            [ComponentCategory.MONITOR]: 'mdi:monitor',
            [ComponentCategory.KEYBOARD]: 'mdi:keyboard',
            [ComponentCategory.MOUSE]: 'mdi:mouse',
        };
        return icons[props.component.category] || 'mdi:package-variant';
    });

    const categoryName = computed(() => {
        const names: Record<ComponentCategory, string> = {
            [ComponentCategory.CASE]: "Case",
            [ComponentCategory.CPU]: "Processore",
            [ComponentCategory.MOTHERBOARD]: "Motherboard",
            [ComponentCategory.GPU]: "Graphics Card",
            [ComponentCategory.MEMORY]: "Memory",
            [ComponentCategory.CPU_COOLER]: "CPU Cooler",
            [ComponentCategory.STORAGE_PRIMARY]: "Primary SSD",
            [ComponentCategory.STORAGE_SECONDARY]: "Secondary SSD",
            [ComponentCategory.PSU]: "Power Supply",
            [ComponentCategory.MONITOR]: "Monitor",
            [ComponentCategory.KEYBOARD]: "Keyboard",
            [ComponentCategory.MOUSE]: "Mouse",
        };
        return names[props.component.category];
    });

    const visibleSpecs = computed(() =>
        props.component.specifications?.slice(0, props.maxVisibleSpecs) || []
    );

    const hasMoreSpecs = computed(() =>
        (props.component.specifications?.length || 0) > props.maxVisibleSpecs
    );

    const handleClick = () => {
        if (props.clickable) {
            emit('click', props.component);
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('it-IT', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(date));
    };
</script>

<style scoped>
    .component-card {
        position: relative;
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-2xl);
        overflow: hidden;
        transition: var(--transition-medium);
        backdrop-filter: blur(var(--blur-sm));
    }

    .component-card.clickable {
        cursor: pointer;
    }

    .component-card:hover {
        transform: translateY(-4px);
        border-color: rgba(var(--color-primary-rgb), 0.4);
        box-shadow: 0 16px 40px rgba(var(--color-primary-rgb), 0.2);
        background: rgba(var(--color-surface-dark-rgb), 0.8);
    }

    .component-card:hover .card-glow {
        opacity: var(--opacity-100);
    }

    .card-glow {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
        opacity: 0;
        transition: var(--transition-medium);
    }

    /* Premium Header */
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-5) var(--space-6);
        background: rgba(var(--color-surface-dark-rgb), 0.4);
        border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
    }

    .category-badge {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        background: rgba(var(--color-primary-rgb), 0.15);
        padding: var(--space-2) var(--space-4);
        border-radius: var(--radius-lg);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary-light);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
    }

    .category-icon {
        font-size: var(--font-size-md);
    }

    .card-actions {
        display: flex;
        gap: var(--space-2);
    }

    .action-btn {
        width: 40px;
        height: 40px;
        background: rgba(var(--color-primary-rgb), 0.1);
        border: none;
        border-radius: var(--radius-full);
        color: var(--color-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-fast);
        font-size: var(--font-size-sm);
    }

    .action-btn:hover {
        background: var(--color-primary);
        color: var(--color-white);
        transform: translateY(-1px);
    }

    .action-btn.danger {
        background: rgba(var(--color-error-rgb), 0.1);
        color: var(--color-error);
        transform: translateY(-1px);
    }

    .action-btn.danger:hover {
        background: var(--color-error);
        color: var(--color-white);
    }

    /* Premium Content */
    .card-content {
        padding: var(--space-6);
    }

    .component-identity {
        display: flex;
        align-items: flex-start;
        gap: var(--space-4);
        margin-bottom: var(--space-6);
    }

    .component-thumbnail {
        width: 60px;
        height: 60px;
        border-radius: var(--radius-lg);
        overflow: hidden;
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        flex-shrink: 0;
    }

    .component-thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .component-placeholder {
        width: 60px;
        height: 60px;
        background: rgba(var(--color-primary-rgb), 0.1);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-2xl);
        color: var(--color-primary-light);
        flex-shrink: 0;
    }

    .component-details {
        flex: 1;
        min-width: 0;
    }

    .component-name {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-2) 0;
        line-height: var(--line-height-snug);
    }

    .component-category-text {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        font-weight: var(--font-weight-medium);
    }

    /* Specifications */
    .component-specs {
        margin-bottom: var(--space-6);
    }

    .specs-header {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-3);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
    }

    .specs-container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
    }

    .spec-chip {
        background: rgba(var(--color-primary-rgb), 0.15);
        color: var(--color-primary-light);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
        line-height: 1;
    }

    .spec-overflow {
        background: rgba(var(--color-text-muted-rgb), 0.15);
        color: var(--color-text-muted);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        border: var(--border-thin) solid rgba(var(--color-text-muted-rgb), 0.3);
        line-height: 1;
    }

    /* Pricing & Actions */
    .component-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .price-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .price-label {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
        font-weight: var(--font-weight-medium);
    }

    .price-tag {
        background: linear-gradient(135deg, var(--color-success), var(--color-success-dark));
        color: var(--color-white);
        padding: var(--space-2) var(--space-4);
        border-radius: var(--radius-lg);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        box-shadow: 0 4px 12px rgba(var(--color-success-rgb), 0.3);
        line-height: 1;
    }

    .component-actions {
        display: flex;
        gap: var(--space-2);
    }

    .action-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: var(--radius-lg);
        text-decoration: none;
        transition: var(--transition-medium);
        font-size: var(--font-size-lg);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .action-link.amazon {
        background: linear-gradient(135deg, #ff9500, #e8860d);
        color: var(--color-white);
    }

    .action-link.amazon:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 8px 20px rgba(255, 149, 0, 0.4);
    }

    /* Card Footer */
    .card-bottom {
        padding: var(--space-4) var(--space-6);
        background: rgba(var(--color-surface-dark-rgb), 0.4);
        border-top: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
    }

    .creation-info {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        justify-content: center;
    }

    .date-icon {
        font-size: var(--font-size-sm);
        color: var(--color-primary-light);
    }

    /* Responsive Design */
    @media (max-width: var(--breakpoint-md)) {
        .component-identity {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: var(--space-3);
        }

        .component-footer {
            flex-direction: column;
            gap: var(--space-4);
            align-items: center;
        }

        .card-actions {
            gap: var(--space-1);
        }

        .action-btn {
            width: 32px;
            height: 32px;
            font-size: var(--font-size-sm);
        }
    }

    @media (max-width: var(--breakpoint-sm)) {
        .card-content {
            padding: var(--space-4);
        }

        .card-header {
            padding: var(--space-4);
        }

        .component-thumbnail,
        .component-placeholder {
            width: 50px;
            height: 50px;
        }

        .component-placeholder {
            font-size: var(--font-size-xl);
        }

        .component-name {
            font-size: var(--font-size-md);
        }

        .specs-container {
            gap: var(--space-1);
        }

        .spec-chip,
        .spec-overflow {
            padding: var(--space-1) var(--space-2);
        }

        .action-link {
            width: 36px;
            height: 36px;
            font-size: var(--font-size-md);
        }
    }
</style>