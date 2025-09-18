<template>
    <ion-page>
        <ion-content>
            <div class="builds-page">
                <!-- Animated Background -->
                <div class="bg-mesh"></div>
                <div class="bg-gradient"></div>

                <!-- Premium Header -->
                <header class="page-header">
                    <div class="header-content">
                        <nav class="breadcrumb">
                            <button @click="goBack" class="breadcrumb-item">
                                <Icon icon="mdi:chevron-left" />
                                <span>Home</span>
                            </button>
                            <Icon icon="mdi:chevron-right" class="breadcrumb-separator" />
                            <span class="breadcrumb-current">Build Collection</span>
                        </nav>

                        <div class="header-main">
                            <div class="page-identity">
                                <div class="page-avatar">
                                    <Icon icon="mdi:desktop-tower-monitor" />
                                </div>
                                <div class="page-meta">
                                    <h1 class="page-name">Build PC Collection</h1>
                                    <p class="page-description">Configura e gestisci i tuoi sistemi personalizzati</p>
                                </div>
                            </div>

                            <div class="header-actions">
                                <button @click="onChooseFile()" class="action-secondary import-btn">
                                    <Icon icon="mdi:import" />
                                    <span>Import</span>
                                </button>
                                <button @click="createNewBuild" class="action-primary">
                                    <Icon icon="mdi:plus" />
                                    <span>New Build</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Main Dashboard -->
                <main class="dashboard">
                    <!-- Performance Metrics -->
                    <section class="metrics-section">
                        <div class="section-header">
                            <h2>Collection Overview</h2>
                            <div class="section-divider"></div>
                        </div>

                        <div class="metrics-grid">
                            <div class="metric-card builds">
                                <div class="metric-visual">
                                    <div class="metric-icon-wrapper">
                                        <Icon icon="mdi:desktop-tower-monitor" />
                                    </div>
                                    <div class="metric-badge">{{ totalBuilds }}</div>
                                </div>
                                <div class="metric-info">
                                    <h3>Total Builds</h3>
                                    <p>Configured systems</p>
                                </div>
                            </div>

                            <div class="metric-card budget">
                                <div class="metric-visual">
                                    <div class="metric-icon-wrapper budget-icon">
                                        <Icon icon="mdi:currency-eur" />
                                    </div>
                                    <div class="metric-badge budget-badge">€{{ totalValue.toFixed(0) }}</div>
                                </div>
                                <div class="metric-info">
                                    <h3>Total Value</h3>
                                    <p>Combined worth</p>
                                </div>
                            </div>

                            <div class="metric-card average">
                                <div class="metric-visual">
                                    <div class="metric-icon-wrapper average-icon">
                                        <Icon icon="mdi:chart-line" />
                                    </div>
                                    <div class="metric-badge average-badge">€{{ avgValue.toFixed(0) }}</div>
                                </div>
                                <div class="metric-info">
                                    <h3>Average Cost</h3>
                                    <p>Per build</p>
                                    <div class="trend-indicator positive">
                                        <Icon icon="mdi:trending-up" />
                                        <span>Professional grade</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Builds Collection -->
                    <section class="collection-section">
                        <div class="section-header">
                            <h2>Your Builds</h2>
                            <div class="section-divider"></div>
                        </div>

                        <!-- Empty State -->
                        <div v-if="builds.length === 0" class="empty-state">
                            <div class="empty-visual">
                                <Icon icon="mdi:desktop-tower" />
                            </div>
                            <div class="empty-content">
                                <h3>No builds yet</h3>
                                <p>Create your first custom PC configuration to get started</p>
                                <button @click="createNewBuild" class="empty-action">
                                    <Icon icon="mdi:plus" />
                                    Create First Build
                                </button>
                            </div>
                        </div>

                        <!-- Builds Grid -->
                        <div v-else class="builds-grid">
                            <!-- Create Build Card -->
                            <div class="build-create-card" @click="createNewBuild">
                                <div class="create-content">
                                    <div class="create-icon-wrapper">
                                        <Icon icon="mdi:plus-circle" />
                                        <div class="icon-pulse"></div>
                                    </div>
                                    <h3>New Build</h3>
                                    <p>Start a fresh configuration</p>
                                </div>
                            </div>

                            <!-- Build Cards -->
                            <div v-for="build in builds" :key="build.id" class="build-card" @click="openBuild(build)">
                                <div class="card-glow"></div>

                                <div class="card-header">
                                    <div class="build-status" :class="getBuildStatusClass(build)">
                                        <Icon :icon="getBuildStatusIcon(build)" class="status-icon" />
                                        <span class="status-text">{{ getBuildStatus(build) }}</span>
                                    </div>

                                    <div class="card-actions">
                                        <button @click.stop="exportBuild(build.id)" class="action-btn warning"
                                            title="Export">
                                            <Icon icon="mdi:export" />
                                        </button>
                                        <button @click.stop="duplicateBuild(build)" class="action-btn"
                                            title="Duplicate">
                                            <Icon icon="mdi:content-copy" />
                                        </button>
                                        <button @click.stop="editBuild(build)" class="action-btn edit" title="Edit">
                                            <Icon icon="mdi:pencil" />
                                        </button>
                                        <button @click.stop="deleteBuild(build)" class="action-btn danger"
                                            title="Delete">
                                            <Icon icon="mdi:delete" />
                                        </button>
                                    </div>
                                </div>

                                <div class="card-content">
                                    <h3 class="build-name">{{ build.name }}</h3>
                                    <p v-if="build.description" class="build-description">{{ build.description }}</p>

                                    <div class="build-metrics">
                                        <!-- <div class="metric">
                                            <Icon icon="mdi:memory" class="metric-icon" />
                                            <div class="metric-data">
                                                <span class="metric-value">{{ getTotalComponents(build) }}</span>
                                                <span class="metric-label">Components</span>
                                            </div>
                                        </div> -->

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
                                            <span class="progress-value">{{ getCompletionPercentage(build) }}%</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress-fill"
                                                :style="{ width: `${getCompletionPercentage(build)}%` }"
                                                :class="getBuildStatusClass(build)"></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="card-footer">
                                    <div class="creation-date">
                                        <Icon icon="mdi:calendar" class="date-icon" />
                                        <span>{{ formatDate(build.createdAt) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <!-- Enhanced Create Build Modal -->
                <BaseModal v-model="showCreateModal" title="Create New Build" icon="mdi:desktop-tower-monitor" size="lg"
                    :confirm-disabled="!newBuildName.trim()" confirm-text="Create Build" @confirm="confirmCreateBuild"
                    @cancel="closeCreateModal">

                    <div class="modal-form-container">
                        <div class="form-section">
                            <div class="form-field">
                                <label class="field-label">
                                    <Icon icon="mdi:tag-outline" />
                                    Build Name
                                </label>
                                <input v-model="newBuildName" placeholder="e.g. Gaming Build RTX 5070"
                                    class="field-input premium" @keyup.enter="confirmCreateBuild" />
                            </div>

                            <div class="form-field">
                                <label class="field-label">
                                    <Icon icon="mdi:text" />
                                    Description (Optional)
                                </label>
                                <textarea v-model="newBuildDescription"
                                    placeholder="Describe your custom PC configuration..."
                                    class="field-textarea premium" rows="3" />
                            </div>

                            <div class="form-field">
                                <label class="field-label">
                                    <Icon icon="mdi:lightning-bolt" />
                                    Quick Templates
                                </label>
                                <div class="templates-grid">
                                    <button v-for="template in buildTemplates" :key="template.name"
                                        @click="applyTemplate(template)" class="template-card">
                                        <div class="template-icon-wrapper">
                                            <Icon :icon="template.icon" />
                                        </div>
                                        <div class="template-info">
                                            <h4>{{ template.name }}</h4>
                                            <p>{{ template.description }}</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </BaseModal>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue';
    import { useRouter } from 'vue-router';
    import { IonPage, IonContent } from '@ionic/vue';
    import { useBuildsStore } from '@/stores/useBuildsStore';
    import { PCBuild } from '@/interfaces/builds';
    import BuildCard from '@/components/BuildCard.vue';
    import BaseModal from '@/components/BaseModal.vue';
    import { exportBuild } from '@/composables/buildJsonExport';
    import { pickAndImportBuild } from '@/composables/buildJsonImport';
    import { useAlert } from '@/composables/alertManager';

    const { success, warning, error, confirm } = useAlert();
    const router = useRouter();
    const buildsStore = useBuildsStore();

    // State
    const showCreateModal = ref(false);
    const newBuildName = ref('');
    const newBuildDescription = ref('');


    // Build templates
    const buildTemplates = [
        { name: 'Gaming', icon: 'mdi:gamepad-variant', description: 'Build gaming' },
        { name: 'Workstation', icon: 'mdi:desktop-tower', description: 'Build professionale' },
        { name: 'Budget', icon: 'mdi:currency-eur', description: 'Build economica' },
        { name: 'Custom', icon: 'mdi:cog', description: 'Build personalizzata' }
    ];

    // Computed
    const builds = computed(() => buildsStore.builds);
    const totalBuilds = computed(() => buildsStore.totalBuilds);

    const totalValue = computed(() =>
        builds.value.reduce((sum, build) => sum + build.totalPrice, 0)
    );

    const avgValue = computed(() =>
        totalBuilds.value > 0 ? totalValue.value / totalBuilds.value : 0
    );

    // Methods
    const goBack = () => {
        router.push('/home');
    };

    const createNewBuild = () => {
        showCreateModal.value = true;
        newBuildName.value = '';
        newBuildDescription.value = '';
    };

    const closeCreateModal = () => {
        showCreateModal.value = false;
    };

    const confirmCreateBuild = async () => {
        if (!newBuildName.value.trim()) return;

        try {
            const build = await buildsStore.createBuild(
                newBuildName.value.trim(),
                newBuildDescription.value.trim() || undefined
            );

            showCreateModal.value = false;
            router.push(`/builds/${build.id}`);
        } catch (error) {
            console.error('Errore nella creazione della build:', error);
        }
    };

    const openBuild = (build?: PCBuild) => {
        if (!build) return;
        buildsStore.setCurrentBuild(build);
        router.push(`/builds/${build.id}`);
    };

    const editBuild = async (build: PCBuild) => {
        router.push(`/builds/${build.id}/edit`);
    };

    const duplicateBuild = async (build: PCBuild) => {
        try {
            await buildsStore.createBuild(
                `${build.name} (Copia)`,
                build.description
            );
        } catch (error) {
            console.error('Errore nella duplicazione:', error);
        }
    };

    const deleteBuild = async (build: PCBuild) => {
        const confirmDelete = await confirm(`Sei sicuro di voler eliminare la build "${build.name}"? Questa azione non può essere annullata.`);
        if (confirmDelete) {
            try {
                await buildsStore.deleteBuild(build.id);
            } catch (error) {
                console.error('Errore nell\'eliminazione:', error);
            }
        }
    };

    const applyTemplate = (template: any) => {
        newBuildName.value = `${template.name} Build`;
        newBuildDescription.value = template.description;
    };

    const getBuildStatus = (build: PCBuild) => {
        const completion = getCompletionPercentage(build);
        if (completion === 100) return 'Completa';
        if (completion >= 70) return 'Quasi Pronta';
        if (completion >= 30) return 'In Progresso';
        return 'Iniziata';
    };

    const getBuildStatusIcon = (build: PCBuild) => {
        const completion = getCompletionPercentage(build);
        if (completion === 100) return 'mdi:check-circle';
        if (completion >= 70) return 'mdi:clock-outline';
        if (completion >= 30) return 'mdi:play-circle-outline';
        return 'mdi:circle-outline';
    };

    const getBuildStatusClass = (build: PCBuild) => {
        const completion = getCompletionPercentage(build);
        if (completion === 100) return 'status-complete';
        if (completion >= 70) return 'status-almost';
        if (completion >= 30) return 'status-progress';
        return 'status-started';
    };

    const getCompletionPercentage = (build: PCBuild) => {
        // Componenti essenziali da considerare (valori corrispondono a ComponentCategory)
        const essentialCategories = ['cpu', 'motherboard', 'memory', 'storage_primary', 'psu', 'case'];

        if (!build || !build.componentsByCategory) return 0;

        // Otteniamo solo le categorie effettivamente popolate nella build
        const presentCategories = Object.entries(build.componentsByCategory)
            .filter(([_, arr]) => Array.isArray(arr) && arr.length > 0)
            .map(([key]) => key);

        const matches = essentialCategories.filter(cat => presentCategories.includes(cat));
        return Math.round((matches.length / essentialCategories.length) * 100);
    };


    async function onChooseFile() {
        try {
            const ok = await pickAndImportBuild();
            if (ok) {
                await success('Build imported successfully!', 'Import Complete');
            } else {
                await warning('Import cancelled or no valid build found.', 'Import Cancelled');
            }
        } catch (err) {
            console.error('Import error:', err);
            await error('An error occurred during import. Please check the file format and try again.');
        }
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('it-IT', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(date));
    };
</script>

<style scoped>
    .builds-page {
        min-height: 100vh;
        background: var(--color-bg-dark);
        color: var(--color-text-dark);
        position: relative;
        overflow-x: hidden;
    }

    /* Premium Background Effects */
    .bg-mesh {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image:
            radial-gradient(circle at 25% 25%, rgba(var(--color-primary-rgb), 0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(var(--color-accent-rgb), 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(var(--color-info-rgb), 0.1) 0%, transparent 70%);
        z-index: var(--z-base);
    }

    .bg-gradient {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:
            linear-gradient(135deg, rgba(var(--color-surface-dark-rgb), 0.95) 0%, rgba(var(--color-bg-dark-rgb), 0.98) 100%);
        backdrop-filter: blur(var(--blur-lg));
        z-index: calc(var(--z-base) + 1);
    }

    /* Premium Header */
    .page-header {
        position: sticky;
        top: 0;
        z-index: var(--z-sticky);
        background: rgba(var(--color-bg-dark-rgb), 0.85);
        backdrop-filter: blur(var(--blur-lg));
        border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        padding: var(--space-8) 0;
    }

    .header-content {
        position: relative;
        z-index: calc(var(--z-base) + 2);
        max-width: var(--container-2xl);
        margin: 0 auto;
        padding: 0 var(--space-8);
    }

    .breadcrumb {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-6);
        font-size: var(--font-size-sm);
    }

    .breadcrumb-item {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) 0;
        background: none;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
        transition: var(--transition-fast);
        text-decoration: none;
    }

    .breadcrumb-item:hover {
        color: var(--color-text-dark);
    }

    .breadcrumb-separator {
        color: var(--color-secondary-500);
        font-size: var(--font-size-md);
    }

    .breadcrumb-current {
        color: var(--color-primary);
        font-weight: var(--font-weight-medium);
    }

    .header-main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-8);
    }

    .page-identity {
        display: flex;
        align-items: center;
        gap: var(--space-6);
        flex: 1;
    }

    .page-avatar {
        width: var(--space-16);
        height: var(--space-16);
        background: var(--gradient-primary);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-3xl);
        color: var(--color-white);
        box-shadow: 0 10px 25px rgba(var(--color-primary-rgb), 0.3);
    }

    .page-meta {
        flex: 1;
    }

    .page-name {
        font-size: var(--font-size-4xl);
        font-weight: var(--font-weight-bold);
        margin: 0 0 var(--space-2) 0;
        background: linear-gradient(135deg, var(--color-text-dark), var(--color-text-muted));
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: var(--line-height-tight);
    }

    .page-description {
        font-size: var(--font-size-md);
        color: var(--color-text-muted);
        margin: 0;
        line-height: var(--line-height-normal);
    }

    .header-actions {
        display: flex;
        gap: var(--space-4);
    }

    .action-primary {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-6);
        background: var(--gradient-primary);
        border: none;
        border-radius: var(--radius-lg);
        color: var(--color-white);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: var(--transition-medium);
        box-shadow: var(--shadow-primary);
    }

    .action-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.5);
    }

    .action-secondary {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-6);
        background: var(--color-warning);
        border: var(--border-thin) solid rgba(var(--color-warning-rgb), 0.2);
        border-radius: var(--radius-lg);
        color: var(--color-text-dark);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: var(--transition-medium);
        box-shadow: 0 4px 12px rgba(var(--color-accent-rgb), 0.1);
    }

    .action-secondary:hover {
        transform: translateY(-2px);
        border-color: rgba(var(--color-primary-rgb), 0.4);
        box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.3);
    }

    .action-secondary.import-btn {
        background: var(--color-success);
        border-color: rgba(var(--color-success-rgb), 0.2);
        color: var(--color-white);
    }

    .action-secondary.import-btn:hover {
        border-color: rgba(var(--color-success-rgb), 0.4);
        box-shadow: 0 8px 25px rgba(var(--color-success-rgb), 0.3);
    }

    /* Dashboard Layout */
    .dashboard {
        position: relative;
        z-index: calc(var(--z-base) + 2);
        max-width: var(--container-2xl);
        margin: 0 auto;
        padding: var(--space-12) var(--space-8);
    }

    /* Section Headers */
    .section-header {
        display: flex;
        align-items: center;
        gap: var(--space-6);
        margin-bottom: var(--space-10);
    }

    .section-header h2 {
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-dark);
        margin: 0;
    }

    .section-divider {
        flex: 1;
        height: 2px;
        background: linear-gradient(90deg, rgba(var(--color-primary-rgb), 0.6), transparent);
        border-radius: var(--radius-full);
    }

    /* Premium Metrics */
    .metrics-section {
        margin-bottom: var(--space-16);
    }

    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: var(--space-8);
    }

    .metric-card {
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-2xl);
        padding: var(--space-8);
        display: flex;
        align-items: center;
        gap: var(--space-6);
        transition: var(--transition-medium);
        backdrop-filter: blur(var(--blur-sm));
        position: relative;
        overflow: hidden;
    }

    .metric-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--gradient-primary);
        opacity: var(--opacity-80);
    }

    .metric-card:hover {
        transform: translateY(-4px);
        border-color: rgba(var(--color-primary-rgb), 0.4);
        box-shadow: 0 20px 40px rgba(var(--color-primary-rgb), 0.2);
    }

    .metric-card.budget::before {
        background: linear-gradient(90deg, var(--color-success-dark), var(--color-success));
    }

    .metric-card.average::before {
        background: linear-gradient(90deg, var(--color-info), var(--color-accent));
    }

    .metric-visual {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .metric-icon-wrapper {
        width: 60px;
        height: 60px;
        background: rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-3xl);
        color: var(--color-primary);
    }

    .metric-icon-wrapper.budget-icon {
        background: rgba(var(--color-success-rgb), 0.2);
        color: var(--color-success);
    }

    .metric-icon-wrapper.average-icon {
        background: rgba(var(--color-info-rgb), 0.2);
        color: var(--color-info);
    }

    .metric-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: var(--color-primary);
        color: var(--color-white);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-lg);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.4);
    }

    .metric-badge.budget-badge {
        background: var(--color-success);
        box-shadow: 0 4px 12px rgba(var(--color-success-rgb), 0.4);
    }

    .metric-badge.average-badge {
        background: var(--color-info);
        box-shadow: 0 4px 12px rgba(var(--color-info-rgb), 0.4);
    }

    .metric-info {
        flex: 1;
    }

    .metric-info h3 {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-2) 0;
    }

    .metric-info p {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin: 0;
    }

    .trend-indicator {
        display: flex;
        align-items: center;
        gap: var(--space-1);
        margin-top: var(--space-2);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
    }

    .trend-indicator.positive {
        background: rgba(var(--color-success-rgb), 0.2);
        color: var(--color-success);
    }

    /* Collection Section */
    .collection-section {
        margin-bottom: var(--space-16);
    }

    /* Empty State */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--space-16) var(--space-8);
        text-align: center;
    }

    .empty-visual {
        width: 120px;
        height: 120px;
        background: rgba(var(--color-primary-rgb), 0.1);
        border-radius: var(--radius-2xl);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-6xl);
        color: var(--color-secondary-500);
        margin-bottom: var(--space-8);
    }

    .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        max-width: 500px;
    }

    .empty-content h3 {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-3) 0;
    }

    .empty-content p {
        font-size: var(--font-size-md);
        color: var(--color-text-muted);
        margin: 0 0 var(--space-8) 0;
        line-height: var(--line-height-relaxed);
        max-width: 400px;
    }

    .empty-action {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-4) var(--space-8);
        background: var(--gradient-primary);
        border: none;
        border-radius: var(--radius-lg);
        color: var(--color-white);
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-md);
        cursor: pointer;
        transition: var(--transition-medium);
        box-shadow: var(--shadow-primary);
    }

    .empty-action:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.4);
    }

    /* Builds Grid */
    .builds-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: var(--space-6);
    }

    /* Create Build Card */
    .build-create-card {
        background: rgba(var(--color-surface-dark-rgb), 0.4);
        border: 2px dashed rgba(var(--color-primary-rgb), 0.3);
        border-radius: var(--radius-2xl);
        padding: var(--space-8);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: var(--transition-medium);
        min-height: 280px;
    }

    .build-create-card:hover {
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border-color: rgba(var(--color-primary-rgb), 0.5);
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(var(--color-primary-rgb), 0.15);
    }

    .create-content {
        text-align: center;
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
        margin: 0 auto var(--space-6) auto;
        font-size: var(--font-size-5xl);
        color: var(--color-primary);
    }

    .icon-pulse {
        position: absolute;
        inset: -4px;
        background: linear-gradient(45deg, var(--color-primary), var(--color-accent));
        border-radius: var(--radius-xl);
        opacity: 0;
        z-index: -1;
        animation: iconPulse 2s ease-in-out infinite;
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
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-2) 0;
    }

    .create-content p {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin: 0;
    }

    /* Build Cards */
    .build-card {
        position: relative;
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-2xl);
        overflow: hidden;
        cursor: pointer;
        transition: var(--transition-medium);
        backdrop-filter: blur(var(--blur-sm));
    }

    .build-card:hover {
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border-color: rgba(var(--color-primary-rgb), 0.4);
        transform: translateY(-4px);
        box-shadow: 0 16px 40px rgba(var(--color-primary-rgb), 0.2);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-5);
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

    .build-status.status-complete {
        background: rgba(var(--color-success-rgb), 0.2);
        color: var(--color-success);
    }

    .build-status.status-almost {
        background: rgba(var(--color-warning-rgb), 0.2);
        color: var(--color-warning);
    }

    .build-status.status-progress {
        background: rgba(var(--color-info-rgb), 0.2);
        color: var(--color-info);
    }

    .build-status.status-started {
        background: rgba(var(--color-secondary-rgb), 0.2);
        color: var(--color-secondary);
    }

    .status-icon {
        font-size: 1rem;
    }

    .card-actions {
        display: flex;
        gap: var(--space-1);
    }

    .action-btn {
        width: 32px;
        height: 32px;
        background: rgba(var(--color-primary-rgb), 0.1);
        border: none;
        border-radius: var(--radius-md);
        color: var(--color-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-fast);
        font-size: var(--font-size-sm);
    }

    .action-btn:hover {
        transform: translateY(-1px);
    }

    .action-btn.edit {
        background: rgba(var(--color-info-rgb), 0.1);
        color: var(--color-info);
    }

    .action-btn.edit:hover {
        background: var(--color-info);
        color: var(--color-white);
    }

    .action-btn:hover {
        background: var(--color-primary);
        color: var(--color-white);
    }

    .action-btn.warning {
        background: rgba(var(--color-warning-rgb), 0.1);
        color: var(--color-warning);
    }

    .action-btn.warning:hover {
        background: var(--color-warning);
        color: var(--color-white);
    }

    .action-btn.danger {
        background: rgba(var(--color-error-rgb), 0.1);
        color: var(--color-error);
    }

    .action-btn.danger:hover {
        background: var(--color-error);
        color: var(--color-white);
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
        margin: var(--space-4) 0;
    }

    .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-2);
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
        border-top: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
    }

    .creation-date {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        justify-content: flex-end;
    }

    .date-icon {
        font-size: 0.875rem;
    }

    /* Enhanced Modal Styles */
    .modal-form-container {
        padding: var(--space-4);
    }

    .form-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
    }

    .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }

    .field-label {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-sm);
        color: var(--color-text-dark);
    }

    .field-label svg {
        font-size: var(--font-size-md);
        color: var(--color-primary);
    }

    .field-input,
    .field-textarea {
        width: 100%;
        padding: var(--space-4) var(--space-5);
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
        border-radius: var(--radius-lg);
        color: var(--color-text-dark);
        font-size: var(--font-size-sm);
        transition: var(--transition-medium);
        backdrop-filter: blur(var(--blur-sm));
        resize: vertical;
    }

    .field-input.premium,
    .field-textarea.premium {
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border: var(--border-2) solid rgba(var(--color-primary-rgb), 0.4);
    }

    .field-input:focus,
    .field-textarea:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
        background: rgba(var(--color-surface-dark-rgb), 0.9);
    }

    .field-input::placeholder,
    .field-textarea::placeholder {
        color: var(--color-text-muted);
    }

    /* Templates Grid */
    .templates-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: var(--space-3);
    }

    .template-card {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-4);
        background: rgba(var(--color-primary-rgb), 0.08);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: var(--transition-all);
        text-align: left;
    }

    .template-card:hover {
        background: rgba(var(--color-primary-rgb), 0.15);
        border-color: rgba(var(--color-primary-rgb), 0.4);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.2);
    }

    .template-icon-wrapper {
        width: 40px;
        height: 40px;
        background: rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-lg);
        color: var(--color-primary);
        flex-shrink: 0;
    }

    .template-info {
        flex: 1;
        min-width: 0;
    }

    .template-info h4 {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-1) 0;
    }

    .template-info p {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        margin: 0;
        line-height: var(--line-height-tight);
    }

    /* Responsive Design */
    @media (max-width: var(--breakpoint-lg)) {
        .dashboard {
            padding: var(--space-8) var(--space-6);
        }

        .metrics-grid {
            grid-template-columns: 1fr;
        }

        .header-main {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-6);
        }

        .page-identity {
            width: 100%;
        }

        .builds-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }
    }

    @media (max-width: var(--breakpoint-md)) {

        .header-content,
        .dashboard {
            padding-left: var(--space-4);
            padding-right: var(--space-4);
        }

        .breadcrumb {
            margin-bottom: var(--space-4);
        }

        .page-avatar {
            width: 48px;
            height: 48px;
            font-size: var(--font-size-2xl);
        }

        .page-name {
            font-size: var(--font-size-2xl);
        }

        .action-primary span {
            display: none;
        }

        .builds-grid {
            grid-template-columns: 1fr;
        }

        .templates-grid {
            grid-template-columns: 1fr;
        }

        .build-metrics {
            flex-direction: column;
            gap: var(--space-3);
        }
    }

    @media (max-width: var(--breakpoint-sm)) {
        .metrics-grid {
            gap: var(--space-4);
        }

        .metric-card {
            padding: var(--space-6);
        }

        .empty-visual {
            width: 80px;
            height: 80px;
            font-size: var(--font-size-4xl);
        }

        .empty-content h3 {
            font-size: var(--font-size-xl);
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
</style>