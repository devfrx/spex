<template>
    <ion-page>
        <ion-content>
            <div class="components-page">
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
                            <span class="breadcrumb-current">Components Library</span>
                        </nav>

                        <div class="header-main">
                            <div class="page-identity">
                                <div class="page-avatar">
                                    <Icon icon="mdi:memory" />
                                </div>
                                <div class="page-meta">
                                    <h1 class="page-name">Components Library</h1>
                                    <p class="page-description">Gestisci il database completo dei tuoi componenti PC</p>
                                </div>
                            </div>

                            <div class="header-actions">

                            </div>
                        </div>
                    </div>
                </header>

                <!-- Main Dashboard -->
                <main class="dashboard">

                    <!-- Filters & Search -->
                    <section class="filters-section">
                        <div class="section-header">
                            <h2>Filter & Search</h2>
                            <div class="section-divider"></div>
                        </div>

                        <div class="filters-container">
                            <div class="search-field">
                                <div class="search-box">
                                    <Icon icon="mdi:magnify" class="search-icon" />
                                    <input v-model="searchQuery" placeholder="Search components..."
                                        class="search-input premium" />
                                </div>
                            </div>

                            <div class="filter-controls">
                                <div class="filter-field">
                                    <label class="filter-label">
                                        <Icon icon="mdi:tag" />
                                        Category
                                    </label>
                                    <select v-model="selectedCategoryFilter" class="filter-select premium">
                                        <option value="">All Categories</option>
                                        <option v-for="category in allCategories" :key="category" :value="category">
                                            {{ getCategoryName(category) }}
                                        </option>
                                    </select>
                                </div>

                                <div class="filter-field">
                                    <label class="filter-label">
                                        <Icon icon="mdi:sort" />
                                        Sort By
                                    </label>
                                    <select v-model="sortBy" class="filter-select premium">
                                        <option value="name">Name</option>
                                        <option value="price">Price</option>
                                        <option value="category">Category</option>
                                        <option value="date">Date Added</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Components Collection -->
                    <section class="collection-section">
                        <!-- <div class="section-header">
                            <h2>Components Collection</h2>
                            <div class="section-divider"></div>
                        </div> -->
                        <div class="collection-actions">
                            <div class="actions-start">
                                <button @click="showCreateModal = true" class="collection-btn add-btn">
                                    <Icon icon="mdi:plus" />
                                    <span>New Component</span>
                                </button>
                            </div>
                            <div class="actions-end">
                                <button @click="handleClearAllComponents" class="collection-btn remove-btn">
                                    <Icon icon="mdi:delete" />
                                    <span class="catalog-btn-text">Clear all</span>
                                </button>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-if="filteredComponents.length === 0 && !searchQuery && !selectedCategoryFilter"
                            class="empty-state">
                            <div class="empty-visual">
                                <Icon icon="mdi:package-variant" />
                            </div>
                            <div class="empty-content">
                                <h3>No components yet</h3>
                                <p>Start building your component library by adding your first PC part</p>
                                <button @click="showCreateModal = true" class="empty-action">
                                    <Icon icon="mdi:plus" />
                                    Create First Component
                                </button>
                            </div>
                        </div>

                        <!-- No Results State -->
                        <div v-else-if="filteredComponents.length === 0" class="empty-state">
                            <div class="empty-visual">
                                <Icon icon="mdi:magnify" />
                            </div>
                            <div class="empty-content">
                                <h3>No results found</h3>
                                <p>Try adjusting your search filters to find what you're looking for</p>
                            </div>
                        </div>

                        <!-- Components Grid -->
                        <div v-else class="components-grid">
                            <ComponentCard v-for="component in filteredComponents" :key="component.id"
                                :component="component" @click="editComponent" @duplicate="duplicateComponent"
                                @delete="deleteComponent" />
                        </div>
                    </section>

                    <!-- Performance Metrics -->
                    <section class="metrics-section">
                        <div class="section-header">
                            <h2>Library Overview</h2>
                            <div class="section-divider"></div>
                        </div>

                        <div class="metrics-grid">
                            <div class="metric-card components">
                                <div class="metric-visual">
                                    <div class="metric-icon-wrapper">
                                        <Icon icon="mdi:memory" />
                                    </div>
                                    <div class="metric-badge">{{ totalComponents }}</div>
                                </div>
                                <div class="metric-info">
                                    <h3>Total Components</h3>
                                    <p>In database</p>
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
                                    <p>Library worth</p>
                                </div>
                            </div>

                            <!-- <div class="metric-card categories">
                                <div class="metric-visual">
                                    <div class="metric-icon-wrapper categories-icon">
                                        <Icon icon="mdi:view-grid" />
                                    </div>
                                    <div class="metric-badge categories-badge">{{ allCategories.length }}</div>
                                </div>
                                <div class="metric-info">
                                    <h3>Categories</h3>
                                    <p>Component types</p>
                                    <div class="trend-indicator positive">
                                        <Icon icon="mdi:check-circle" />
                                        <span>Complete coverage</span>
                                    </div>
                                </div>
                            </div> -->
                        </div>
                    </section>
                </main>

                <!-- Enhanced Create Component Modal -->
                <BaseModal v-model="showCreateModal" title="Create Component" icon="mdi:package-variant-plus" size="lg"
                    :confirm-disabled="!canCreateComponent" :loading="componentsStore.loading"
                    confirm-text="Create Component" @confirm="confirmCreateComponent" @cancel="closeCreateModal">

                    <div class="modal-form-container">
                        <div class="form-section">
                            <div class="form-field">
                                <label class="field-label">
                                    <Icon icon="mdi:tag-outline" />
                                    Component Category
                                </label>
                                <select v-model="newComponent.category" class="field-select premium">
                                    <option value="">Choose category</option>
                                    <option v-for="category in allCategories" :key="category" :value="category">
                                        {{ getCategoryName(category) }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-field">
                                <label class="field-label">
                                    <Icon icon="mdi:shopping" />
                                    Amazon Product URL (Optional)
                                </label>
                                <div class="input-group premium">
                                    <input v-model="newComponent.amazonUrl" placeholder="https://amzn.eu/d/..."
                                        class="field-input" @blur="fetchProductInfo" />
                                    <button v-if="newComponent.amazonUrl" @click="fetchProductInfo"
                                        :disabled="componentsStore.loading" class="input-action">
                                        <Icon :icon="componentsStore.loading ? 'mdi:loading' : 'mdi:refresh'"
                                            :class="{ 'loading-spin': componentsStore.loading }" />
                                    </button>
                                </div>
                            </div>

                            <!-- Product Preview -->
                            <div v-if="productPreview" class="product-preview">
                                <div class="preview-header">
                                    <Icon icon="mdi:check-decagram" />
                                    <span>Product Detected</span>
                                </div>
                                <div class="preview-details">
                                    <div class="detail-row">
                                        <span class="detail-label">Name:</span>
                                        <span class="detail-value">{{ productPreview.title }}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Price:</span>
                                        <span class="detail-value price">€{{ productPreview.price.toFixed(2) }}</span>
                                    </div>
                                    <div v-if="productPreview.specifications?.length" class="detail-row specs">
                                        <span class="detail-label">Specs:</span>
                                        <div class="specs-preview">
                                            <span v-for="spec in productPreview.specifications.slice(0, 3)" :key="spec"
                                                class="preview-spec">
                                                {{ spec }}
                                            </span>
                                            <span v-if="productPreview.specifications.length > 3" class="spec-more">
                                                +{{ productPreview.specifications.length - 3 }} more
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button @click="showManualFields = true" class="toggle-manual-btn">
                                    <Icon icon="mdi:pencil" />
                                    Edit Manually
                                </button>
                            </div>

                            <!-- Manual Input Fields -->
                            <div v-if="!productPreview || showManualFields" class="manual-fields">
                                <div class="form-field">
                                    <label class="field-label">
                                        <Icon icon="mdi:cube-outline" />
                                        Model Name
                                    </label>
                                    <input v-model="newComponent.model" placeholder="e.g. AMD Ryzen 9 7900X"
                                        class="field-input premium" />
                                </div>

                                <div class="form-field">
                                    <label class="field-label">
                                        <Icon icon="mdi:currency-eur" />
                                        Price (€)
                                    </label>
                                    <input v-model.number="newComponent.price" type="number" step="0.01" min="0"
                                        placeholder="0.00" class="field-input premium" />
                                </div>

                                <div class="form-field">
                                    <label class="field-label">
                                        <Icon icon="mdi:format-list-bulleted" />
                                        Specifications (One per line)
                                    </label>
                                    <textarea v-model="specificationsText"
                                        placeholder="12 Core / 24 Thread&#10;AM5 Socket&#10;Radeon Graphics"
                                        class="field-textarea premium" rows="4" />
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
    import { ref, computed, watch } from 'vue';
    import { useRouter } from 'vue-router';
    import { IonPage, IonContent } from '@ionic/vue';
    import { useComponentsStore } from '@/stores/useComponentsStore';
    import { ComponentCategory, Component, AmazonProductInfo } from '@/interfaces/builds';
    import ComponentCard from '@/components/ComponentCard.vue';
    import BaseModal from '@/components/BaseModal.vue';
    import { useAlert } from '@/composables/alertManager';

    const { success, warning, error, confirm } = useAlert();
    const router = useRouter();
    const componentsStore = useComponentsStore();

    // State
    const searchQuery = ref('');
    const selectedCategoryFilter = ref('');
    const sortBy = ref('name');
    const showCreateModal = ref(false);
    const showManualFields = ref(false);
    const productPreview = ref<AmazonProductInfo | null>(null);

    const newComponent = ref({
        category: '' as ComponentCategory | '',
        model: '',
        price: 0,
        amazonUrl: '',
    });

    const specificationsText = ref('');

    // Computed
    const allCategories = Object.values(ComponentCategory);

    const components = computed(() => componentsStore.components);

    const totalComponents = computed(() => componentsStore.totalComponents);

    const totalValue = computed(() =>
        components.value.reduce((sum, component) => sum + component.price, 0)
    );

    const filteredComponents = computed(() => {
        let filtered = [...components.value];

        // Search filter
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase();
            filtered = filtered.filter(component =>
                component.model.toLowerCase().includes(query) ||
                component.specifications?.some(spec => spec.toLowerCase().includes(query))
            );
        }

        // Category filter
        if (selectedCategoryFilter.value) {
            filtered = filtered.filter(component => component.category === selectedCategoryFilter.value);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy.value) {
                case 'price':
                    return b.price - a.price;
                case 'category':
                    return a.category.localeCompare(b.category);
                case 'date':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'name':
                default:
                    return a.model.localeCompare(b.model);
            }
        });

        return filtered;
    });

    const canCreateComponent = computed(() => {
        if (productPreview.value && !showManualFields.value) {
            return newComponent.value.category !== '';
        }
        return newComponent.value.category !== '' &&
            newComponent.value.model.trim() !== '' &&
            newComponent.value.price > 0;
    });

    // Methods
    const goBack = () => {
        router.go(-1);
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

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('it-IT', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(date));
    };

    const fetchProductInfo = async () => {
        if (!newComponent.value.amazonUrl?.trim()) {
            productPreview.value = null;
            return;
        }

        try {
            productPreview.value = await componentsStore.fetchAmazonProductInfo(newComponent.value.amazonUrl);
            showManualFields.value = false;
        } catch (error) {
            console.error('Errore nel recupero info prodotto:', error);
            productPreview.value = null;
        }
    };

    const closeCreateModal = () => {
        showCreateModal.value = false;
        resetCreateForm();
    };

    const resetCreateForm = () => {
        newComponent.value = {
            category: '',
            model: '',
            price: 0,
            amazonUrl: '',
        };
        specificationsText.value = '';
        productPreview.value = null;
        showManualFields.value = false;
    };

    const confirmCreateComponent = async () => {
        try {
            let componentData;

            if (productPreview.value && !showManualFields.value) {
                // Use product preview data
                componentData = {
                    category: newComponent.value.category as ComponentCategory,
                    title: getCategoryName(newComponent.value.category as ComponentCategory),
                    model: productPreview.value.title,
                    specifications: productPreview.value.specifications,
                    price: productPreview.value.price,
                    amazonUrl: newComponent.value.amazonUrl || undefined,
                    imageUrl: productPreview.value.imageUrl,
                };
            } else {
                // Use manual data
                const specs = specificationsText.value
                    .split('\n')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);

                componentData = {
                    category: newComponent.value.category as ComponentCategory,
                    title: getCategoryName(newComponent.value.category as ComponentCategory),
                    model: newComponent.value.model,
                    specifications: specs.length > 0 ? specs : undefined,
                    price: newComponent.value.price,
                    amazonUrl: newComponent.value.amazonUrl || undefined,
                };
            }

            await componentsStore.createComponent(componentData);
            closeCreateModal();
        } catch (error) {
            console.error('Errore nella creazione del componente:', error);
        }
    };

    const editComponent = (component: Component) => {
        router.push(`/components/${component.id}/edit`);
    };

    const duplicateComponent = async (component: Component) => {
        try {
            const duplicatedData = {
                category: component.category,
                title: component.title,
                model: `${component.model} (Copia)`,
                specifications: component.specifications,
                price: component.price,
                amazonUrl: component.amazonUrl,
                imageUrl: component.imageUrl,
            };

            await componentsStore.createComponent(duplicatedData);
        } catch (error) {
            console.error('Errore nella duplicazione del componente:', error);
        }
    };

    const deleteComponent = async (component: Component) => {
        const confirmed = await confirm(`Are you sure you want to delete "${component.model}"?`)

        if (confirmed) {
            try {
                await componentsStore.deleteComponent(component.id);
            } catch (error) {
                console.error('Errore nell\'eliminazione del componente:', error);
            }
        }
    };

    const handleClearAllComponents = async () => {
        const confirmed = await confirm('Are you sure you want to clear all components? This action cannot be undone.');

        if (confirmed) {
            try {
                componentsStore.clearAllComponents();
                success('All components have been cleared.');
            } catch (error) {
                console.error('Errore nella cancellazione di tutti i componenti:', error);
            }
        }
    };

    // Watchers
    watch(() => newComponent.value.amazonUrl, () => {
        productPreview.value = null;
        showManualFields.value = false;
    });
