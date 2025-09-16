<template>
    <ion-page>
        <ion-content>
            <div class="components-page">
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
                            <h1>Components Library</h1>
                            <p>Gestisci il database completo dei tuoi componenti PC</p>
                        </div>
                        <button @click="showCreateModal = true" class="create-btn">
                            <Icon icon="mdi:plus" width="20" height="20" />
                            Nuovo Componente
                        </button>
                    </div>
                </header>

                <!-- Stats & Filters Section -->
                <div class="filters-section">
                    <div class="stats-container">
                        <div class="stat-card">
                            <Icon icon="mdi:memory" class="stat-icon" />
                            <div class="stat-info">
                                <span class="stat-value">{{ totalComponents }}</span>
                                <span class="stat-label">Componenti Totali</span>
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
                            <Icon icon="mdi:chart-box" class="stat-icon" />
                            <div class="stat-info">
                                <span class="stat-value">{{ allCategories.length }}</span>
                                <span class="stat-label">Categorie</span>
                            </div>
                        </div>
                    </div>

                    <div class="filter-controls">
                        <div class="search-box">
                            <Icon icon="mdi:magnify" class="search-icon" />
                            <input v-model="searchQuery" placeholder="Cerca componenti..." class="search-input" />
                        </div>

                        <select v-model="selectedCategoryFilter" class="category-filter">
                            <option value="">Tutte le categorie</option>
                            <option v-for="category in allCategories" :key="category" :value="category">
                                {{ getCategoryName(category) }}
                            </option>
                        </select>

                        <select v-model="sortBy" class="sort-select">
                            <option value="name">Nome</option>
                            <option value="price">Prezzo</option>
                            <option value="category">Categoria</option>
                            <option value="date">Data</option>
                        </select>
                    </div>
                </div>

                <!-- Components Grid -->
                <div class="components-container">
                    <div v-if="filteredComponents.length === 0" class="empty-state">
                        <Icon icon="mdi:package-variant" class="empty-icon" />
                        <h3>{{ searchQuery || selectedCategoryFilter ? 'Nessun risultato' : 'Nessun componente' }}</h3>
                        <p>{{ searchQuery || selectedCategoryFilter ? 'Prova a modificare i filtri di ricerca' :
                            'Inizia creando il tuo primo componente PC' }}</p>
                        <button v-if="!searchQuery && !selectedCategoryFilter" @click="showCreateModal = true"
                            class="cta-btn">
                            <Icon icon="mdi:plus" />
                            Crea Primo Componente
                        </button>
                    </div>

                    <div v-else class="components-grid">
                        <ComponentCard v-for="component in filteredComponents" :key="component.id"
                            :component="component" @click="editComponent" @duplicate="duplicateComponent"
                            @delete="deleteComponent" />
                    </div>
                </div>

                <!-- Create Component Modal -->
                <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
                    <div class="modal-content" @click.stop>
                        <header class="modal-header">
                            <h2>Nuovo Componente</h2>
                            <button @click="closeCreateModal" class="close-btn">
                                <Icon icon="mdi:close" />
                            </button>
                        </header>

                        <div class="modal-body">
                            <div class="form-group">
                                <label>Categoria</label>
                                <select v-model="newComponent.category" class="form-select">
                                    <option value="">Seleziona categoria</option>
                                    <option v-for="category in allCategories" :key="category" :value="category">
                                        {{ getCategoryName(category) }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Link Amazon (opzionale)</label>
                                <div class="url-input-group">
                                    <input v-model="newComponent.amazonUrl" placeholder="https://amzn.eu/d/..."
                                        class="form-input" @blur="fetchProductInfo" />
                                    <button v-if="newComponent.amazonUrl" @click="fetchProductInfo"
                                        :disabled="componentsStore.loading" class="fetch-btn">
                                        <Icon :icon="componentsStore.loading ? 'mdi:loading' : 'mdi:refresh'"
                                            :class="{ 'spin': componentsStore.loading }" />
                                    </button>
                                </div>
                            </div>

                            <div v-if="productPreview" class="product-preview">
                                <div class="preview-header">
                                    <Icon icon="mdi:eye" />
                                    <span>Anteprima Prodotto</span>
                                </div>
                                <div class="preview-content">
                                    <p><strong>Nome:</strong> {{ productPreview.title }}</p>
                                    <p><strong>Prezzo:</strong> €{{ productPreview.price.toFixed(2) }}</p>
                                    <div v-if="productPreview.specifications?.length">
                                        <strong>Specifiche:</strong>
                                        <div class="specs-preview">
                                            <span v-for="spec in productPreview.specifications" :key="spec"
                                                class="spec-tag">
                                                {{ spec }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Manual Input Fields -->
                            <div v-if="!productPreview || showManualFields" class="manual-fields">
                                <div class="form-group">
                                    <label>Nome Modello</label>
                                    <input v-model="newComponent.model" placeholder="es. AMD Ryzen 9 7900X"
                                        class="form-input" />
                                </div>

                                <div class="form-group">
                                    <label>Prezzo (€)</label>
                                    <input v-model.number="newComponent.price" type="number" step="0.01"
                                        placeholder="0.00" class="form-input" />
                                </div>

                                <div class="form-group">
                                    <label>Specifiche (una per riga)</label>
                                    <textarea v-model="specificationsText"
                                        placeholder="12 Core / 24 Thread&#10;AM5&#10;Radeon Graphics"
                                        class="form-textarea" rows="3" />
                                </div>
                            </div>

                            <button v-if="productPreview && !showManualFields" @click="showManualFields = true"
                                class="toggle-manual-btn">
                                <Icon icon="mdi:pencil" />
                                Modifica Manualmente
                            </button>
                        </div>

                        <footer class="modal-footer">
                            <button @click="closeCreateModal" class="cancel-btn">
                                Annulla
                            </button>
                            <button @click="confirmCreateComponent" :disabled="!canCreateComponent" class="confirm-btn">
                                <Icon icon="mdi:check" />
                                Crea Componente
                            </button>
                        </footer>
                    </div>
                </div>
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
        if (confirm(`Sei sicuro di voler eliminare "${component.model}"?`)) {
            try {
                await componentsStore.deleteComponent(component.id);
            } catch (error) {
                console.error('Errore nell\'eliminazione del componente:', error);
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
        animation: gridMove 35s linear infinite;
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
        background: radial-gradient(circle at 25% 25%,
                rgba(var(--color-primary-rgb), 0.08) 0%,
                transparent 50%),
            radial-gradient(circle at 75% 75%,
                rgba(var(--color-accent-rgb), 0.06) 0%,
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

    /* Filters Section */
    .filters-section {
        position: relative;
        z-index: 3;
        padding: var(--space-6);
        max-width: 1200px;
        margin: 0 auto;
    }

    .stats-container {
        display: flex;
        gap: var(--space-4);
        margin-bottom: var(--space-6);
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

    .filter-controls {
        display: flex;
        gap: var(--space-3);
        flex-wrap: wrap;
    }

    .search-box {
        position: relative;
        flex: 1;
        min-width: 280px;
    }

    .search-icon {
        position: absolute;
        left: var(--space-3);
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-muted);
        font-size: 1.125rem;
    }

    .search-input {
        width: 100%;
        padding: var(--space-3) var(--space-3) var(--space-3) 2.5rem;
        background: rgba(var(--color-primary-rgb), 0.05);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-lg);
        color: var(--color-text-dark);
        font-size: var(--font-size-sm);
        transition: var(--transition-all);
    }

    .search-input:focus {
        outline: none;
        border-color: rgba(var(--color-primary-rgb), 0.5);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
    }

    .search-input::placeholder {
        color: var(--color-text-muted);
    }

    .category-filter,
    .sort-select {
        padding: var(--space-3) var(--space-4);
        background: rgba(var(--color-primary-rgb), 0.05);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-lg);
        color: var(--color-text-dark);
        font-size: var(--font-size-sm);
        cursor: pointer;
        transition: var(--transition-all);
        min-width: 160px;
    }

    .category-filter:focus,
    .sort-select:focus {
        outline: none;
        border-color: rgba(var(--color-primary-rgb), 0.5);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
    }

    /* Components Container */
    .components-container {
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

    .components-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: var(--space-6);
    }

    /* Modal */
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
        z-index: 1000;
        padding: var(--space-4);
    }

    .modal-content {
        background: var(--color-surface-dark);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-xl);
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        backdrop-filter: blur(20px);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-6);
        border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1);
    }

    .modal-header h2 {
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

    .close-btn:hover {
        background: rgba(var(--color-primary-rgb), 0.2);
        color: var(--color-primary);
    }

    .modal-body {
        padding: var(--space-6);
    }

    .form-group {
        margin-bottom: var(--space-4);
    }

    .form-group label {
        display: block;
        margin-bottom: var(--space-2);
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-sm);
        color: var(--color-text-dark);
    }

    .form-input,
    .form-select,
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
    .form-select:focus,
    .form-textarea:focus {
        outline: none;
        border-color: rgba(var(--color-primary-rgb), 0.5);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
    }

    .form-input::placeholder,
    .form-textarea::placeholder {
        color: var(--color-text-muted);
    }

    .url-input-group {
        display: flex;
        gap: var(--space-2);
    }

    .fetch-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: var(--color-primary);
        border: none;
        border-radius: var(--radius-md);
        color: var(--color-white);
        cursor: pointer;
        transition: var(--transition-all);
    }

    .fetch-btn:hover:not(:disabled) {
        background: var(--color-primary-light);
    }

    .fetch-btn:disabled {
        opacity: var(--opacity-50);
        cursor: not-allowed;
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

    .product-preview {
        background: rgba(var(--color-primary-rgb), 0.05);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
        margin: var(--space-4) 0;
    }

    .preview-header {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-3);
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary);
    }

    .preview-content p {
        margin: var(--space-2) 0;
        font-size: var(--font-size-sm);
        color: var(--color-text-dark);
    }

    .specs-preview {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-1);
        margin-top: var(--space-2);
    }

    .toggle-manual-btn {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-3);
        background: rgba(var(--color-secondary-rgb), 0.1);
        border: 1px solid rgba(var(--color-secondary-rgb), 0.3);
        border-radius: var(--radius-md);
        color: var(--color-text-dark);
        cursor: pointer;
        transition: var(--transition-all);
        font-size: var(--font-size-xs);
    }

    .toggle-manual-btn:hover {
        background: rgba(var(--color-secondary-rgb), 0.2);
        color: var(--color-text-dark);
    }

    .modal-footer {
        display: flex;
        gap: var(--space-3);
        padding: var(--space-6);
        border-top: 1px solid rgba(var(--color-primary-rgb), 0.1);
        justify-content: flex-end;
    }

    .cancel-btn,
    .confirm-btn {
        padding: var(--space-3) var(--space-4);
        border-radius: var(--radius-md);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: var(--transition-all);
        font-size: var(--font-size-sm);
    }

    .cancel-btn {
        background: rgba(var(--color-secondary-rgb), 0.1);
        border: 1px solid rgba(var(--color-secondary-rgb), 0.3);
        color: var(--color-text-muted);
    }

    .cancel-btn:hover {
        background: rgba(var(--color-secondary-rgb), 0.2);
        color: var(--color-text-dark);
    }

    .confirm-btn {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        background: var(--color-primary);
        border: 1px solid var(--color-primary);
        color: var(--color-white);
    }

    .confirm-btn:hover:not(:disabled) {
        background: var(--color-primary-light);
        border-color: var(--color-primary-light);
    }

    .confirm-btn:disabled {
        opacity: var(--opacity-50);
        cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .stats-container {
            flex-direction: column;
        }

        .filter-controls {
            flex-direction: column;
        }

        .search-box {
            min-width: auto;
        }

        .components-grid {
            grid-template-columns: 1fr;
        }

        .header-content {
            flex-wrap: wrap;
            gap: var(--space-3);
        }
    }

    @media (max-width: 480px) {
        .component-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
        }

        .modal-overlay {
            padding: var(--space-2);
        }
    }
</style>