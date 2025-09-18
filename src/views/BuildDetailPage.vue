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
                        </div>
                    </div>
                </header>

                <!-- Main Dashboard -->
                <main v-if="build" class="dashboard">

                    <!-- Components Catalog -->
                    <section class="catalog-section">
                        <div class="section-header">
                            <h2>Component Catalog</h2>
                            <div class="section-divider"></div>
                        </div>

                        <div class="catalog-actions">
                            <div class="actions-start">
                                <button @click="exportBuild(buildId)" class="catalog-btn">
                                    <Icon icon="mdi:export" />
                                    <span class="catalog-btn-text">Export</span>
                                </button>
                                <button @click="showAddComponentModal = true" class="catalog-btn add-btn">
                                    <Icon icon="mdi:plus" />
                                    <span class="catalog-btn-text">Add Component</span>
                                </button>
                                <button v-if="hasNewComponents" @click="importNewComponents"
                                    class="catalog-btn import-new-btn">
                                    <Icon icon="mdi:import" />
                                    <span class="catalog-btn-text">Import New Components</span>
                                </button>
                            </div>
                            <div class="actions-end">
                                <button @click="clearAllComponents" class="catalog-btn remove-btn">
                                    <Icon icon="mdi:delete" />
                                    <span class="catalog-btn-text">Clear all</span>
                                </button>
                            </div>
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
                                                {{ getComponentsByCategory(category).length === 1 ? 'item' : 'items'
                                                }}
                                            </span>
                                        </div>
                                    </div>

                                    <button @click="addComponentToCategory(category)" class="add-component-btn">
                                        <Icon icon="mdi:plus-circle" />
                                    </button>
                                </header>

                                <div class="panel-content">
                                    <!-- Component Grid -->
                                    <div v-if="getComponentsByCategory(category).length > 0" class="component-grid">
                                        <div v-for="component in getComponentsByCategory(category)" :key="component.id"
                                            class="component-card">
                                            <div class="card-image">
                                                <img v-if="component.imageUrl" :src="component.imageUrl"
                                                    :alt="component.model" />
                                                <div v-else class="image-placeholder">
                                                    <Icon icon="mdi:package-variant" />
                                                </div>
                                            </div>

                                            <div class="card-content">
                                                <div class="card-header">
                                                    <h4 class="component-title">{{ component.model }}</h4>
                                                    <div class="price-badge">€{{ component.price.toFixed(0) }}</div>
                                                </div>

                                                <div v-if="component.specifications?.length" class="specs-section">
                                                    <div class="specs-list">
                                                        <span v-for="spec in component.specifications.slice(0, 2)"
                                                            :key="spec" class="spec-tag">
                                                            {{ spec }}
                                                        </span>
                                                        <span v-if="component.specifications.length > 2"
                                                            class="spec-more">
                                                            +{{ component.specifications.length - 2 }}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="card-actions">
                                                <button v-if="componentNotExists(component)"
                                                    @click="componentsStore.addComponent(component)"
                                                    class="action-btn import-btn" title="Import to library">
                                                    <Icon icon="mdi:import" />
                                                </button>

                                                <a v-if="component.amazonUrl" :href="component.amazonUrl"
                                                    target="_blank" class="action-btn external-btn"
                                                    title="View on Amazon">
                                                    <Icon icon="mdi:shopping" />
                                                </a>

                                                <button @click="editComponent(component)" class="action-btn edit-btn"
                                                    title="Edit component">
                                                    <Icon icon="mdi:pencil" />
                                                </button>

                                                <button @click="removeSpecificComponent(category, component)"
                                                    class="action-btn remove-btn" title="Remove from build">
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
                                    <input v-model.trim="amazonUrl" placeholder="https://amzn.eu/d/..."
                                        @input="onAmazonInput" class="field-input" aria-label="Amazon product URL" />
                                </div>
                            </div>
                            <Icon v-if="componentsStore.loading" icon="mdi:loading" class="loading-spin" />

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
    import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { IonPage, IonContent } from '@ionic/vue';
    import { useBuildsStore } from '@/stores/useBuildsStore';
    import { useComponentsStore } from '@/stores/useComponentsStore';
    import { ComponentCategory, AmazonProductInfo, Component } from '@/interfaces/builds';
    import BaseModal from '@/components/BaseModal.vue';
    import { exportBuild } from '@/composables/buildJsonExport';
    import { useAlert } from '@/composables/alertManager';

    const { success, warning, error, confirm } = useAlert();
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
    // debounce + request-sequencing to avoid race conditions
    let debounceTimer: number | null = null;
    let fetchSeq = 0; // increasing sequence id for requests

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

    const componentNotExists = computed(() => {
        return (component: Component) => !componentsStore.getComponentById(component.id);
    });

    const hasNewComponents = computed(() => {
        if (!build.value) return false;
        const components = buildsStore.getAllComponents(build.value);
        return components.some(component => componentNotExists.value(component));
    });

    const clearAllComponents = async () => {
        if (!build.value) return;

        const confirmed = await confirm('Are you sure you want to remove all components from this build?');

        if (confirmed) {
            try {
                await buildsStore.clearAllComponentsFromBuild(build.value.id);
                success('All components removed from the build.');
            } catch (err) {
                console.error('Error clearing components:', err);
                error('Failed to clear components. Please try again.');
            }
        }
    };

    const importNewComponents = async () => {
        if (!build.value) return;

        const confirmed = await confirm('Import all new components from this build into your library?');

        if (confirmed) {
            try {
                const components = buildsStore.getAllComponents(build.value);
                for (const component of components) {
                    if (componentNotExists.value(component)) {
                        componentsStore.addComponent(component);
                    }
                }
                success('All new components imported successfully!');
            } catch (err) {
                console.error('Error importing components:', err);
                error('Failed to import components. Please try again.');
            }
        }
    };

    // const fetchProductInfo = async () => {
    //     if (!amazonUrl.value.trim()) {
    //         productInfo.value = null;
    //         return;
    //     }

    //     try {
    //         productInfo.value = await componentsStore.fetchAmazonProductInfo(amazonUrl.value);
    //     } catch (error) {
    //         console.error('Errore nel recupero info prodotto:', error);
    //         productInfo.value = null;
    //     }
    // };

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

        const confirmed = await confirm(`Remove ${component.model} from the build?`);

        if (confirmed) {
            try {
                await buildsStore.removeSpecificComponentFromBuild(build.value.id, category, component.id);
            } catch (error) {
                console.error('Errore nella rimozione:', error);
            }
        }
    };

    const onAmazonInput = () => {
        // clear previous preview immediately
        productInfo.value = null;

        // reset debounce
        if (debounceTimer) {
            window.clearTimeout(debounceTimer);
            debounceTimer = null;
        }

        const url = amazonUrl.value?.trim();
        if (!url) return;

        // debounce time (ms)
        debounceTimer = window.setTimeout(async () => {
            // increment sequence id for this request
            const mySeq = ++fetchSeq;

            // avoid firing while a store-level fetch is already running
            if (componentsStore.loading) return;

            try {
                const info = await componentsStore.fetchAmazonProductInfo(url);

                // ignore if a newer request started meanwhile
                if (mySeq !== fetchSeq) return;

                productInfo.value = info;
            } catch (err) {
                // ignore stale errors; only clear preview for current seq
                if (mySeq !== fetchSeq) return;
                console.error('Errore nel recupero info prodotto:', err);
                productInfo.value = null;
            } finally {
                debounceTimer = null;
            }
        }, 600);
    };

    onBeforeUnmount(() => {
        if (debounceTimer) window.clearTimeout(debounceTimer);
    });

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

    .catalog-actions {
        display: flex;
        gap: var(--space-4);
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-6);
    }

    .actions-start {
        display: flex;
        gap: var(--space-4);
        flex-wrap: wrap;
        align-items: stretch;
        justify-content: flex-start;
        flex: 1;
    }

    .actions-end {
        display: flex;
        gap: var(--space-4);
        flex-wrap: wrap;
        align-items: stretch;
        justify-content: flex-end;
        flex: 1;
    }

    .catalog-btn {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-4) var(--space-6);
        background: var(--color-primary);
        border: none;
        border-radius: var(--radius-md);
        color: var(--color-white);
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: var(--transition-fast);
    }

    .catalog-btn:hover {
        box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.4);
        transform: translateY(-2px);
    }

    .catalog-btn.add-btn {
        background: var(--color-success);
    }

    .catalog-btn.add-btn:hover {
        background: var(--color-success-dark);
        box-shadow: 0 6px 20px rgba(var(--color-success-rgb), 0.4);
        transform: translateY(-2px);
    }

    .catalog-btn.import-new-btn {
        background: var(--color-warning);
    }

    .catalog-btn.import-new-btn:hover {
        background: var(--color-warning-dark);
        box-shadow: 0 6px 20px rgba(var(--color-warning-rgb), 0.4);
        transform: translateY(-2px);
    }

    .catalog-btn.remove-btn {
        background: var(--color-error);
    }

    .catalog-btn.remove-btn:hover {
        background: var(--color-error-dark);
        box-shadow: 0 6px 20px rgba(var(--color-error-rgb), 0.4);
        transform: translateY(-2px);
    }

    /* Premium Metrics */
    .metrics-section {
        margin-bottom: var(--space-16);
    }

    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--space-6);
    }

    .metric-card {
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-2xl);
        padding: var(--space-6);
        display: flex;
        align-items: center;
        gap: var(--space-4);
        transition: var(--transition-medium);
        backdrop-filter: blur(var(--blur-sm));
        position: relative;
        overflow: hidden;
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

    .metric-icon-wrapper.budget-icon {
        background: rgba(var(--color-success-rgb), 0.2);
        color: var(--color-success);
    }

    .metric-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        background: var(--color-primary);
        color: var(--color-white);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
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
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-1) 0;
    }

    .metric-info p {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin: 0;
    }

    /* Completion Ring */
    .completion-ring {
        position: relative;
        width: 48px;
        height: 48px;
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
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
    }

    .progress-status {
        margin-top: var(--space-2);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
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
        grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
        gap: var(--space-6);
    }

    .category-panel {
        background: rgba(var(--color-surface-dark-rgb), 0.4);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.15);
        border-radius: var(--radius-xl);
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
        padding: var(--space-4) var(--space-6);
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        margin: var(--space-2);
        border-radius: var(--radius-lg);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
    }

    .category-identity {
        display: flex;
        align-items: center;
        gap: var(--space-3);
    }

    .category-icon-wrapper {
        width: 40px;
        height: 40px;
        background: rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-xl);
        color: var(--color-primary);
    }

    .category-meta h3 {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-1) 0;
    }

    .component-counter {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
    }

    .add-component-btn {
        width: 36px;
        height: 36px;
        background: var(--gradient-primary);
        border: none;
        border-radius: var(--radius-lg);
        color: var(--color-white);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-medium);
        font-size: var(--font-size-lg);
        box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
    }

    .add-component-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(var(--color-primary-rgb), 0.4);
    }

    .panel-content {
        padding: var(--space-6);
    }

    /* Component Grid */
    .component-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--space-4);
    }

    .component-card {
        background: rgba(var(--color-bg-dark-rgb), 0.4);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
        border-radius: var(--radius-lg);
        overflow: hidden;
        transition: var(--transition-medium);
        position: relative;
    }

    .component-card:hover {
        background: rgba(var(--color-bg-dark-rgb), 0.6);
        border-color: rgba(var(--color-primary-rgb), 0.3);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.15);
    }

    .card-image {
        width: 100%;
        height: 140px;
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
    }

    .card-image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transition: var(--transition-medium);
    }

    .component-card:hover .card-image img {
        transform: scale(1.05);
    }

    .image-placeholder {
        font-size: var(--font-size-3xl);
        color: var(--color-secondary-500);
        opacity: var(--opacity-60);
    }

    .card-content {
        padding: var(--space-4);
    }

    .card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-3);
        margin-bottom: var(--space-3);
    }

    .component-title {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0;
        line-height: var(--line-height-tight);
        flex: 1;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .price-badge {
        background: linear-gradient(135deg, var(--color-success), var(--color-success-dark));
        color: var(--color-white);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(var(--color-success-rgb), 0.3);
        flex-shrink: 0;
    }

    .specs-section {
        margin-top: var(--space-2);
    }

    .specs-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-1);
    }

    .spec-tag {
        background: rgba(var(--color-primary-rgb), 0.2);
        color: var(--color-primary-light);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
    }

    .spec-more {
        background: rgba(var(--color-text-muted-rgb), 0.2);
        color: var(--color-text-muted);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        border: var(--border-thin) solid rgba(var(--color-text-muted-rgb), 0.3);
    }

    .card-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-4);
        background: rgba(var(--color-surface-dark-rgb), 0.3);
        border-top: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
    }

    .action-btn {
        width: 40px;
        height: 40px;
        background: rgba(var(--color-primary-rgb), 0.1);
        border: none;
        border-radius: var(--radius-md);
        color: var(--color-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-fast);
        font-size: var(--font-size-xl);
        text-decoration: none;
    }

    .action-btn:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
    }

    .action-btn.import-btn {
        background: rgba(var(--color-warning-rgb), 0.1);
        color: var(--color-warning);
    }

    .action-btn.import-btn:hover {
        background: var(--color-warning);
        color: var(--color-white);
    }

    .action-btn.external-btn {
        background: rgba(var(--color-accent-rgb), 0.1);
        color: var(--color-accent);
    }

    .action-btn.external-btn:hover {
        background: var(--color-accent);
        color: var(--color-white);
    }

    .action-btn.edit-btn {
        background: rgba(var(--color-info-rgb), 0.1);
        color: var(--color-info);
    }

    .action-btn.edit-btn:hover {
        background: var(--color-info);
        color: var(--color-white);
    }

    .action-btn.remove-btn {
        background: rgba(var(--color-error-rgb), 0.1);
        color: var(--color-error);
    }

    .action-btn.remove-btn:hover {
        background: var(--color-error);
        color: var(--color-white);
    }

    /* Empty State */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-8) var(--space-4);
        text-align: center;
        min-height: 200px;
    }

    .empty-visual {
        width: 64px;
        height: 64px;
        background: rgba(var(--color-primary-rgb), 0.1);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-4xl);
        color: var(--color-secondary-500);
        margin-bottom: var(--space-4);
    }

    .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 300px;
    }

    .empty-content h4 {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-2) 0;
    }

    .empty-content p {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin: 0 0 var(--space-6) 0;
        line-height: var(--line-height-relaxed);
    }

    .empty-action {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-4);
        background: var(--gradient-primary);
        border: none;
        border-radius: var(--radius-sm);
        color: var(--color-white);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: var(--transition-medium);
        box-shadow: var(--shadow-primary);
        font-size: var(--font-size-sm);
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

    .loading-spin {
        font-size: var(--font-size-2xl);
        align-self: center;
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
    @media (max-width: 1536px) {
        .catalog-grid {
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        }

        .component-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 1024px) {
        .dashboard {
            padding: var(--space-8) var(--space-6);
        }

        .metrics-grid {
            grid-template-columns: 1fr;
        }

        .catalog-grid {
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

        .component-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
    }

    @media (max-width: 768px) {

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

        .panel-header {
            padding: var(--space-4) var(--space-5);
        }

        .panel-content {
            padding: var(--space-5);
        }

        .component-grid {
            grid-template-columns: 1fr;
            gap: var(--space-3);
        }

        .card-image {
            height: 100px;
        }

        .toggle-group {
            flex-direction: column;
        }

        .input-group.premium {
            flex-direction: column;
        }

        .catalog-btn-text {
            display: none !important;
        }

        .catalog-btn {
            min-width: auto !important;
        }
    }

    @media (max-width: 640px) {
        .dashboard {
            padding: var(--space-6) var(--space-4);
        }

        .metrics-grid {
            gap: var(--space-4);
        }

        .metric-card {
            padding: var(--space-4);
        }

        .catalog-grid {
            gap: var(--space-4);
        }

        .component-grid {
            gap: var(--space-3);
        }

        .card-content {
            padding: var(--space-3);
        }

        .card-actions {
            padding: var(--space-2) var(--space-3);
        }

        .action-btn {
            width: 28px;
            height: 28px;
            font-size: var(--font-size-xs);
        }

        .catalog-btn-text {
            display: none !important;
        }
    }
</style>