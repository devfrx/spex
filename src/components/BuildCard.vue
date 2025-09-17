<template>
    <!-- Mantieni la stessa template ma aggiorna la metrica dei componenti -->
    <div class="build-card" :class="{
        'create-card': isCreateCard,
        'clickable': clickable
    }" @click="handleClick">
        <div class="card-glow"></div>

        <!-- Create Card Content -->
        <div v-if="isCreateCard" class="create-content">
            <div class="create-icon-wrapper">
                <Icon icon="mdi:plus" class="create-icon" />
                <div class="icon-pulse"></div>
            </div>
            <h3>{{ createTitle || 'Nuova Build' }}</h3>
            <p>{{ createDescription || 'Crea una configurazione personalizzata' }}</p>
        </div>

        <!-- Regular Build Card Content -->
        <template v-else-if="build">
            <div class="card-header">
                <div class="build-status">
                    <Icon :icon="buildStatusIcon" class="status-icon" :class="buildStatusClass" />
                    <span class="status-text">{{ buildStatusText }}</span>
                </div>
                <div class="card-actions" v-if="showActions">
                    <button v-if="canEdit" @click.stop="$emit('edit', build)" class="action-btn" title="Modifica">
                        <Icon icon="mdi:pencil" />
                    </button>
                    <button v-if="canDuplicate" @click.stop="$emit('duplicate', build)" class="action-btn"
                        title="Duplica">
                        <Icon icon="mdi:content-copy" />
                    </button>
                    <button v-if="canDelete" @click.stop="$emit('delete', build)" class="action-btn danger"
                        title="Elimina">
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
                        <span class="metric-value">{{ totalComponentsCount }}</span>
                        <span class="metric-label">Componenti</span>
                    </div>
                    <div class="metric">
                        <Icon icon="mdi:currency-eur" class="metric-icon" />
                        <span class="metric-value">€{{ build.totalPrice.toFixed(0) }}</span>
                        <span class="metric-label">Prezzo</span>
                    </div>
                </div>

                <div class="progress-section">
                    <div class="progress-info">
                        <span class="progress-label">Completamento</span>
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
        if (completion === 100) return 'Completa';
        if (completion >= 70) return 'Quasi Pronta';
        if (completion > 0) return 'In Progresso';
        return 'Iniziata';
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
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-xl);
        overflow: hidden;
        transition: var(--transition-all);
        backdrop-filter: blur(20px);
    }

    .build-card.clickable {
        cursor: pointer;
    }

    .build-card:hover {
        transform: translateY(-8px);
        border-color: rgba(var(--color-primary-rgb), 0.4);
        box-shadow: 0 20px 40px rgba(var(--color-primary-rgb), 0.2);
    }

    .build-card:hover .card-glow {
        opacity: 1;
    }

    .build-card:hover .icon-pulse {
        animation: iconPulse 1s ease-in-out infinite;
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
        min-height: 200px;
    }

    .create-icon-wrapper {
        position: relative;
        padding: var(--space-4);
        background: rgba(var(--color-primary-rgb), 0.1);
        border-radius: var(--radius-lg);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        margin-bottom: var(--space-4);
    }

    .create-icon {
        font-size: 2rem;
        color: var(--color-primary);
        display: block;
    }

    .icon-pulse {
        position: absolute;
        inset: -2px;
        background: linear-gradient(45deg, var(--color-primary), var(--color-accent));
        border-radius: var(--radius-lg);
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
            transform: scale(1.05);
        }
    }

    .create-content h3 {
        margin: 0 0 var(--space-2) 0;
        font-size: var(--font-size-lg);
        color: var(--color-primary);
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
        padding: var(--space-4);
        border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1);
    }

    .build-status {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-1) var(--space-3);
        background: rgba(var(--color-primary-rgb), 0.1);
        border-radius: var(--radius-full);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
    }

    .status-icon {
        font-size: 0.875rem;
    }

    .status-complete {
        color: var(--color-success);
    }

    .status-almost {
        color: var(--color-warning);
    }

    .status-progress {
        color: var(--color-info);
    }

    .status-started {
        color: var(--color-text-muted);
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

    .build-name {
        margin: 0 0 var(--space-2) 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
    }

    .build-description {
        margin: 0 0 var(--space-4) 0;
        color: var(--color-text-muted);
        font-size: var(--font-size-sm);
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
        font-size: 1rem;
        color: var(--color-accent);
    }

    .metric-value {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
    }

    .metric-label {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
    }

    .build-progress {
        margin-bottom: var(--space-3);
    }

    .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-2);
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
    }

    .progress-value {
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary);
    }

    .progress-bar {
        height: 4px;
        background: rgba(var(--color-primary-rgb), 0.1);
        border-radius: var(--radius-full);
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
        border-radius: var(--radius-full);
        transition: width 1s ease-out;
    }

    .card-footer {
        padding: var(--space-4);
        border-top: 1px solid rgba(var(--color-primary-rgb), 0.1);
        display: flex;
        justify-content: flex-end;
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
        .build-metrics {
            flex-direction: column;
            gap: var(--space-2);
        }
    }
</style>