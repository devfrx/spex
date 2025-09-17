<template>
    <ion-page>
        <ion-content>
            <div class="build-detail-page">
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
                            <h1>{{ build?.name || 'Build PC' }}</h1>
                            <p v-if="build?.description">{{ build.description }}</p>
                            <p v-else>Configura i componenti per la tua build</p>
                        </div>
                        <button @click="showAddComponentModal = true" class="add-btn">
                            <Icon icon="mdi:plus" width="20" height="20" />
                            Aggiungi Componente
                        </button>
                    </div>
                </header>

                <div v-if="build" class="build-detail">
                    <!-- Build Overview Stats -->
                    <div class="overview-section">
                        <div class="overview-stats">
                            <div class="stat-card">
                                <Icon icon="mdi:memory" class="stat-icon" />
                                <div class="stat-info">
                                    <span class="stat-value">{{ totalComponentsCount }}</span>
                                    <span class="stat-label">Componenti</span>
                                </div>
                            </div>
                            <div class="stat-card">
                                <Icon icon="mdi:currency-eur" class="stat-icon" />
                                <div class="stat-info">
                                    <span class="stat-value">€{{ totalPrice.toFixed(0) }}</span>
                                    <span class="stat-label">Prezzo Totale</span>
                                </div>
                            </div>
                            <div class="stat-card">
                                <Icon icon="mdi:chart-donut" class="stat-icon" />
                                <div class="stat-info">
                                    <span class="stat-value">{{ getCompletionPercentage }}%</span>
                                    <span class="stat-label">Completamento</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- Components Section -->
                    <div class="components-section">
                        <div class="section-header">
                            <h2>Componenti Build</h2>
                            <div class="header-line"></div>
                        </div>

                        <div class="components-grid">
                            <!-- Template per ogni categoria -->
                            <div v-for="category in allCategories" :key="category" class="component-category">
                                <div class="category-header">
                                    <div class="category-info">
                                        <Icon :icon="getCategoryIcon(category)" class="category-icon" />
                                        <span class="category-name">{{ getCategoryName(category) }}</span>
                                        <span class="component-count">({{ getComponentsByCategory(category).length
                                        }})</span>
                                    </div>
                                    <button @click="addComponentToCategory(category)" class="add-category-btn">
                                        <Icon icon="mdi:plus" />
                                    </button>
                                </div>

                                <!-- Lista componenti per categoria -->
                                <div v-if="getComponentsByCategory(category).length > 0" class="category-components">
                                    <div v-for="(component, index) in getComponentsByCategory(category)"
                                        :key="component.id" class="component-card">
                                        <div class="component-content">
                                            <div class="component-img">
                                                <img v-if="component.imageUrl" :src="component.imageUrl"
                                                    :alt="component.model" />
                                                <div v-else class="no-image">
                                                    <Icon icon="mdi:package-variant" class="no-image-icon" />
                                                </div>
                                            </div>

                                            <div class="component-info">
                                                <h3 class="component-name">{{ component.model }}</h3>

                                                <div v-if="component.specifications?.length" class="component-specs">
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

                                                <div class="component-footer">
                                                    <div class="price-section">
                                                        <span class="price">€{{ component.price.toFixed(2) }}</span>
                                                    </div>

                                                    <div class="component-actions">
                                                        <a v-if="component.amazonUrl" :href="component.amazonUrl"
                                                            target="_blank" class="action-btn amazon-link"
                                                            title="Vedi su Amazon">
                                                            <Icon icon="mdi:shopping" />
                                                        </a>
                                                        <button @click="editComponent(component)"
                                                            class="action-btn edit" title="Modifica">
                                                            <Icon icon="mdi:pencil" />
                                                        </button>
                                                        <button @click="removeSpecificComponent(category, component)"
                                                            class="action-btn danger" title="Rimuovi">
                                                            <Icon icon="mdi:trash-can" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Empty state per categoria -->
                                <div v-else class="empty-category">
                                    <Icon icon="mdi:plus-circle-outline" class="empty-icon" />
                                    <p class="empty-text">Nessun {{ getCategoryName(category).toLowerCase() }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add Component Modal - manteniamo la stessa logica -->
                <BaseModal v-model="showAddComponentModal" title="Aggiungi Componente" icon="mdi:package-variant-plus"
                    size="md" :confirm-disabled="!selectedCategory || !amazonUrl || !productInfo"
                    :loading="componentsStore.loading" confirm-text="Aggiungi Componente" @confirm="confirmAddComponent"
                    @cancel="closeAddModal">
                    <div class="form-group">
                        <label>Categoria</label>
                        <select v-model="selectedCategory" class="form-select">
                            <option value="">Seleziona categoria</option>
                            <option v-for="category in allCategories" :key="category" :value="category">
                                {{ getCategoryName(category) }}
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Link Amazon</label>
                        <div class="url-input-group">
                            <input v-model="amazonUrl" placeholder="https://amzn.eu/d/..." class="form-input"
                                @blur="fetchProductInfo" />
                            <button v-if="amazonUrl" @click="fetchProductInfo" :disabled="componentsStore.loading"
                                class="fetch-btn">
                                <Icon :icon="componentsStore.loading ? 'mdi:loading' : 'mdi:download'"
                                    :class="{ 'spin': componentsStore.loading }" />
                            </button>
                        </div>
                    </div>

                    <div v-if="productInfo" class="product-preview">
                        <div class="preview-header">
                            <Icon icon="mdi:eye" />
                            <span>Anteprima Prodotto</span>
                        </div>
                        <div class="preview-content">
                            <p><strong>Nome:</strong> {{ productInfo.title }}</p>
                            <p><strong>Prezzo:</strong> €{{ productInfo.price.toFixed(2) }}</p>
                            <div v-if="productInfo.specifications?.length">
                                <strong>Specifiche:</strong>
                                <div class="specs-preview">
                                    <span v-for="spec in productInfo.specifications" :key="spec" class="spec-tag">
                                        {{ spec }}
                                    </span>
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
    const amazonUrl = ref('');
    const productInfo = ref<AmazonProductInfo | null>(null);

    const buildId = computed(() => route.params.id as string);
    const build = computed(() => buildsStore.getBuildById(buildId.value));
    const totalPrice = computed(() => buildsStore.currentBuildTotalPrice);

    const allCategories = Object.values(ComponentCategory);

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
        if (!selectedCategory.value || !amazonUrl.value || !build.value) return;

        try {
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
    /* Mantieni gli stili esistenti e aggiungi questi nuovi */

    .component-category {
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-xl);
        padding: var(--space-4);
        backdrop-filter: blur(20px);
        margin-bottom: var(--space-4);
    }

    .category-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-4);
        padding-bottom: var(--space-3);
        border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1);
    }

    .category-info {
        display: flex;
        align-items: center;
        gap: var(--space-2);
    }

    .category-icon {
        font-size: 1.25rem;
        color: var(--color-primary);
    }

    .category-name {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
    }

    .component-count {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        font-weight: var(--font-weight-normal);
    }

    .add-category-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: var(--color-success);
        border-radius: var(--radius-md);
        color: var(--color-text);
        cursor: pointer;
        transition: var(--transition-all);
    }

    .add-category-btn:hover {
        background: rgba(var(--color-primary-rgb), 0.2);
    }

    .category-components {
        display: grid;
        gap: var(--space-3);
    }

    .component-card {
        background: rgba(var(--color-primary-700-rgb), 0.2);
        border: 1px solid rgba(var(--color-primary-500-rgb), 0.4);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
        transition: var(--transition-all);
    }

    .component-card:hover {
        background: rgba(var(--color-primary-rgb), 0.08);
        border-color: rgba(var(--color-primary-rgb), 0.2);
    }

    .component-content {
        display: flex;
        gap: var(--space-4);
        align-items: flex-start;
    }

    .component-img {
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(var(--color-primary-rgb), 0.05);
        border-radius: var(--radius-md);
        overflow: hidden;
        flex-shrink: 0;
    }

    .component-img img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .no-image {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    .no-image-icon {
        font-size: 2rem;
        color: var(--color-text-muted);
        opacity: 0.5;
    }

    .component-info {
        flex: 1;
        min-width: 0;
    }

    .component-name {
        margin: 0 0 var(--space-2) 0;
        font-size: var(--font-size-md);
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

    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: rgba(var(--color-primary-rgb), 0.1);
        border-radius: var(--radius-md);
        color: var(--color-primary);
        text-decoration: none;
        cursor: pointer;
        transition: var(--transition-all);
    }

    .action-btn.danger {
        background: var(--color-error);
        color: var(--color-text);
    }

    .action-btn.amazon-link {
        background: var(--color-warning);
        color: var(--color-text);
    }


    .action-btn.edit {
        background: var(--color-accent-dark);
        color: var(--color-text);
    }

    .action-btn:hover {
        background: rgba(var(--color-primary-rgb), 0.2);
        border-color: rgba(var(--color-primary-rgb), 0.4);
    }

    .action-btn.error:hover {
        background: rgba(var(--color-danger-rgb), 0.2);
        border-color: rgba(var(--color-danger-rgb), 0.4);
    }

    .empty-category {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-8);
        text-align: center;
        opacity: 0.6;
    }

    .empty-icon {
        font-size: 2rem;
        color: var(--color-text-muted);
        margin-bottom: var(--space-2);
    }

    .empty-text {
        margin: 0;
        color: var(--color-text-muted);
        font-size: var(--font-size-sm);
    }

    /* Mantieni tutti gli altri stili esistenti */
    .build-detail-page {
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
        animation: gridMove 20s linear infinite;
        z-index: 1;
    }

    .bg-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at 30% 20%, rgba(var(--color-primary-rgb), 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(var(--color-accent-rgb), 0.1) 0%, transparent 50%);
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
    .add-btn {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-4);
        background: rgba(var(--color-primary-rgb), 0.1);
        border: 1px solid rgba(var(--color-primary-rgb), 0.3);
        border-radius: var(--radius-lg);
        color: var(--color-primary-light);
        cursor: pointer;
        transition: var(--transition-all);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
    }

    .back-btn:hover,
    .add-btn:hover {
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

    /* Build Detail */
    .build-detail {
        position: relative;
        z-index: 3;
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--space-6);
    }

    /* Overview Section */
    .overview-section {
        margin-bottom: var(--space-8);
    }

    .overview-stats {
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

    /* Components Section */
    .components-section {
        margin-top: var(--space-8);
    }

    .section-header {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        margin-bottom: var(--space-6);
    }

    .section-header h2 {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-dark);
        margin: 0;
    }

    .header-line {
        flex: 1;
        height: 2px;
        background: linear-gradient(90deg, var(--color-primary), transparent);
    }

    .components-grid {
        display: grid;
        gap: var(--space-4);
    }

    /* Modal styling - mantieni gli stili esistenti */
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

    .form-select,
    .form-input {
        width: 100%;
        padding: var(--space-3);
        background: rgba(var(--color-primary-rgb), 0.05);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-md);
        color: var(--color-text-dark);
        font-size: var(--font-size-sm);
        transition: var(--transition-all);
    }

    .form-select:focus,
    .form-input:focus {
        outline: none;
        border-color: rgba(var(--color-primary-rgb), 0.5);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
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
        background: var(--color-warning);
        border-radius: var(--radius-md);
        color: var(--color-text);
        cursor: pointer;
        transition: var(--transition-all);
    }

    .fetch-btn:hover {
        background: rgba(var(--color-warning-rgb), 0.5);
    }

    .fetch-btn:disabled {
        opacity: 0.5;
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
        background: rgba(var(--color-info-rgb), 0.05);
        border: 1px solid rgba(var(--color-info-rgb), 0.2);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
        margin-top: var(--space-4);
    }

    .preview-header {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-3);
        padding-bottom: var(--space-2);
        border-bottom: 1px solid rgba(var(--color-info-rgb), 0.2);
        color: var(--color-info);
        font-weight: var(--font-weight-medium);
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
</style>