</script>

<style scoped>
    .components-page {
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

    .metric-card:hover {
        transform: translateY(-4px);
        border-color: rgba(var(--color-primary-rgb), 0.4);
        box-shadow: 0 20px 40px rgba(var(--color-primary-rgb), 0.2);
    }

    .metric-card.budget::before {
        background: linear-gradient(90deg, var(--color-success-dark), var(--color-success));
    }

    .metric-card.categories::before {
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

    .metric-icon-wrapper.categories-icon {
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

    .metric-badge.categories-badge {
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

    /* Filters Section */
    .filters-section {
        margin-bottom: var(--space-16);
    }

    .filters-container {
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-2xl);
        padding: var(--space-8);
        backdrop-filter: blur(var(--blur-sm));
    }

    .search-field {
        margin-bottom: var(--space-6);
    }

    .search-box {
        position: relative;
        max-width: 500px;
    }

    .search-icon {
        position: absolute;
        left: var(--space-4);
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-muted);
        font-size: var(--font-size-lg);
        z-index: 1;
    }

    .search-input.premium {
        width: 100%;
        padding: var(--space-4) var(--space-4) var(--space-4) var(--space-12);
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border: var(--border-2) solid rgba(var(--color-primary-rgb), 0.4);
        border-radius: var(--radius-lg);
        color: var(--color-text-dark);
        font-size: var(--font-size-sm);
        transition: var(--transition-medium);
    }

    .search-input.premium:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
    }

    .search-input.premium::placeholder {
        color: var(--color-text-muted);
    }

    .filter-controls {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--space-6);
    }

    .filter-field {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }

    .filter-label {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-sm);
        color: var(--color-text-dark);
    }

    .filter-label svg {
        font-size: var(--font-size-md);
        color: var(--color-primary);
    }

    .filter-select.premium {
        width: 100%;
        padding: var(--space-4) var(--space-5);
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border: var(--border-2) solid rgba(var(--color-primary-rgb), 0.4);
        border-radius: var(--radius-lg);
        color: var(--color-text-dark);
        font-size: var(--font-size-sm);
        transition: var(--transition-medium);
        cursor: pointer;
    }

    .filter-select.premium:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
    }

    .filter-select.premium option {
        background: var(--color-surface-dark);
        color: var(--color-text-dark);
    }

    /* Collection Section */
    .collection-section {
        margin-bottom: var(--space-16);
    }

    .collection-actions {
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

    .collection-btn {
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

    .collection-btn:hover {
        box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.4);
        transform: translateY(-2px);
    }

    .collection-btn.add-btn {
        background: var(--color-success);
    }

    .collection-btn.add-btn:hover {
        background: var(--color-success-dark);
        box-shadow: 0 6px 20px rgba(var(--color-success-rgb), 0.4);
        transform: translateY(-2px);
    }

    .collection-btn.remove-btn {
        background: var(--color-error);
    }

    .collection-btn.remove-btn:hover {
        background: var(--color-error-dark);
        box-shadow: 0 6px 20px rgba(var(--color-error-rgb), 0.4);
        transform: translateY(-2px);
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

    /* Components Grid */
    .components-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: var(--space-6);
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

    .field-select,
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

    .field-select.premium,
    .field-input.premium,
    .field-textarea.premium {
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border: var(--border-2) solid rgba(var(--color-primary-rgb), 0.4);
    }

    .field-select:focus,
    .field-input:focus,
    .field-textarea:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
        background: rgba(var(--color-surface-dark-rgb), 0.9);
    }

    .field-select option {
        background: var(--color-surface-dark);
        color: var(--color-text-dark);
    }

    .field-input::placeholder,
    .field-textarea::placeholder {
        color: var(--color-text-muted);
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
        margin-bottom: var(--space-6);
    }

    .preview-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-4);
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
        gap: var(--space-3);
        margin-bottom: var(--space-4);
    }

    .detail-row {
        display: flex;
        align-items: flex-start;
        gap: var(--space-3);
    }

    .detail-row.specs {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
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

    .toggle-manual-btn {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-4);
        background: rgba(var(--color-info-rgb), 0.1);
        border: var(--border-thin) solid rgba(var(--color-info-rgb), 0.3);
        border-radius: var(--radius-md);
        color: var(--color-info);
        cursor: pointer;
        transition: var(--transition-medium);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        align-self: flex-start;
    }

    .toggle-manual-btn:hover {
        background: rgba(var(--color-info-rgb), 0.2);
        transform: translateY(-1px);
    }

    /* Manual Fields */
    .manual-fields {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
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

        .components-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        .filter-controls {
            grid-template-columns: 1fr;
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

        .components-grid {
            grid-template-columns: 1fr;
        }

        .search-box {
            max-width: none;
        }

        .filters-container {
            padding: var(--space-6);
        }
    }

    @media (max-width: 640px) {
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

        .filter-controls {
            gap: var(--space-4);
        }

        .input-group.premium {
            flex-direction: column;
        }

        .input-action {
            width: 100%;
            height: 40px;
        }
    }
</style>
