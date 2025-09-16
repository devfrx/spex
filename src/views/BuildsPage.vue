<template>
    <ion-page>
        <ion-content>
            <div class="builds-page">
                <!-- Background Grid Animation -->
                <div class="bg-grid"></div>
                <div class="bg-overlay"></div>

                <!-- Header -->
                <header class="page-header">
                    <div class="header-content">
                        <button @click="goBack" class="back-btn">
                            <Icon icon="mdi:arrow-left" width="24" height="24" />
                        </button>
                        <div class="header-info">
                            <h1>Build PC Collection</h1>
                            <p>Configura e gestisci i tuoi sistemi personalizzati</p>
                        </div>
                        <button @click="createNewBuild" class="create-btn">
                            <Icon icon="mdi:plus" width="20" height="20" />
                            Nuova Build
                        </button>
                    </div>
                </header>

                <!-- Stats Overview -->
                <div class="stats-section">
                    <div class="stats-container">
                        <div class="stat-card">
                            <Icon icon="mdi:desktop-tower-monitor" class="stat-icon" />
                            <div class="stat-info">
                                <span class="stat-value">{{ totalBuilds }}</span>
                                <span class="stat-label">Build Totali</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <Icon icon="mdi:currency-eur" class="stat-icon" />
                            <div class="stat-info">
                                <span class="stat-value">€{{ totalValue.toFixed(0) }}</span>
                                <span class="stat-label">Valore Totale</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <Icon icon="mdi:chart-line" class="stat-icon" />
                            <div class="stat-info">
                                <span class="stat-value">{{ avgValue.toFixed(0) }}€</span>
                                <span class="stat-label">Valore Medio</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Builds Grid -->
                <div class="builds-container">
                    <div v-if="builds.length === 0" class="empty-state">
                        <Icon icon="mdi:desktop-tower" class="empty-icon" />
                        <h3>Nessuna Build Presente</h3>
                        <p>Inizia creando la tua prima configurazione PC personalizzata</p>
                        <button @click="createNewBuild" class="cta-btn">
                            <Icon icon="mdi:plus" />
                            Crea Prima Build
                        </button>
                    </div>

                    <div v-else class="builds-grid">
                        <!-- Create Build Card -->
                        <BuildCard is-create-card @click="createNewBuild" />

                        <!-- Existing Builds -->
                        <BuildCard v-for="build in builds" :key="build.id" :build="build" @click="openBuild"
                            @edit="editBuild" @duplicate="duplicateBuild" @delete="deleteBuild" />
                    </div>
                </div>

                <!-- Create Build Modal -->
                <BaseModal v-model="showCreateModal" title="Nuova Build PC" icon="mdi:desktop-tower-monitor" size="md"
                    :confirm-disabled="!newBuildName.trim()" confirm-text="Crea Build" @confirm="confirmCreateBuild"
                    @cancel="closeCreateModal">
                    <div class="form-group">
                        <label>Nome Build</label>
                        <input v-model="newBuildName" placeholder="es. Gaming Build RTX 5070" class="form-input"
                            @keyup.enter="confirmCreateBuild" />
                    </div>

                    <div class="form-group">
                        <label>Descrizione (opzionale)</label>
                        <textarea v-model="newBuildDescription" placeholder="Descrivi la tua build personalizzata..."
                            class="form-textarea" rows="3" />
                    </div>

                    <div class="build-templates">
                        <label>Template Rapidi</label>
                        <div class="templates-grid">
                            <button v-for="template in buildTemplates" :key="template.name"
                                @click="applyTemplate(template)" class="template-btn">
                                <Icon :icon="template.icon" class="template-icon" />
                                <span>{{ template.name }}</span>
                            </button>
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
        // Implementa logica di edit inline o naviga alla pagina di edit
        const newName = prompt('Nome build:', build.name);
        if (newName && newName.trim() !== build.name) {
            try {
                await buildsStore.updateBuild(build.id, { name: newName.trim() });
            } catch (error) {
                console.error('Errore nell\'aggiornamento:', error);
            }
        }
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
        if (confirm(`Sei sicuro di voler eliminare "${build.name}"?`)) {
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
        // Calcola la percentuale basata sui componenti essenziali
        const essentialCategories = ['cpu', 'motherboard', 'memory', 'storage_primary', 'psu', 'case'];
        const presentCategories = build.components.map(c => c.category);
        const matches = essentialCategories.filter(cat => presentCategories.includes(cat as any));
        return Math.round((matches.length / essentialCategories.length) * 100);
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
    .builds-page {
        min-height: 100vh;
        background: var(--color-bg-dark);
        color: var(--color-text-dark);
        position: relative;
        overflow: hidden;
    }

    /* Background Effects */
    .bg-grid {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image:
            linear-gradient(rgba(var(--color-primary-rgb), 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--color-primary-rgb), 0.03) 1px, transparent 1px);
        background-size: 60px 60px;
        animation: gridMove 25s linear infinite;
        z-index: 1;
    }

    @keyframes gridMove {
        0% {
            transform: translate(0, 0);
        }

        100% {
            transform: translate(60px, 60px);
        }
    }

    .bg-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at 30% 20%,
                rgba(var(--color-primary-rgb), 0.15) 0%,
                transparent 50%),
            radial-gradient(circle at 70% 80%,
                rgba(var(--color-accent-rgb), 0.1) 0%,
                transparent 50%);
        z-index: 2;
    }

    /* Header */
    .page-header {
        position: relative;
        z-index: 3;
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.2);
        padding: var(--space-6);
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        max-width: 1200px;
        margin: 0 auto;
    }

    .back-btn,
    .create-btn {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-4);
        background: rgba(var(--color-primary-rgb), 0.1);
        border: 1px solid rgba(var(--color-primary-rgb), 0.3);
        border-radius: var(--radius-lg);
        color: var(--color-primary-light);
        text-decoration: none;
        transition: var(--transition-all);
        cursor: pointer;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
    }

    .back-btn:hover,
    .create-btn:hover {
        background: rgba(var(--color-primary-rgb), 0.2);
        border-color: rgba(var(--color-primary-rgb), 0.5);
        transform: translateY(-2px);
        box-shadow: var(--shadow-primary);
    }

    .header-info {
        flex: 1;
    }

    .header-info h1 {
        margin: 0 0 var(--space-1) 0;
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .header-info p {
        margin: 0;
        color: var(--color-text-muted);
        font-size: var(--font-size-sm);
    }

    /* Stats Section */
    .stats-section {
        position: relative;
        z-index: 3;
        padding: var(--space-6);
    }

    .stats-container {
        display: flex;
        gap: var(--space-4);
        max-width: 1200px;
        margin: 0 auto;
    }

    .stat-card {
        flex: 1;
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-4);
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-lg);
        backdrop-filter: blur(10px);
    }

    .stat-icon {
        font-size: 1.5rem;
        color: var(--color-accent);
    }

    .stat-info {
        display: flex;
        flex-direction: column;
    }

    .stat-value {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-dark);
        line-height: 1;
    }

    .stat-label {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
    }

    /* Builds Container */
    .builds-container {
        position: relative;
        z-index: 3;
        padding: 0 var(--space-6) var(--space-6);
        max-width: 1200px;
        margin: 0 auto;
    }

    .empty-state {
        text-align: center;
        padding: var(--space-20) var(--space-6);
    }

    .empty-icon {
        font-size: 4rem;
        color: var(--color-text-muted);
        opacity: 0.5;
        margin-bottom: var(--space-6);
    }

    .empty-state h3 {
        margin: 0 0 var(--space-2) 0;
        font-size: var(--font-size-xl);
        color: var(--color-text-dark);
    }

    .empty-state p {
        margin: 0 0 var(--space-8) 0;
        color: var(--color-text-muted);
        font-size: var(--font-size-sm);
    }

    .cta-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-6);
        background: var(--color-primary);
        color: var(--color-white);
        border: none;
        border-radius: var(--radius-lg);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: var(--transition-all);
    }

    .cta-btn:hover {
        background: var(--color-primary-light);
        transform: translateY(-2px);
        box-shadow: var(--shadow-primary);
    }

    /* Builds Grid */
    .builds-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: var(--space-4);
    }

    /* Modal */
    .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        margin-bottom: var(--space-6);
    }

    .form-input,
    .form-textarea {
        width: 100%;
        padding: var(--space-3);
        background: rgba(var(--color-primary-rgb), 0.05);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-md);
        color: var(--color-text-dark);
        font-size: var(--font-size-sm);
        transition: var(--transition-all);
    }

    .form-input:focus,
    .form-textarea:focus {
        outline: none;
        border-color: rgba(var(--color-primary-rgb), 0.5);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
    }

    .form-input::placeholder,
    .form-textarea::placeholder {
        color: var(--color-text-muted);
    }

    .build-templates label {
        display: block;
        margin-bottom: var(--space-3);
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-sm);
        color: var(--color-text-dark);
    }

    .templates-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-2);
    }

    .template-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-1);
        padding: var(--space-3);
        background: rgba(var(--color-primary-rgb), 0.05);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-md);
        color: var(--color-text-dark);
        cursor: pointer;
        transition: var(--transition-all);
        font-size: var(--font-size-xs);
    }

    .template-btn:hover {
        background: rgba(var(--color-primary-rgb), 0.1);
        border-color: rgba(var(--color-primary-rgb), 0.4);
    }

    .template-icon {
        font-size: 1.25rem;
        color: var(--color-primary);
    }

    /* Responsive */
    @media (max-width: 768px) {
        .stats-container {
            flex-direction: column;
        }

        .builds-grid {
            grid-template-columns: 1fr;
        }

        .header-content {
            flex-wrap: wrap;
            gap: var(--space-3);
        }

        .templates-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 480px) {}
</style>