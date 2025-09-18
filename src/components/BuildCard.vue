<template>
    <div class="build-card" :class="{
        'create-card': isCreateCard,
        'clickable': clickable
    }" @click="handleClick">
        <div class="card-glow"></div>

        <!-- Create Card Content -->
        <div v-if="isCreateCard" class="create-content">
            <div class="create-icon-wrapper">
                <Icon icon="mdi:plus-circle" class="create-icon" />
                <div class="icon-pulse"></div>
            </div>
            <h3>{{ createTitle || 'New Build' }}</h3>
            <p>{{ createDescription || 'Start a fresh configuration' }}</p>
        </div>

        <!-- Regular Build Card Content -->
        <template v-else-if="build">
            <div class="card-header">
                <div class="build-status" :class="buildStatusClass">
                    <Icon :icon="buildStatusIcon" class="status-icon" />
                    <span class="status-text">{{ buildStatusText }}</span>
                </div>
                <div class="card-actions" v-if="showActions">
                    <button v-if="canEdit" @click.stop="$emit('edit', build)" class="action-btn" title="Edit">
                        <Icon icon="mdi:pencil" />
                    </button>
                    <button v-if="canDuplicate" @click.stop="$emit('duplicate', build)" class="action-btn"
                        title="Duplicate">
                        <Icon icon="mdi:content-copy" />
                    </button>
                    <button v-if="canDelete" @click.stop="$emit('delete', build)" class="action-btn danger"
                        title="Delete">
                        <Icon icon="mdi:delete" />
                    </button>
                </div>
            </div>

            <div class="card-content">
                <h3 class="build-name">{{ build.name }}</h3>
                <p v-if="build.description" class="build-description">{{ build.description }}</p>

                <div class="build-metrics">
                    <div class="metric">
                        <Icon icon="mdi:memory" class="metric-icon" />
                        <div class="metric-data">
                            <span class="metric-value">{{ totalComponentsCount }}</span>
                            <span class="metric-label">Components</span>
                        </div>
                    </div>
                    <div class="metric">
                        <Icon icon="mdi:currency-eur" class="metric-icon" />
                        <div class="metric-data">
                            <span class="metric-value">€{{ build.totalPrice.toFixed(0) }}</span>
                            <span class="metric-label">Total</span>
                        </div>
                    </div>
                </div>

                <div class="progress-section">
                    <div class="progress-info">
                        <span class="progress-label">Completion</span>
                        <span class="progress-value">{{ completionPercentage }}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: `${completionPercentage}%` }"
                            :class="buildStatusClass"></div>
                    </div>
                </div>
            </div>

            <div class="card-footer" v-if="showDate">
                <div class="creation-date">
                    <Icon icon="mdi:calendar" class="date-icon" />
                    <span>{{ formatDate(build.createdAt) }}</span>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { PCBuild } from '@/interfaces/builds';

    interface Props {
        build?: PCBuild;
        isCreateCard?: boolean;
        createTitle?: string;
        createDescription?: string;
        clickable?: boolean;
        showActions?: boolean;
        showDate?: boolean;
        canEdit?: boolean;
        canDuplicate?: boolean;
        canDelete?: boolean;
    }

    const props = withDefaults(defineProps<Props>(), {
        clickable: true,
        showActions: true,
        showDate: true,
        canEdit: true,
        canDuplicate: true,
        canDelete: true
    });

    const emit = defineEmits<{
        click: [build?: PCBuild];
        edit: [build: PCBuild];
        duplicate: [build: PCBuild];
        delete: [build: PCBuild];
    }>();

    const completionPercentage = computed(() => {
        if (!props.build) return 0;

        const essentialCategories = ['cpu', 'motherboard', 'memory', 'storage_primary', 'psu', 'case'];
        const filledCategories = essentialCategories.filter(cat => {
            const components = props.build?.componentsByCategory[cat as keyof typeof props.build.componentsByCategory];
            return components && components.length > 0;
        });

        return Math.round((filledCategories.length / essentialCategories.length) * 100);
    });

    const totalComponentsCount = computed(() => {
        if (!props.build) return 0;
        return Object.values(props.build.componentsByCategory).flat().length;
    });

    const buildStatusText = computed(() => {
        const completion = completionPercentage.value;
        if (completion === 100) return 'Complete';
        if (completion >= 70) return 'Almost Done';
        if (completion >= 30) return 'In Progress';
        return 'Getting Started';
    });

    const buildStatusIcon = computed(() => {
        const completion = completionPercentage.value;
        if (completion === 100) return 'mdi:check-circle';
        if (completion >= 70) return 'mdi:clock-outline';
        if (completion >= 30) return 'mdi:play-circle-outline';
        return 'mdi:circle-outline';
    });

    const buildStatusClass = computed(() => {
        const completion = completionPercentage.value;
        if (completion === 100) return 'status-complete';
        if (completion >= 70) return 'status-almost';
        if (completion >= 30) return 'status-progress';
        return 'status-started';
    });

    const handleClick = () => {
        if (props.clickable) {
            emit('click', props.build);
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
    .build-card {
        position: relative;
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-2xl);
        overflow: hidden;
        transition: var(--transition-medium);
        backdrop-filter: blur(var(--blur-sm));
    }

    .build-card.clickable {
        cursor: pointer;
    }

    .build-card:hover {
        transform: translateY(-4px);
        border-color: rgba(var(--color-primary-rgb), 0.4);
        box-shadow: 0 16px 40px rgba(var(--color-primary-rgb), 0.2);
        background: rgba(var(--color-surface-dark-rgb), 0.8);
    }

    .build-card:hover .card-glow {
        opacity: var(--opacity-100);
    }

    .build-card:hover .icon-pulse {
        animation: iconPulse 2s ease-in-out infinite;
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

    .create-card {
        border: 2px dashed rgba(var(--color-primary-rgb), 0.3);
        background: rgba(var(--color-primary-rgb), 0.05);
    }

    .create-card:hover {
        border-color: rgba(var(--color-primary-rgb), 0.6);
        background: rgba(var(--color-primary-rgb), 0.1);
    }

    .create-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-8);
        text-align: center;
        min-height: 280px;
    }

    .create-icon-wrapper {
        position: relative;
        width: 80px;
        height: 80px;
        background: rgba(var(--color-primary-rgb), 0.15);
        border-radius: var(--radius-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--space-6);
        font-size: var(--font-size-5xl);
        color: var(--color-primary);
    }

    .create-icon {
        font-size: var(--font-size-5xl);
        color: var(--color-primary);
        display: block;
    }

    .icon-pulse {
        position: absolute;
        inset: -4px;
        background: linear-gradient(45deg, var(--color-primary), var(--color-accent));
        border-radius: var(--radius-xl);
        opacity: 0;
        z-index: -1;
    }

    @keyframes iconPulse {

        0%,
        100% {
            opacity: 0;
            transform: scale(1);
        }

        50% {
            opacity: 0.3;
            transform: scale(1.1);
        }
    }

    .create-content h3 {
        margin: 0 0 var(--space-2) 0;
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
    }

    .create-content p {
        margin: 0;
        color: var(--color-text-muted);
        font-size: var(--font-size-sm);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-5);
        background: rgba(var(--color-surface-dark-rgb), 0.4);
        border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
    }

    .build-status {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-lg);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
    }

    .status-icon {
        font-size: 1rem;
    }

    .status-complete {
        background: rgba(var(--color-success-rgb), 0.2);
        color: var(--color-success);
    }

    .status-almost {
        background: rgba(var(--color-warning-rgb), 0.2);
        color: var(--color-warning);
    }

    .status-progress {
        background: rgba(var(--color-info-rgb), 0.2);
        color: var(--color-info);
    }

    .status-started {
        background: rgba(var(--color-secondary-rgb), 0.2);
        color: var(--color-secondary);
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
        color: var(--color-text-muted);
        cursor: pointer;
        transition: var(--transition-fast);
        font-size: var(--font-size-sm);
    }

    .action-btn:hover {
        background: rgba(var(--color-primary-rgb), 0.2);
        color: var(--color-primary);
        transform: translateY(-1px);
    }

    .action-btn.danger:hover {
        background: rgba(var(--color-error-rgb), 0.2);
        color: var(--color-error);
    }

    .card-content {
        padding: var(--space-5);
    }

    .build-name {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-2) 0;
        line-height: var(--line-height-tight);
    }

    .build-description {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin: 0 0 var(--space-4) 0;
        line-height: var(--line-height-relaxed);
    }

    .build-metrics {
        display: flex;
        gap: var(--space-4);
        margin-bottom: var(--space-4);
    }

    .metric {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        flex: 1;
    }

    .metric-icon {
        font-size: 1.125rem;
        color: var(--color-accent);
        flex-shrink: 0;
    }

    .metric-data {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .metric-value {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        line-height: 1;
    }

    .metric-label {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
    }

    .progress-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .progress-label {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
        font-weight: var(--font-weight-medium);
    }

    .progress-value {
        font-size: var(--font-size-xs);
        color: var(--color-text-dark);
        font-weight: var(--font-weight-semibold);
    }

    .progress-bar {
        width: 100%;
        height: 6px;
        background: rgba(var(--color-secondary-rgb), 0.2);
        border-radius: var(--radius-full);
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        transition: width var(--transition-slow);
        border-radius: var(--radius-full);
    }

    .progress-fill.status-complete {
        background: var(--color-success);
    }

    .progress-fill.status-almost {
        background: var(--color-warning);
    }

    .progress-fill.status-progress {
        background: var(--color-info);
    }

    .progress-fill.status-started {
        background: var(--color-secondary);
    }

    .card-footer {
        padding: var(--space-4) var(--space-5);
        background: rgba(var(--color-surface-dark-rgb), 0.4);
        border-top: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
        display: flex;
        justify-content: flex-end;
    }

    .creation-date {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
    }

    .date-icon {
        font-size: 0.875rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .build-metrics {
            flex-direction: column;
            gap: var(--space-3);
        }

        .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-3);
        }

        .card-actions {
            align-self: flex-end;
        }
    }

    @media (max-width: 640px) {
        .card-content {
            padding: var(--space-4);
        }

        .card-header {
            padding: var(--space-4);
        }

        .create-content {
            padding: var(--space-6);
            min-height: 240px;
        }

        .create-icon-wrapper {
            width: 60px;
            height: 60px;
            font-size: var(--font-size-4xl);
            margin-bottom: var(--space-4);
        }

        .create-icon {
            font-size: var(--font-size-4xl);
        }
    }
</style>