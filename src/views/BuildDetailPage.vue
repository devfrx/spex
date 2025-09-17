<template>
    <ion-page>
        <ion-content>
            <div class="build-detail-page">
                <!-- Animated Background -->
                <div class="bg-mesh"></div>
                <div class="bg-gradient"></div>

                <!-- Premium Header -->
                <header class="page-header">
                    <div class="header-content">
                        <nav class="breadcrumb">
                            <button @click="goBack" class="breadcrumb-item">
                                <Icon icon="mdi:chevron-left" />
                                <span>Builds</span>
                            </button>
                            <Icon icon="mdi:chevron-right" class="breadcrumb-separator" />
                            <span class="breadcrumb-current">{{ build?.name || 'Build Details' }}</span>
                        </nav>

                        <div class="header-main">
                            <div class="build-identity">
                                <div class="build-avatar">
                                    <Icon icon="mdi:desktop-tower" />
                                </div>
                                <div class="build-meta">
                                    <h1 class="build-name">{{ build?.name || 'Build PC' }}</h1>
                                    <p class="build-description">{{ build?.description || 'Custom PC Configuration' }}
                                    </p>
                                </div>
                            </div>

                            <div class="header-actions">
                                <button @click="showAddComponentModal = true" class="action-primary">
                                    <Icon icon="mdi:plus" />
                                    <span>Add Component</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Main Dashboard -->
                <main v-if="build" class="dashboard">
                    <!-- Performance Metrics -->
                    <section class="metrics-section">
                        <div class="section-header">
                            <h2>Build Overview</h2>
                            <div class="section-divider"></div>
                        </div>

                        <div class="metrics-grid">
                            <div class="metric-card components">
                                <div class="metric-visual">
                                    <div class="metric-icon-wrapper">
                                        <Icon icon="mdi:memory" />
                                    </div>
                                    <div class="metric-badge">{{ totalComponentsCount }}</div>
                                </div>
                                <div class="metric-info">
                                    <h3>Components</h3>
                                    <p>Installed parts</p>
                                </div>
                            </div>

                            <div class="metric-card budget">
                                <div class="metric-visual">
                                    <div class="metric-icon-wrapper budget-icon">
                                        <Icon icon="mdi:cash-multiple" />
                                    </div>
                                    <div class="metric-badge budget-badge">€{{ totalPrice.toFixed(0) }}</div>
                                </div>
                                <div class="metric-info">
                                    <h3>Total Cost</h3>
                                    <p>Current pricing</p>
                                </div>
                            </div>

                            <div class="metric-card completion">
                                <div class="metric-visual">
                                    <div class="completion-ring">
                                        <svg class="progress-circle" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" class="progress-bg" />
                                            <circle cx="50" cy="50" r="45" class="progress-bar"
                                                :stroke-dasharray="`${getCompletionPercentage * 2.827} 282.7`" />
                                        </svg>
                                        <div class="progress-label">{{ getCompletionPercentage }}%</div>
                                    </div>
                                </div>
                                <div class="metric-info">
                                    <h3>Progress</h3>
                                    <p>Build completion</p>
                                    <div class="progress-status"
                                        :class="`status-${getCompletionPercentage >= 100 ? 'complete' : getCompletionPercentage >= 75 ? 'high' : getCompletionPercentage >= 50 ? 'medium' : 'low'}`">
                                        {{ getCompletionPercentage >= 100 ? 'Complete' : getCompletionPercentage >= 75 ?
                                            'Almost Done' : getCompletionPercentage >= 50 ?
                                                'In Progress' : 'Getting Started' }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Components Catalog -->
                    <section class="catalog-section">
                        <div class="section-header">
                            <h2>Component Catalog</h2>
                            <div class="section-divider"></div>
                        </div>

                        <div class="catalog-grid">
                            <div v-for="category in allCategories" :key="category" class="category-panel">
                                <header class="panel-header">
                                    <div class="category-identity">
                                        <div class="category-icon-wrapper">
                                            <Icon :icon="getCategoryIcon(category)" />
                                        </div>
                                        <div class="category-meta">
                                            <h3>{{ getCategoryName(category) }}</h3>
                                            <span class="component-counter">
                                                {{ getComponentsByCategory(category).length }}
                                                {{ getComponentsByCategory(category).length === 1 ? 'item' : 'items' }}
                                            </span>
                                        </div>
                                    </div>

                                    <button @click="addComponentToCategory(category)" class="add-component-btn">
                                        <Icon icon="mdi:plus-circle" />
                                    </button>
                                </header>

                                <div class="panel-content">
                                    <!-- Component List -->
                                    <div v-if="getComponentsByCategory(category).length > 0" class="component-list">
                                        <div v-for="component in getComponentsByCategory(category)" :key="component.id"
                                            class="component-entry">

                                            <div class="component-thumbnail">
                                                <img v-if="component.imageUrl" :src="component.imageUrl"
                                                    :alt="component.model" />
                                                <div v-else class="thumbnail-placeholder">
                                                    <Icon icon="mdi:package-variant" />
                                                </div>
                                            </div>

                                            <div class="component-details">
                                                <div class="component-primary">
                                                    <h4 class="component-title">{{ component.model }}</h4>
                                                    <div class="price-tag">€{{ component.price.toFixed(2) }}</div>
                                                </div>

                                                <div v-if="component.specifications?.length" class="component-specs">
                                                    <div class="specs-container">
                                                        <span v-for="spec in component.specifications.slice(0, 2)"
                                                            :key="spec" class="spec-chip">
                                                            {{ spec }}
                                                        </span>
                                                        <span v-if="component.specifications.length > 2"
                                                            class="spec-overflow">
                                                            +{{ component.specifications.length - 2 }}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="component-toolbar">
                                                <a v-if="component.amazonUrl" :href="component.amazonUrl"
                                                    target="_blank" class="tool-btn external" title="View on Amazon">
                                                    <Icon icon="mdi:shopping" />
                                                </a>

                                                <button @click="editComponent(component)" class="tool-btn edit"
                                                    title="Edit component">
                                                    <Icon icon="mdi:pencil" />
                                                </button>

                                                <button @click="removeSpecificComponent(category, component)"
                                                    class="tool-btn remove" title="Remove from build">
                                                    <Icon icon="mdi:close" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Empty State -->
                                    <div v-else class="empty-state">
                                        <div class="empty-visual">
                                            <Icon :icon="getCategoryIcon(category)" />
                                        </div>
                                        <div class="empty-content">
                                            <h4>No {{ getCategoryName(category).toLowerCase() }}</h4>
                                            <p>Add your first component to get started</p>
                                            <button @click="addComponentToCategory(category)" class="empty-action">
                                                <Icon icon="mdi:plus" />
                                                Add {{ getCategoryName(category) }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <!-- Enhanced Add Component Modal -->
                <BaseModal v-model="showAddComponentModal" title="Add Component" icon="mdi:package-variant-plus"
                    size="lg"
                    :confirm-disabled="(!useExistingComponent && !productInfo) || (!useExistingComponent && !amazonUrl) || (useExistingComponent && !selectedComponent) || !selectedCategory"
                    :loading="componentsStore.loading" confirm-text="Add Component" @confirm="confirmAddComponent"
                    @cancel="closeAddModal">

                    <div class="modal-form-container">
                        <!-- Category Selection -->
                        <div class="form-section">
                            <div class="form-field">
                                <label class="field-label">
                                    <Icon icon="mdi:tag-outline" />
                                    Component Category
                                </label>
                                <select v-model="selectedCategory" class="field-select premium">
                                    <option value="">Choose category</option>
                                    <option v-for="category in allCategories" :key="category" :value="category">
                                        {{ getCategoryName(category) }}
                                    </option>
                                </select>
                            </div>

                            <!-- Source Toggle -->
                            <div class="form-field">
                                <div class="toggle-group">
                                    <label class="toggle-option" :class="{ active: !useExistingComponent }">
                                        <input type="radio" :value="false" v-model="useExistingComponent" />
                                        <div class="toggle-indicator"></div>
                                        <div class="toggle-content">
                                            <Icon icon="mdi:shopping" />
                                            <span>From Amazon</span>
                                        </div>
                                    </label>
                                    <label class="toggle-option" :class="{ active: useExistingComponent }">
                                        <input type="radio" :value="true" v-model="useExistingComponent" />
                                        <div class="toggle-indicator"></div>
                                        <div class="toggle-content">
                                            <Icon icon="mdi:database" />
                                            <span>Existing Component</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- Existing Component Selection -->
                            <div v-if="useExistingComponent" class="form-field">
                                <label class="field-label">
                                    <Icon icon="mdi:package-variant" />
                                    Select Component
                                </label>
                                <select v-model="selectedComponent" class="field-select premium">
                                    <option :value="null">Choose existing component</option>
                                    <option
                                        v-for="component in allComponents.filter(c => c.category === selectedCategory)"
                                        :key="component.id" :value="component">
                                        {{ component.model }} - €{{ component.price.toFixed(2) }}
                                    </option>
                                </select>
                            </div>

                            <!-- Amazon URL Input -->
                            <div v-if="!useExistingComponent" class="form-field">
                                <label class="field-label">
                                    <Icon icon="mdi:link" />
                                    Amazon Product URL
                                </label>
                                <div class="input-group premium">
                                    <input v-model="amazonUrl" placeholder="https://amzn.eu/d/..."
                                        class="field-input" />
                                    <button v-if="amazonUrl" @click="fetchProductInfo"
                                        :disabled="componentsStore.loading" class="input-action">
                                        <Icon :icon="componentsStore.loading ? 'mdi:loading' : 'mdi:download'"
                                            :class="{ 'loading-spin': componentsStore.loading }" />
                                    </button>
                                </div>
                            </div>

                            <!-- Product Preview -->
                            <div v-if="productInfo && !useExistingComponent" class="product-preview">
                                <div class="preview-header">
                                    <Icon icon="mdi:check-decagram" />
                                    <span>Product Detected</span>
                                </div>
                                <div class="preview-details">
                                    <div class="detail-row">
                                        <span class="detail-label">Name:</span>
                                        <span class="detail-value">{{ productInfo.title }}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Price:</span>
                                        <span class="detail-value price">€{{ productInfo.price.toFixed(2) }}</span>
                                    </div>
                                    <div v-if="productInfo.specifications?.length" class="detail-row specs">
                                        <span class="detail-label">Specs:</span>
                                        <div class="specs-preview">
                                            <span v-for="spec in productInfo.specifications.slice(0, 3)" :key="spec"
                                                class="preview-spec">
                                                {{ spec }}
                                            </span>
                                            <span v-if="productInfo.specifications.length > 3" class="spec-more">
                                                +{{ productInfo.specifications.length - 3 }} more
                                            </span>
                                        </div>
                                    </div>
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
    import { ref, computed, onMounted, watch } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { IonPage, IonContent } from '@ionic/vue';
    import { useBuildsStore } from '@/stores/useBuildsStore';
    import { useComponentsStore } from '@/stores/useComponentsStore';
    import { ComponentCategory, AmazonProductInfo, Component } from '@/interfaces/builds';
    import BaseModal from '@/components/BaseModal.vue';

    const route = useRoute();
    const router = useRouter();
    const buildsStore = useBuildsStore();
    const componentsStore = useComponentsStore();

    const showAddComponentModal = ref(false);
    const selectedCategory = ref<ComponentCategory | null>(null);
    const selectedComponent = ref<Component | null>(null);
    const useExistingComponent = ref(false);
    const amazonUrl = ref('');
    const productInfo = ref<AmazonProductInfo | null>(null);

    const buildId = computed(() => route.params.id as string);
    const build = computed(() => buildsStore.getBuildById(buildId.value));
    const totalPrice = computed(() => buildsStore.currentBuildTotalPrice);

    const allCategories = Object.values(ComponentCategory);
    const allComponents = computed(() => componentsStore.components);

    // Nuovo computed per contare tutti i componenti
    const totalComponentsCount = computed(() => {
        if (!build.value) return 0;
        return buildsStore.getAllComponents(build.value).length;
    });

    // Metodo per ottenere componenti per categoria
    const getComponentsByCategory = (category: ComponentCategory) => {
        if (!build.value) return [];
        return buildsStore.getComponentsByCategory(build.value, category);
    };

    const getCategoryName = (category: ComponentCategory) => {
        return componentsStore.getCategoryDisplayName(category);
    };

    const getCategoryIcon = (category: ComponentCategory) => {
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
        return icons[category] || 'mdi:package-variant';
    };

    const getCompletionPercentage = computed(() => {
        if (!build.value) return 0;
        const essentialCategories = [
            ComponentCategory.CPU,
            ComponentCategory.MOTHERBOARD,
            ComponentCategory.MEMORY,
            ComponentCategory.STORAGE_PRIMARY,
            ComponentCategory.PSU,
            ComponentCategory.CASE
        ];

        const filledCategories = essentialCategories.filter(cat =>
            getComponentsByCategory(cat).length > 0
        );

        return Math.round((filledCategories.length / essentialCategories.length) * 100);
    });

    const goBack = () => {
        router.push('/builds');
    };

    const fetchProductInfo = async () => {
        if (!amazonUrl.value.trim()) {
            productInfo.value = null;
            return;
        }

        try {
            productInfo.value = await componentsStore.fetchAmazonProductInfo(amazonUrl.value);
        } catch (error) {
            console.error('Errore nel recupero info prodotto:', error);
            productInfo.value = null;
        }
    };

    const addComponentToCategory = (category: ComponentCategory) => {
        selectedCategory.value = category;
        showAddComponentModal.value = true;
    };

    const closeAddModal = () => {
        showAddComponentModal.value = false;
        selectedCategory.value = null;
        amazonUrl.value = '';
        productInfo.value = null;
    };

    const confirmAddComponent = async () => {
        // require category and build, but not amazonUrl when using existing component
        if (!selectedCategory.value || !build.value) return;

        try {
            if (useExistingComponent.value) {
                if (!selectedComponent.value) return;
                await buildsStore.addComponentToBuild(build.value.id, selectedComponent.value);
                closeAddModal();
                return;
            }

            // creating from Amazon requires a URL
            if (!amazonUrl.value.trim()) return;

            const component = await componentsStore.createFromAmazonUrl(
                selectedCategory.value,
                amazonUrl.value
            );

            await buildsStore.addComponentToBuild(build.value.id, component);
            closeAddModal();
        } catch (error) {
            console.error('Errore nell\'aggiunta del componente:', error);
        }
    };

    const editComponent = async (component: Component) => {
        router.push(`/components/${component.id}/edit`);
    };

    const removeSpecificComponent = async (category: ComponentCategory, component: Component) => {
        if (!build.value) return;

        if (confirm(`Vuoi rimuovere ${component.model} dalla build?`)) {
            try {
                await buildsStore.removeSpecificComponentFromBuild(build.value.id, category, component.id);
            } catch (error) {
                console.error('Errore nella rimozione:', error);
            }
        }
    };

    onMounted(() => {
        if (build.value) {
            buildsStore.setCurrentBuild(build.value);
        }
        // Esegui migrazione se necessario
        buildsStore.migrateLegacyBuilds();
    });

    watch(amazonUrl, () => {
        productInfo.value = null;
    });
</script>

<style scoped>
    .build-detail-page {
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

    .build-identity {
        display: flex;
        align-items: center;
        gap: var(--space-6);
        flex: 1;
    }

    .build-avatar {
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

    .build-meta {
        flex: 1;
    }

    .build-name {
        font-size: var(--font-size-4xl);
        font-weight: var(--font-weight-bold);
        margin: 0 0 var(--space-2) 0;
        background: linear-gradient(135deg, var(--color-text-dark), var(--color-text-muted));
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: var(--line-height-tight);
    }

    .build-description {
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

    .metric-card.completion::before {
        background: linear-gradient(90deg, var(--color-error), var(--color-warning), var(--color-success));
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

    /* Completion Ring */
    .completion-ring {
        position: relative;
        width: 60px;
        height: 60px;
    }

    .progress-circle {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
    }

    .progress-bg {
        fill: none;
        stroke: rgba(var(--color-primary-rgb), 0.2);
        stroke-width: 4;
    }

    .progress-bar {
        fill: none;
        stroke: url(#progressGradient);
        stroke-width: 4;
        stroke-linecap: round;
        transition: stroke-dasharray var(--transition-slow);
    }

    .progress-label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
    }

    .progress-status {
        margin-top: var(--space-2);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
    }

    .progress-status.status-complete {
        background: rgba(var(--color-success-rgb), 0.2);
        color: var(--color-success);
    }

    .progress-status.status-high {
        background: rgba(var(--color-warning-rgb), 0.2);
        color: var(--color-warning);
    }

    .progress-status.status-medium {
        background: rgba(var(--color-primary-rgb), 0.2);
        color: var(--color-primary);
    }

    .progress-status.status-low {
        background: rgba(var(--color-error-rgb), 0.2);
        color: var(--color-error);
    }

    /* Component Catalog */
    .catalog-section {
        margin-bottom: var(--space-16);
    }

    .catalog-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(720px, 2fr));
        gap: var(--space-8);
    }

    .category-panel {
        background: rgba(var(--color-surface-dark-rgb), 0.4);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.15);
        border-radius: var(--radius-2xl);
        overflow: hidden;
        backdrop-filter: blur(var(--blur-sm));
        transition: var(--transition-medium);
    }

    .category-panel:hover {
        border-color: rgba(var(--color-primary-rgb), 0.3);
        box-shadow: 0 10px 30px rgba(var(--color-primary-rgb), 0.1);
    }

    .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-6) var(--space-8);
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
    }

    .category-identity {
        display: flex;
        align-items: center;
        gap: var(--space-4);
    }

    .category-icon-wrapper {
        width: 48px;
        height: 48px;
        background: rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-2xl);
        color: var(--color-primary);
    }

    .category-meta h3 {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-1) 0;
    }

    .component-counter {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
    }

    .add-component-btn {
        width: 40px;
        height: 40px;
        background: var(--gradient-primary);
        border: none;
        border-radius: var(--radius-lg);
        color: var(--color-white);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-medium);
        font-size: var(--font-size-xl);
        box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
    }

    .add-component-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(var(--color-primary-rgb), 0.4);
    }

    .panel-content {
        padding: var(--space-8);
    }

    /* Component List */
    .component-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
    }

    .component-entry {
        display: flex;
        align-items: flex-start;
        gap: var(--space-6);
        padding: var(--space-6);
        background: rgba(var(--color-bg-dark-rgb), 0.4);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
        border-radius: var(--radius-lg);
        transition: var(--transition-medium);
    }

    .component-entry:hover {
        background: rgba(var(--color-bg-dark-rgb), 0.6);
        border-color: rgba(var(--color-primary-rgb), 0.3);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }

    .component-thumbnail {
        width: 80px;
        height: 80px;
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;
    }

    .component-thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .thumbnail-placeholder {
        font-size: var(--font-size-4xl);
        color: var(--color-secondary-500);
    }

    .component-details {
        flex: 1;
        min-width: 0;
    }

    .component-primary {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-4);
        margin-bottom: var(--space-4);
    }

    .component-title {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0;
        line-height: var(--line-height-snug);
        flex: 1;
    }

    .price-tag {
        background: linear-gradient(135deg, var(--color-success), var(--color-success-dark));
        color: var(--color-white);
        padding: var(--space-2) var(--space-4);
        border-radius: var(--radius-lg);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(var(--color-success-rgb), 0.3);
    }

    .component-specs {
        margin-top: var(--space-3);
    }

    .specs-container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
    }

    .spec-chip {
        background: rgba(var(--color-primary-rgb), 0.2);
        color: var(--color-primary-light);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
    }

    .spec-overflow {
        background: rgba(var(--color-text-muted-rgb), 0.2);
        color: var(--color-text-muted);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        border: var(--border-thin) solid rgba(var(--color-text-muted-rgb), 0.3);
    }

    .component-toolbar {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    .tool-btn {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-md);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        color: var(--color-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-fast);
        text-decoration: none;
        font-size: var(--font-size-md);
    }

    .tool-btn:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
    }

    .tool-btn.external:hover {
        background: var(--color-warning);
        border-color: var(--color-warning);
        color: var(--color-white);
        box-shadow: 0 4px 12px rgba(var(--color-warning-rgb), 0.4);
    }

    .tool-btn.edit:hover {
        background: var(--color-info);
        border-color: var(--color-info);
        color: var(--color-white);
        box-shadow: 0 4px 12px rgba(var(--color-info-rgb), 0.4);
    }

    .tool-btn.remove:hover {
        background: var(--color-error);
        border-color: var(--color-error);
        color: var(--color-white);
        box-shadow: 0 4px 12px rgba(var(--color-error-rgb), 0.4);
    }

    /* Empty State */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-12) var(--space-8);
        text-align: center;
    }

    .empty-visual {
        width: 80px;
        height: 80px;
        background: rgba(var(--color-primary-rgb), 0.1);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-5xl);
        color: var(--color-secondary-500);
        margin-bottom: var(--space-6);
    }

    .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 400px;
    }

    .empty-content h4 {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-2) 0;
    }

    .empty-content p {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin: 0 0 var(--space-8) 0;
        line-height: var(--line-height-relaxed);
    }

    .empty-action {
        display: flex;
        align-items: center;
        gap: var(--space-2);
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

    .empty-action:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.4);
    }

    /* Enhanced Modal Styles */
    .modal-form-container {
        padding: var(--space-4);
    }

    .form-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-8);
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

    .field-select,
    .field-input {
        width: 100%;
        padding: var(--space-4) var(--space-5);
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
        border-radius: var(--radius-lg);
        color: var(--color-text-dark);
        font-size: var(--font-size-sm);
        transition: var(--transition-medium);
        backdrop-filter: blur(var(--blur-sm));
    }

    .field-select.premium,
    .field-input.premium {
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border: var(--border-2) solid rgba(var(--color-primary-rgb), 0.4);
    }

    .field-select:focus,
    .field-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
        background: rgba(var(--color-surface-dark-rgb), 0.9);
    }

    .field-select option {
        background: var(--color-surface-dark);
        color: var(--color-text-dark);
    }

    /* Toggle Group */
    .toggle-group {
        display: flex;
        background: rgba(var(--color-bg-dark-rgb), 0.6);
        border-radius: var(--radius-lg);
        padding: var(--space-1);
        gap: var(--space-1);
    }

    .toggle-option {
        flex: 1;
        position: relative;
        cursor: pointer;
    }

    .toggle-option input {
        position: absolute;
        opacity: 0;
        width: 100%;
        height: 100%;
        margin: 0;
    }

    .toggle-indicator {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent;
        border-radius: var(--radius-md);
        transition: var(--transition-medium);
    }

    .toggle-option.active .toggle-indicator {
        background: var(--gradient-primary);
        box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.4);
    }

    .toggle-content {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-5);
        color: var(--color-text-muted);
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-sm);
        transition: var(--transition-medium);
        z-index: var(--z-base);
    }

    .toggle-option.active .toggle-content {
        color: var(--color-white);
    }

    /* Input Group */
    .input-group.premium {
        display: flex;
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border: var(--border-2) solid rgba(var(--color-primary-rgb), 0.4);
        border-radius: var(--radius-lg);
        overflow: hidden;
        transition: var(--transition-medium);
    }

    .input-group.premium:focus-within {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
    }

    .input-group.premium .field-input {
        border: none;
        background: transparent;
        flex: 1;
    }

    .input-group.premium .field-input:focus {
        box-shadow: none;
        background: transparent;
    }

    .input-action {
        width: 48px;
        height: 48px;
        background: var(--color-primary);
        border: none;
        color: var(--color-white);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-medium);
        font-size: var(--font-size-lg);
    }

    .input-action:hover:not(:disabled) {
        background: var(--color-primary-dark);
    }

    .input-action:disabled {
        opacity: var(--opacity-60);
        cursor: not-allowed;
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

    /* Product Preview */
    .product-preview {
        background: rgba(var(--color-success-rgb), 0.1);
        border: var(--border-thin) solid rgba(var(--color-success-rgb), 0.3);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        margin-top: var(--space-4);
    }

    .preview-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-6);
        color: var(--color-success);
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-sm);
        padding-bottom: var(--space-3);
        border-bottom: var(--border-thin) solid rgba(var(--color-success-rgb), 0.2);
    }

    .preview-header svg {
        font-size: var(--font-size-xl);
    }

    .preview-details {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .detail-row {
        display: flex;
        align-items: flex-start;
        gap: var(--space-4);
    }

    .detail-row.specs {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-3);
    }

    .detail-label {
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-muted);
        min-width: 60px;
        font-size: var(--font-size-sm);
    }

    .detail-value {
        color: var(--color-text-dark);
        font-size: var(--font-size-sm);
        flex: 1;
    }

    .detail-value.price {
        color: var(--color-success);
        font-weight: var(--font-weight-bold);
    }

    .specs-preview {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
    }

    .preview-spec {
        background: rgba(var(--color-success-rgb), 0.2);
        color: var(--color-success-light);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        border: var(--border-thin) solid rgba(var(--color-success-rgb), 0.3);
    }

    .spec-more {
        background: rgba(var(--color-text-muted-rgb), 0.2);
        color: var(--color-text-muted);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        border: var(--border-thin) solid rgba(var(--color-text-muted-rgb), 0.3);
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

        .build-identity {
            width: 100%;
        }

        .component-entry {
            flex-direction: column;
            gap: var(--space-4);
        }

        .component-primary {
            flex-direction: column;
            gap: var(--space-3);
            align-items: flex-start;
        }

        .component-toolbar {
            flex-direction: row;
            align-self: flex-end;
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

        .build-avatar {
            width: 48px;
            height: 48px;
            font-size: var(--font-size-2xl);
        }

        .build-name {
            font-size: var(--font-size-2xl);
        }

        .action-primary span {
            display: none;
        }

        .panel-header {
            padding: var(--space-4) var(--space-6);
        }

        .panel-content {
            padding: var(--space-6);
        }

        .empty-state {
            padding: var(--space-8) var(--space-4);
        }

        .toggle-group {
            flex-direction: column;
        }

        .input-group.premium {
            flex-direction: column;
        }

        .input-action {
            width: 100%;
            height: 40px;
        }
    }

    @media (max-width: var(--breakpoint-sm)) {
        .metrics-grid {
            gap: var(--space-4);
        }

        .metric-card {
            padding: var(--space-6);
        }

        .component-list {
            gap: var(--space-4);
        }

        .component-entry {
            padding: var(--space-4);
        }

        .component-thumbnail {
            width: 60px;
            height: 60px;
        }
    }
</style>