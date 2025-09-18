<template>
    <ion-page>
        <ion-content>
            <div class="edit-component-page">
                <!-- Animated Background -->
                <div class="bg-mesh"></div>
                <div class="bg-gradient"></div>

                <!-- Premium Header -->
                <header class="page-header">
                    <div class="header-content">
                        <nav class="breadcrumb">
                            <button @click="goBack" class="breadcrumb-item">
                                <Icon icon="mdi:chevron-left" />
                                <span>Components</span>
                            </button>
                            <Icon icon="mdi:chevron-right" class="breadcrumb-separator" />
                            <span class="breadcrumb-current">{{ component ? 'Edit Component' : 'Loading...' }}</span>
                        </nav>

                        <div class="header-main">
                            <div class="component-identity">
                                <div class="component-avatar">
                                    <Icon icon="mdi:pencil-box" />
                                </div>
                                <div class="component-meta">
                                    <h1 class="component-name">{{ component ? 'Edit Component' : 'Loading Component...'
                                        }}</h1>
                                    <p class="component-description">
                                        {{ component ? `${getCategoryName(component.category)} - ${component.model}` :
                                            'Modify component specifications and details' }}
                                    </p>
                                </div>
                            </div>

                            <div class="header-actions">
                                <button v-if="component && hasChanges" @click="showResetModal = true"
                                    class="action-secondary">
                                    <Icon icon="mdi:restore" />
                                    <span>Reset</span>
                                </button>
                                <button @click="saveChanges" :disabled="!canSave || isSaving" class="action-primary">
                                    <Icon v-if="isSaving" icon="mdi:loading" class="loading-spin" />
                                    <Icon v-else icon="mdi:content-save" />
                                    <span>{{ isSaving ? 'Saving...' : 'Save' }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Main Dashboard -->
                <main v-if="component" class="dashboard">
                    <div class="dashboard-grid">
                        <!-- Component Preview Section -->
                        <section class="preview-section">
                            <div class="section-header">
                                <h2>Component Preview</h2>
                                <div class="section-divider"></div>
                            </div>

                            <div class="preview-container">
                                <ComponentCard :component="previewComponent" :clickable="false" :show-actions="false"
                                    :show-date="false" />
                            </div>

                            <!-- Changes Summary -->
                            <div v-if="hasChanges" class="changes-summary">
                                <div class="summary-header">
                                    <Icon icon="mdi:pencil" />
                                    <span>Pending Changes</span>
                                </div>
                                <div class="changes-list">
                                    <div v-for="change in changesSummary" :key="change.field" class="change-item">
                                        <Icon :icon="change.icon" class="change-icon" />
                                        <div class="change-content">
                                            <span class="change-field">{{ change.label }}</span>
                                            <div class="change-values">
                                                <span class="old-value">{{ change.oldValue }}</span>
                                                <Icon icon="mdi:arrow-right" class="arrow" />
                                                <span class="new-value">{{ change.newValue }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Edit Form Section -->
                        <section class="form-section">
                            <div class="section-header">
                                <h2>Component Details</h2>
                                <div class="section-divider"></div>
                            </div>

                            <div class="form-container">
                                <!-- Basic Information -->
                                <div class="form-group">
                                    <label class="form-label">
                                        <Icon icon="mdi:tag" />
                                        Category
                                    </label>
                                    <select v-model="editForm.category" class="form-select premium"
                                        :disabled="isLoading">
                                        <option v-for="category in allCategories" :key="category" :value="category">
                                            {{ getCategoryName(category) }}
                                        </option>
                                    </select>
                                    <span class="form-hint">Component category in the system</span>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        <Icon icon="mdi:cube-outline" />
                                        Model Name
                                    </label>
                                    <input v-model="editForm.model" type="text" class="form-input premium"
                                        placeholder="e.g. AMD Ryzen 9 7900X" :disabled="isLoading" />
                                    <span class="form-hint">Complete component model name</span>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        <Icon icon="mdi:currency-eur" />
                                        Price (€)
                                    </label>
                                    <input v-model.number="editForm.price" type="number" step="0.01" min="0"
                                        class="form-input premium" placeholder="0.00" :disabled="isLoading" />
                                    <span class="form-hint">Current component price</span>
                                </div>

                                <!-- Amazon Integration -->
                                <div class="form-group">
                                    <label class="form-label">
                                        <Icon icon="mdi:shopping" />
                                        Amazon Link (Optional)
                                    </label>
                                    <div class="input-group premium">
                                        <input v-model="editForm.amazonUrl" type="url" class="form-input"
                                            placeholder="https://amzn.eu/d/..." :disabled="isLoading"
                                            @blur="fetchAmazonData" />
                                        <button v-if="editForm.amazonUrl" @click="fetchAmazonData"
                                            :disabled="componentsStore.loading || isLoading" class="input-action"
                                            title="Refresh Amazon data">
                                            <Icon :icon="componentsStore.loading ? 'mdi:loading' : 'mdi:refresh'"
                                                :class="{ 'loading-spin': componentsStore.loading }" />
                                        </button>
                                    </div>
                                    <span class="form-hint">Amazon product link for automatic synchronization</span>

                                    <!-- Amazon Product Info -->
                                    <div v-if="amazonProductInfo" class="amazon-info">
                                        <div class="info-header">
                                            <Icon icon="mdi:information" />
                                            <span>Amazon Information</span>
                                            <button @click="applyAmazonData" class="apply-btn">
                                                <Icon icon="mdi:download" />
                                                Apply Data
                                            </button>
                                        </div>
                                        <div class="info-content">
                                            <div class="info-item">
                                                <strong>Name:</strong> {{ amazonProductInfo.title }}
                                            </div>
                                            <div class="info-item">
                                                <strong>Price:</strong> €{{ amazonProductInfo.price.toFixed(2) }}
                                            </div>
                                            <div v-if="amazonProductInfo.specifications?.length" class="info-item">
                                                <strong>Specifications:</strong>
                                                <div class="specs-grid">
                                                    <span v-for="spec in amazonProductInfo.specifications" :key="spec"
                                                        class="spec-badge">
                                                        {{ spec }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Specifications -->
                                <div class="form-group">
                                    <label class="form-label">
                                        <Icon icon="mdi:format-list-bulleted" />
                                        Technical Specifications
                                    </label>
                                    <div class="specs-editor">
                                        <textarea v-model="specificationsText" class="form-textarea premium" rows="6"
                                            placeholder="Enter specifications, one per line:&#10;12 Core / 24 Thread&#10;Base Clock: 3.7 GHz&#10;Boost Clock: 5.6 GHz&#10;AM5 Socket&#10;65W TDP"
                                            :disabled="isLoading" />

                                        <div class="specs-preview">
                                            <div class="preview-header">
                                                <Icon icon="mdi:eye" />
                                                <span>Tag Preview</span>
                                            </div>
                                            <div class="specs-tags">
                                                <span v-for="spec in previewSpecs" :key="spec" class="spec-tag">
                                                    {{ spec }}
                                                </span>
                                                <span v-if="previewSpecs.length === 0" class="empty-specs">
                                                    No specifications entered
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span class="form-hint">Enter technical specifications, one per line</span>
                                </div>

                                <!-- Image URL -->
                                <div class="form-group">
                                    <label class="form-label">
                                        <Icon icon="mdi:image" />
                                        Image URL (Optional)
                                    </label>
                                    <input v-model="editForm.imageUrl" type="url" class="form-input premium"
                                        placeholder="https://example.com/image.jpg" :disabled="isLoading" />
                                    <span class="form-hint">Component image URL</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>

                <!-- Loading State -->
                <div v-else-if="isLoading" class="loading-container">
                    <div class="loading-content">
                        <Icon icon="mdi:loading" class="loading-icon loading-spin" />
                        <h3>Loading component...</h3>
                        <p>Please wait</p>
                    </div>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="error-container">
                    <div class="error-content">
                        <Icon icon="mdi:alert-circle" class="error-icon" />
                        <h3>Component not found</h3>
                        <p>{{ error }}</p>
                        <button @click="goBack" class="error-btn">
                            <Icon icon="mdi:arrow-left" />
                            Go Back
                        </button>
                    </div>
                </div>

                <!-- Reset Confirmation Modal -->
                <BaseModal v-model="showResetModal" title="Reset Changes" icon="mdi:restore" size="sm"
                    confirm-text="Reset" cancel-text="Cancel" @confirm="resetChanges" @cancel="showResetModal = false">
                    <p>Are you sure you want to reset all changes to their original values?</p>
                    <p><strong>This action cannot be undone.</strong></p>
                </BaseModal>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, watch } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { IonPage, IonContent } from '@ionic/vue';
    import { useComponentsStore } from '@/stores/useComponentsStore';
    import { ComponentCategory, Component, AmazonProductInfo } from '@/interfaces/builds';
    import ComponentCard from '@/components/ComponentCard.vue';
    import BaseModal from '@/components/BaseModal.vue';
    import { shortenProductTitle } from "@/composables/heuristicTitle";

    const route = useRoute();
    const router = useRouter();
    const componentsStore = useComponentsStore();

    // State
    const component = ref<Component | null>(null);
    const isLoading = ref(true);
    const isSaving = ref(false);
    const error = ref<string | null>(null);
    const showResetModal = ref(false);
    const amazonProductInfo = ref<AmazonProductInfo | null>(null);

    // Form data
    const editForm = ref({
        category: '' as ComponentCategory,
        model: '',
        price: 0,
        amazonUrl: '',
        imageUrl: ''
    });

    const specificationsText = ref('');
    const originalComponent = ref<Component | null>(null);

    // Computed
    const componentId = computed(() => route.params.id as string);
    const allCategories = Object.values(ComponentCategory);

    const previewSpecs = computed(() => {
        return specificationsText.value
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0);
    });

    const previewComponent = computed<Component>(() => {
        // Se il componente non è ancora caricato, creiamo un oggetto di preview di fallback
        const fallbackCategory =
            editForm.value.category ||
            (allCategories[0] as ComponentCategory);

        const base: Component = component.value ?? {
            id: 'preview',
            category: fallbackCategory,
            title: componentsStore.getCategoryDisplayName(fallbackCategory),
            model: editForm.value.model || 'Nome modello',
            price: editForm.value.price || 0,
            specifications: [] as string[],
            amazonUrl: editForm.value.amazonUrl || '',
            imageUrl: editForm.value.imageUrl || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return {
            ...base,
            category: editForm.value.category || base.category,
            title: componentsStore.getCategoryDisplayName(editForm.value.category || base.category),
            model: editForm.value.model || base.model,
            price: editForm.value.price || 0,
            specifications: previewSpecs.value,
            amazonUrl: editForm.value.amazonUrl || undefined,
            imageUrl: editForm.value.imageUrl || undefined,
            updatedAt: new Date(),
        };
    });

    const hasChanges = computed(() => {
        if (!originalComponent.value) return false;

        const originalSpecs = (originalComponent.value.specifications || []).join('\n');
        const currentSpecs = specificationsText.value.trim();

        return (
            editForm.value.category !== originalComponent.value.category ||
            editForm.value.model !== originalComponent.value.model ||
            editForm.value.price !== originalComponent.value.price ||
            editForm.value.amazonUrl !== (originalComponent.value.amazonUrl || '') ||
            editForm.value.imageUrl !== (originalComponent.value.imageUrl || '') ||
            currentSpecs !== originalSpecs
        );
    });

    const canSave = computed(() => {
        return hasChanges.value &&
            editForm.value.model.trim() !== '' &&
            editForm.value.price > 0 &&
            !isLoading.value;
    });

    const changesSummary = computed(() => {
        if (!originalComponent.value || !hasChanges.value) return [];

        const changes = [];

        if (editForm.value.category !== originalComponent.value.category) {
            changes.push({
                field: 'category',
                label: 'Categoria',
                icon: 'mdi:tag',
                oldValue: getCategoryName(originalComponent.value.category),
                newValue: getCategoryName(editForm.value.category)
            });
        }

        if (editForm.value.model !== originalComponent.value.model) {
            changes.push({
                field: 'model',
                label: 'Modello',
                icon: 'mdi:cube-outline',
                oldValue: originalComponent.value.model,
                newValue: editForm.value.model
            });
        }

        if (editForm.value.price !== originalComponent.value.price) {
            changes.push({
                field: 'price',
                label: 'Prezzo',
                icon: 'mdi:currency-eur',
                oldValue: `€${originalComponent.value.price.toFixed(2)}`,
                newValue: `€${editForm.value.price.toFixed(2)}`
            });
        }

        const originalSpecs = (originalComponent.value.specifications || []).join('\n');
        if (specificationsText.value.trim() !== originalSpecs) {
            changes.push({
                field: 'specifications',
                label: 'Specifiche',
                icon: 'mdi:format-list-bulleted',
                oldValue: originalComponent.value.specifications?.length ? `${originalComponent.value.specifications.length} specifiche` : 'Nessuna',
                newValue: previewSpecs.value.length ? `${previewSpecs.value.length} specifiche` : 'Nessuna'
            });
        }

        return changes;
    });

    // Methods
    const loadComponent = async () => {
        try {
            isLoading.value = true;
            error.value = null;

            const comp = componentsStore.getComponentById(componentId.value);
            if (!comp) {
                throw new Error('Componente non trovato');
            }

            component.value = comp;
            originalComponent.value = { ...comp };

            // Popola il form
            editForm.value = {
                category: comp.category,
                model: comp.model,
                price: comp.price,
                amazonUrl: comp.amazonUrl || '',
                imageUrl: comp.imageUrl || ''
            };

            specificationsText.value = (comp.specifications || []).join('\n');

        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Errore sconosciuto';
        } finally {
            isLoading.value = false;
        }
    };

    const getCategoryName = (category: ComponentCategory) => {
        return componentsStore.getCategoryDisplayName(category);
    };

    const fetchAmazonData = async () => {
        if (!editForm.value.amazonUrl?.trim()) {
            amazonProductInfo.value = null;
            return;
        }

        try {
            amazonProductInfo.value = await componentsStore.fetchAmazonProductInfo(editForm.value.amazonUrl);
        } catch (error) {
            console.error('Errore nel recupero dati Amazon:', error);
            amazonProductInfo.value = null;
        }
    };

    const applyAmazonData = () => {
        if (!amazonProductInfo.value) return;

        editForm.value.model = shortenProductTitle(
            amazonProductInfo.value.title,
            editForm.value.category
        );
        editForm.value.price = amazonProductInfo.value.price;

        if (amazonProductInfo.value.specifications?.length) {
            specificationsText.value = amazonProductInfo.value.specifications.join('\n');
        }

        if (amazonProductInfo.value.imageUrl) {
            editForm.value.imageUrl = amazonProductInfo.value.imageUrl;
        }

        amazonProductInfo.value = null;
    };

    const saveChanges = async () => {
        if (!component.value || !canSave.value) return;

        try {
            isSaving.value = true;

            const specs = previewSpecs.value.length > 0 ? previewSpecs.value : undefined;

            const updateData = {
                category: editForm.value.category,
                title: getCategoryName(editForm.value.category),
                model: editForm.value.model.trim(),
                price: editForm.value.price,
                specifications: specs,
                amazonUrl: editForm.value.amazonUrl.trim() || undefined,
                imageUrl: editForm.value.imageUrl.trim() || undefined,
            };

            await componentsStore.updateComponent(component.value.id, updateData);

            // Ricarica il componente aggiornato
            await loadComponent();

            // Torna alla pagina precedente
            goBack();

        } catch (error) {
            console.error('Errore nel salvataggio:', error);
        } finally {
            isSaving.value = false;
        }
    };

    const resetChanges = () => {
        if (!originalComponent.value) return;

        editForm.value = {
            category: originalComponent.value.category,
            model: originalComponent.value.model,
            price: originalComponent.value.price,
            amazonUrl: originalComponent.value.amazonUrl || '',
            imageUrl: originalComponent.value.imageUrl || ''
        };

        specificationsText.value = (originalComponent.value.specifications || []).join('\n');
        amazonProductInfo.value = null;
        showResetModal.value = false;
    };

    const goBack = () => {
        router.go(-1);
    };

    // Lifecycle
    onMounted(() => {
        loadComponent();
    });

    // Watchers
    watch(() => editForm.value.amazonUrl, () => {
        amazonProductInfo.value = null;
    });
</script>

<style scoped>
    .edit-component-page {
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

    .component-identity {
        display: flex;
        align-items: center;
        gap: var(--space-6);
        flex: 1;
    }

    .component-avatar {
        width: var(--space-16);
        height: var(--space-16);
        background: linear-gradient(135deg, var(--color-warning), var(--color-accent));
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-3xl);
        color: var(--color-white);
        box-shadow: 0 10px 25px rgba(var(--color-warning-rgb), 0.3);
    }

    .component-meta {
        flex: 1;
    }

    .component-name {
        font-size: var(--font-size-4xl);
        font-weight: var(--font-weight-bold);
        margin: 0 0 var(--space-2) 0;
        background: linear-gradient(135deg, var(--color-text-dark), var(--color-text-muted));
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: var(--line-height-tight);
    }

    .component-description {
        font-size: var(--font-size-md);
        color: var(--color-text-muted);
        margin: 0;
        line-height: var(--line-height-normal);
    }

    .header-actions {
        display: flex;
        gap: var(--space-4);
    }

    .action-primary,
    .action-secondary {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-6);
        border: none;
        border-radius: var(--radius-lg);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: var(--transition-medium);
        text-decoration: none;
    }

    .action-primary {
        background: var(--gradient-primary);
        color: var(--color-white);
        box-shadow: var(--shadow-primary);
    }

    .action-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.5);
    }

    .action-primary:disabled {
        opacity: var(--opacity-50);
        cursor: not-allowed;
        transform: none;
    }

    .action-secondary {
        background: rgba(var(--color-warning-rgb), 0.1);
        color: var(--color-warning);
        border: var(--border-thin) solid rgba(var(--color-warning-rgb), 0.3);
    }

    .action-secondary:hover {
        background: rgba(var(--color-warning-rgb), 0.2);
        transform: translateY(-2px);
    }

    /* Dashboard Layout */
    .dashboard {
        position: relative;
        z-index: calc(var(--z-base) + 2);
        max-width: var(--container-2xl);
        margin: 0 auto;
        padding: var(--space-12) var(--space-8);
    }

    .dashboard-grid {
        display: grid;
        grid-template-columns: 400px 1fr;
        gap: var(--space-12);
    }

    /* Section Headers */
    .section-header {
        display: flex;
        align-items: center;
        gap: var(--space-6);
        margin-bottom: var(--space-10);
    }

    .section-header h2 {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0;
    }

    .section-divider {
        flex: 1;
        height: 2px;
        background: linear-gradient(90deg, rgba(var(--color-primary-rgb), 0.6), transparent);
        border-radius: var(--radius-full);
    }

    /* Preview Section */
    .preview-section {
        position: sticky;
        top: var(--space-24);
        height: fit-content;
    }

    .preview-container {
        margin-bottom: var(--space-8);
    }

    /* Changes Summary */
    .changes-summary {
        background: rgba(var(--color-warning-rgb), 0.05);
        border: var(--border-thin) solid rgba(var(--color-warning-rgb), 0.2);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        margin-top: var(--space-8);
    }

    .summary-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-6);
        font-weight: var(--font-weight-semibold);
        color: var(--color-warning);
        padding-bottom: var(--space-3);
        border-bottom: var(--border-thin) solid rgba(var(--color-warning-rgb), 0.2);
    }

    .changes-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .change-item {
        display: flex;
        align-items: flex-start;
        gap: var(--space-3);
        padding: var(--space-3);
        background: rgba(var(--color-warning-rgb), 0.1);
        border-radius: var(--radius-md);
    }

    .change-icon {
        font-size: var(--font-size-lg);
        color: var(--color-warning);
        margin-top: 2px;
        flex-shrink: 0;
    }

    .change-content {
        flex: 1;
        min-width: 0;
    }

    .change-field {
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-sm);
        color: var(--color-text-dark);
        display: block;
        margin-bottom: var(--space-2);
    }

    .change-values {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-xs);
        flex-wrap: wrap;
    }

    .old-value {
        color: var(--color-text-muted);
        text-decoration: line-through;
        opacity: var(--opacity-70);
    }

    .arrow {
        color: var(--color-warning);
        font-size: 0.75rem;
        flex-shrink: 0;
    }

    .new-value {
        color: var(--color-success);
        font-weight: var(--font-weight-medium);
    }

    /* Form Section */
    .form-section {
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-2xl);
        padding: var(--space-8);
        backdrop-filter: blur(var(--blur-sm));
    }

    .form-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-8);
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }

    .form-label {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-sm);
        color: var(--color-text-dark);
    }

    .form-label svg {
        font-size: var(--font-size-lg);
        color: var(--color-primary);
    }

    .form-input,
    .form-select,
    .form-textarea {
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

    .form-input.premium,
    .form-select.premium,
    .form-textarea.premium {
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border: var(--border-2) solid rgba(var(--color-primary-rgb), 0.4);
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
        background: rgba(var(--color-surface-dark-rgb), 0.9);
    }

    .form-input:disabled,
    .form-select:disabled,
    .form-textarea:disabled {
        opacity: var(--opacity-50);
        cursor: not-allowed;
    }

    .form-select option {
        background: var(--color-surface-dark);
        color: var(--color-text-dark);
    }

    .form-hint {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        line-height: var(--line-height-relaxed);
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

    .input-group.premium .form-input {
        border: none;
        background: transparent;
        flex: 1;
    }

    .input-group.premium .form-input:focus {
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

    /* Amazon Info */
    .amazon-info {
        margin-top: var(--space-4);
        background: rgba(var(--color-info-rgb), 0.05);
        border: var(--border-thin) solid rgba(var(--color-info-rgb), 0.2);
        border-radius: var(--radius-lg);
        overflow: hidden;
    }

    .info-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-4) var(--space-6);
        background: rgba(var(--color-info-rgb), 0.1);
        border-bottom: var(--border-thin) solid rgba(var(--color-info-rgb), 0.2);
        color: var(--color-info);
        font-weight: var(--font-weight-medium);
    }

    .apply-btn {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-4);
        background: var(--color-info);
        color: var(--color-white);
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        cursor: pointer;
        transition: var(--transition-medium);
    }

    .apply-btn:hover {
        background: var(--color-info-dark);
    }

    .info-content {
        padding: var(--space-6);
    }

    .info-item {
        margin-bottom: var(--space-4);
        font-size: var(--font-size-sm);
    }

    .info-item:last-child {
        margin-bottom: 0;
    }

    .specs-grid {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
        margin-top: var(--space-3);
    }

    .spec-badge {
        background: rgba(var(--color-info-rgb), 0.2);
        color: var(--color-info);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
    }

    /* Specifications Editor */
    .specs-editor {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-6);
    }

    .specs-preview {
        background: rgba(var(--color-secondary-rgb), 0.05);
        border: var(--border-thin) solid rgba(var(--color-secondary-rgb), 0.2);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
    }

    .preview-header {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-4);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
    }

    .specs-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
    }

    .spec-tag {
        background: rgba(var(--color-primary-rgb), 0.15);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        color: var(--color-primary-light);
    }

    .empty-specs {
        color: var(--color-text-muted);
        font-style: italic;
        font-size: var(--font-size-xs);
    }

    /* Loading & Error States */
    .loading-container,
    .error-container {
        position: relative;
        z-index: calc(var(--z-base) + 2);
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        padding: var(--space-8);
    }

    .loading-content,
    .error-content {
        text-align: center;
        max-width: 400px;
    }

    .loading-icon,
    .error-icon {
        font-size: var(--font-size-6xl);
        margin-bottom: var(--space-6);
    }

    .loading-icon {
        color: var(--color-primary);
    }

    .error-icon {
        color: var(--color-error);
    }

    .loading-content h3,
    .error-content h3 {
        margin: 0 0 var(--space-3) 0;
        font-size: var(--font-size-2xl);
        color: var(--color-text-dark);
    }

    .loading-content p,
    .error-content p {
        margin: 0 0 var(--space-8) 0;
        color: var(--color-text-muted);
        font-size: var(--font-size-md);
    }

    .error-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-4) var(--space-8);
        background: var(--color-error);
        color: var(--color-white);
        border: none;
        border-radius: var(--radius-lg);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: var(--transition-medium);
    }

    .error-btn:hover {
        background: var(--color-error-dark);
        transform: translateY(-2px);
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

    /* Responsive Design */
    @media (max-width: 1024px) {
        .dashboard {
            padding: var(--space-8) var(--space-6);
        }

        .dashboard-grid {
            grid-template-columns: 1fr;
            gap: var(--space-8);
        }

        .preview-section {
            position: relative;
            top: auto;
        }

        .header-main {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-6);
        }

        .component-identity {
            width: 100%;
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

        .component-avatar {
            width: 48px;
            height: 48px;
            font-size: var(--font-size-2xl);
        }

        .component-name {
            font-size: var(--font-size-2xl);
        }

        .header-actions {
            width: 100%;
            justify-content: flex-end;
        }

        .action-primary span,
        .action-secondary span {
            display: none;
        }

        .specs-editor {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 640px) {
        .form-section {
            padding: var(--space-6);
        }

        .input-group.premium {
            flex-direction: column;
        }

        .header-actions {
            flex-direction: column;
            gap: var(--space-3);
        }

        .changes-list {
            gap: var(--space-3);
        }

        .change-item {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
        }
    }
</style>