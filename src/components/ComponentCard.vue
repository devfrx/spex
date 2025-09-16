<template>
    <div class="component-card" :class="{ 'clickable': clickable }" @click="handleClick">
        <div class="card-glow"></div>

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

        <div class="card-content">
            <h3 class="component-name">{{ component.model }}</h3>

            <div class="component-specs" v-if="component.specifications?.length">
                <div class="specs-list">
                    <span v-for="spec in visibleSpecs" :key="spec" class="spec-tag">
                        {{ spec }}
                    </span>
                    <span v-if="hasMoreSpecs" class="spec-more">
                        +{{ component.specifications.length - maxVisibleSpecs }}
                    </span>
                </div>
            </div>

            <div class="component-footer">
                <div class="price-section">
                    <span class="price">€{{ component.price.toFixed(2) }}</span>
                </div>

                <div class="component-actions">
                    <a v-if="component.amazonUrl" :href="component.amazonUrl" target="_blank" @click.stop
                        class="amazon-link" title="Vedi su Amazon">
                        <Icon icon="mdi:shopping" />
                    </a>
                    <slot name="custom-actions" :component="component"></slot>
                </div>
            </div>

            <div class="creation-date" v-if="showDate">
                <Icon icon="mdi:calendar" class="date-icon" />
                {{ formatDate(component.createdAt) }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
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
        maxVisibleSpecs: 2
    });

    const emit = defineEmits<{
        click: [component: Component];
        duplicate: [component: Component];
        delete: [component: Component];
    }>();

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
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-xl);
        overflow: hidden;
        transition: var(--transition-all);
        backdrop-filter: blur(20px);
    }

    .component-card.clickable {
        cursor: pointer;
    }

    .component-card:hover {
        transform: translateY(-8px);
        border-color: rgba(var(--color-primary-rgb), 0.4);
        box-shadow: 0 20px 40px rgba(var(--color-primary-rgb), 0.2);
    }

    .component-card:hover .card-glow {
        opacity: 1;
    }

    .card-glow {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
        opacity: 0;
        transition: var(--transition-opacity);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-4);
        border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1);
    }

    .category-badge {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        background: rgba(var(--color-primary-rgb), 0.1);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-full);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        color: var(--color-primary-light);
    }

    .category-icon {
        font-size: 0.875rem;
    }

    .card-actions {
        display: flex;
        gap: var(--space-1);
    }

    .action-btn {
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

    .action-btn:hover {
        background: rgba(var(--color-primary-rgb), 0.2);
        color: var(--color-primary);
    }

    .action-btn.danger:hover {
        background: rgba(var(--color-error-rgb), 0.2);
        color: var(--color-error);
    }

    .card-content {
        padding: var(--space-4);
    }

    .component-name {
        margin: 0 0 var(--space-3) 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        line-height: var(--line-height-tight);
    }

    .specs-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-1);
        margin-bottom: var(--space-3);
    }

    .spec-tag {
        background: rgba(var(--color-primary-rgb), 0.15);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        color: var(--color-primary-light);
    }

    .spec-more {
        background: rgba(var(--color-secondary-rgb), 0.1);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
    }

    .component-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-2);
    }

    .price {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-success);
    }

    .component-actions {
        display: flex;
        gap: var(--space-2);
    }

    .amazon-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: #ff9500;
        border-radius: var(--radius-md);
        color: var(--color-white);
        text-decoration: none;
        transition: var(--transition-all);
    }

    .amazon-link:hover {
        background: #e8860d;
        transform: scale(1.1);
    }

    .creation-date {
        display: flex;
        align-items: center;
        gap: var(--space-1);
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
    }

    .date-icon {
        font-size: 0.75rem;
    }

    @media (max-width: 480px) {
        .component-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
        }
    }
</style>