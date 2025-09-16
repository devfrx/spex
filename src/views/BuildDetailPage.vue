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
                                    <span class="stat-value">{{ build.components.length }}</span>
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
                                    <span class="stat-value">{{ getCompletionPercentage() }}%</span>
                                    <span class="stat-label">Completamento</span>
                                </div>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div class="completion-progress">
                            <div class="progress-header">
                                <span class="progress-label">Completamento Build</span>
                                <span class="progress-value">{{ getCompletionPercentage() }}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: getCompletionPercentage() + '%' }"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Components Grid -->
                    <div class="components-section">
                        <div class="section-header">
                            <h2>Componenti Build</h2>
                            <div class="header-line"></div>
                        </div>

                        <div class="components-grid">
                            <!-- Template per ogni categoria -->
                            <div v-for="category in allCategories" :key="category" class="component-slot">
                                <div class="component-card"
                                    :class="{ 'has-component': getComponentByCategory(category) }">
                                    <div class="card-header">
                                        <div class="category-info">
                                            <Icon :icon="getCategoryIcon(category)" class="category-icon" />
                                            <span class="category-name">{{ getCategoryName(category) }}</span>
                                        </div>
                                        <div class="status-indicator"
                                            :class="{ 'filled': getComponentByCategory(category) }">
                                            <Icon
                                                :icon="getComponentByCategory(category) ? 'mdi:check-circle' : 'mdi:circle-outline'" />
                                        </div>
                                    </div>

                                    <div class="card-content">
                                        <div v-if="getComponentByCategory(category)" class="component-content">
                                            <div class="component-info">
                                                <h3 class="component-name">{{ getComponentByCategory(category)!.model }}
                                                </h3>

                                                <div v-if="getComponentByCategory(category)!.specifications?.length"
                                                    class="component-specs">
                                                    <div class="specs-list">
                                                        <span
                                                            v-for="spec in getComponentByCategory(category)!.specifications!.slice(0, 2)"
                                                            :key="spec" class="spec-tag">
                                                            {{ spec }}
                                                        </span>
                                                        <span
                                                            v-if="getComponentByCategory(category)!.specifications!.length > 2"
                                                            class="spec-more">
                                                            +{{ getComponentByCategory(category)!.specifications!.length
                                                                - 2 }}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div class="component-footer">
                                                    <div class="price-section">
                                                        <span class="price">€{{
                                                            getComponentByCategory(category)!.price.toFixed(2) }}</span>
                                                    </div>

                                                    <div class="component-actions">
                                                        <a v-if="getComponentByCategory(category)!.amazonUrl"
                                                            :href="getComponentByCategory(category)!.amazonUrl"
                                                            target="_blank" class="amazon-link" title="Vedi su Amazon">
                                                            <Icon icon="mdi:shopping" />
                                                        </a>
                                                        <button
                                                            @click="editComponent(getComponentByCategory(category)!)"
                                                            class="action-btn" title="Modifica">
                                                            <Icon icon="mdi:pencil" />
                                                        </button>
                                                        <button
                                                            @click="removeComponent(getComponentByCategory(category)!)"
                                                            class="action-btn danger" title="Rimuovi">
                                                            <Icon icon="mdi:trash-can" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div v-else class="empty-slot">
                                            <div class="empty-content">
                                                <Icon icon="mdi:plus-circle-outline" class="empty-icon" />
                                                <p class="empty-text">Nessun componente</p>
                                                <button @click="addComponentToCategory(category)"
                                                    class="add-component-btn">
                                                    <Icon icon="mdi:plus" />
                                                    Aggiungi {{ getCategoryName(category) }}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add Component Modal -->
                <div v-if="showAddComponentModal" class="modal-overlay" @click="closeAddModal">
                    <div class="modal-content" @click.stop>
                        <header class="modal-header">
                            <h2>Aggiungi Componente</h2>
                            <button @click="closeAddModal" class="close-btn">
                                <Icon icon="mdi:close" />
                            </button>
                        </header>

                        <div class="modal-body">
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
                                    <button v-if="amazonUrl" @click="fetchProductInfo"
                                        :disabled="componentsStore.loading" class="fetch-btn">
                                        <Icon :icon="componentsStore.loading ? 'mdi:loading' : 'mdi:refresh'"
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
                                            <span v-for="spec in productInfo.specifications" :key="spec"
                                                class="spec-tag">
                                                {{ spec }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <footer class="modal-footer">
                            <button @click="closeAddModal" class="cancel-btn">
                                Annulla
                            </button>
                            <button @click="confirmAddComponent"
                                :disabled="!selectedCategory || !amazonUrl || !productInfo" class="confirm-btn">
                                <Icon icon="mdi:check" />
                                Aggiungi Componente
                            </button>
                        </footer>
                    </div>
                </div>
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

    const getComponentByCategory = (category: ComponentCategory) => {
        return build.value?.components.find(c => c.category === category);
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

    const getCompletionPercentage = () => {
        if (!build.value) return 0;
        const essentialCategories = [
            ComponentCategory.CPU,
            ComponentCategory.MOTHERBOARD,
            ComponentCategory.MEMORY,
            ComponentCategory.STORAGE_PRIMARY,
            ComponentCategory.PSU,
            ComponentCategory.CASE
        ];
        const presentCategories = build.value.components.map(c => c.category);
        const matches = essentialCategories.filter(cat => presentCategories.includes(cat));
        return Math.round((matches.length / essentialCategories.length) * 100);
    };

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
        // Implementa la logica di edit
        router.push(`/components/${component.id}/edit`);
    };

    const removeComponent = async (component: Component) => {
        if (!build.value) return;

        if (confirm(`Vuoi rimuovere ${component.model} dalla build?`)) {
            try {
                await buildsStore.removeComponentFromBuild(build.value.id, component.id);
            } catch (error) {
                console.error('Errore nella rimozione:', error);
            }
        }
    };

    onMounted(() => {
        if (build.value) {
            buildsStore.setCurrentBuild(build.value);
        }
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
        animation: gridMove 30s linear infinite;
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
        background: radial-gradient(circle at 40% 30%,
                rgba(var(--color-primary-rgb), 0.12) 0%,
                transparent 50%),
            radial-gradient(circle at 60% 70%,
                rgba(var(--color-accent-rgb), 0.08) 0%,
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
    .add-btn {
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

    .completion-progress {
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
        backdrop-filter: blur(10px);
    }

    .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-3);
    }

    .progress-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
    }

    .progress-value {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary);
    }

    .progress-bar {
        height: 8px;
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
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: var(--space-6);
    }

    .component-card {
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-xl);
        overflow: hidden;
        transition: var(--transition-all);
        backdrop-filter: blur(20px);
    }

    .component-card.has-component {
        border-color: rgba(var(--color-success-rgb), 0.4);
        box-shadow: 0 0 0 1px rgba(var(--color-success-rgb), 0.1);
    }

    .component-card:hover {
        transform: translateY(-4px);
        border-color: rgba(var(--color-primary-rgb), 0.4);
        box-shadow: 0 12px 30px rgba(var(--color-primary-rgb), 0.15);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-4);
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
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-dark);
    }

    .status-indicator {
        font-size: 1.25rem;
        color: var(--color-text-muted);
        transition: var(--transition-colors);
    }

    .status-indicator.filled {
        color: var(--color-success);
    }

    .card-content {
        padding: var(--space-4);
        min-height: 120px;
        display: flex;
        align-items: center;
    }

    .component-content {
        width: 100%;
    }

    .component-name {
        margin: 0 0 var(--space-2) 0;
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

    /* Empty Slot */
    .empty-slot {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .empty-content {
        text-align: center;
        padding: var(--space-4);
    }

    .empty-icon {
        font-size: 2rem;
        color: var(--color-text-muted);
        opacity: 0.5;
        margin-bottom: var(--space-2);
    }

    .empty-text {
        margin: 0 0 var(--space-3) 0;
        color: var(--color-text-muted);
        font-size: var(--font-size-sm);
    }

    .add-component-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-4);
        background: rgba(var(--color-primary-rgb), 0.1);
        border: 1px solid rgba(var(--color-primary-rgb), 0.3);
        border-radius: var(--radius-lg);
        color: var(--color-primary);
        cursor: pointer;
        transition: var(--transition-all);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
    }

    .add-component-btn:hover {
        background: rgba(var(--color-primary-rgb), 0.2);
        border-color: rgba(var(--color-primary-rgb), 0.5);
        transform: translateY(-2px);
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
    .form-select {
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
    .form-select:focus {
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
        .overview-stats {
            flex-direction: column;
        }

        .components-grid {
            grid-template-columns: 1fr;
        }

        .header-content {
            flex-wrap: wrap;
            gap: var(--space-3);
        }

        .component-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
        }
    }

    @media (max-width: 480px) {
        .modal-overlay {
            padding: var(--space-2);
        }

        .component-actions {
            flex-wrap: wrap;
        }
    }
</style>