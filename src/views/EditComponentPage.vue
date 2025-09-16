<template>
    <ion-page>
        <ion-content>
            <div class="edit-component-page">
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
                            <h1>{{ isLoading ? 'Caricamento...' : 'Modifica Componente' }}</h1>
                            <p v-if="component">{{ getCategoryName(component.category) }} - {{ component.model }}</p>
                            <p v-else>Modifica le specifiche del componente selezionato</p>
                        </div>
                        <div class="header-actions">
                            <button v-if="component && hasChanges" @click="showResetModal = true" class="reset-btn"
                                title="Ripristina modifiche">
                                <Icon icon="mdi:restore" />
                                Ripristina
                            </button>
                            <button @click="saveChanges" :disabled="!canSave || isSaving" class="save-btn"
                                :class="{ 'loading': isSaving }">
                                <Icon v-if="isSaving" icon="mdi:loading" class="spin" />
                                <Icon v-else icon="mdi:content-save" />
                                {{ isSaving ? 'Salvataggio...' : 'Salva' }}
                            </button>
                        </div>
                    </div>
                </header>

                <!-- Main Content -->
                <div v-if="component" class="edit-container">
                    <!-- Component Preview Card -->
                    <div class="preview-section">
                        <div class="section-header">
                            <h2>Anteprima Componente</h2>
                            <div class="header-line"></div>
                        </div>

                        <ComponentCard :component="previewComponent" :clickable="false" :show-actions="false"
                            :show-date="false" />
                    </div>

                    <!-- Edit Form -->
                    <div class="form-section">
                        <div class="section-header">
                            <h2>Dettagli Componente</h2>
                            <div class="header-line"></div>
                        </div>

                        <div class="form-container">
                            <!-- Basic Information -->
                            <div class="form-group">
                                <label class="form-label">
                                    <Icon icon="mdi:tag" class="label-icon" />
                                    Categoria
                                </label>
                                <select v-model="editForm.category" class="form-select" :disabled="isLoading">
                                    <option v-for="category in allCategories" :key="category" :value="category">
                                        {{ getCategoryName(category) }}
                                    </option>
                                </select>
                                <small class="form-hint">La categoria del componente nel sistema</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <Icon icon="mdi:cube-outline" class="label-icon" />
                                    Nome Modello
                                </label>
                                <input v-model="editForm.model" type="text" class="form-input"
                                    placeholder="es. AMD Ryzen 9 7900X" :disabled="isLoading" />
                                <small class="form-hint">Nome completo del modello del componente</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <Icon icon="mdi:currency-eur" class="label-icon" />
                                    Prezzo (€)
                                </label>
                                <input v-model.number="editForm.price" type="number" step="0.01" min="0"
                                    class="form-input" placeholder="0.00" :disabled="isLoading" />
                                <small class="form-hint">Prezzo attuale del componente</small>
                            </div>

                            <!-- Amazon Integration -->
                            <div class="form-group">
                                <label class="form-label">
                                    <Icon icon="mdi:shopping" class="label-icon" />
                                    Link Amazon (opzionale)
                                </label>
                                <div class="url-input-group">
                                    <input v-model="editForm.amazonUrl" type="url" class="form-input"
                                        placeholder="https://amzn.eu/d/..." :disabled="isLoading"
                                        @blur="fetchAmazonData" />
                                    <button v-if="editForm.amazonUrl" @click="fetchAmazonData"
                                        :disabled="componentsStore.loading || isLoading" class="fetch-btn"
                                        title="Aggiorna dati Amazon">
                                        <Icon :icon="componentsStore.loading ? 'mdi:loading' : 'mdi:refresh'"
                                            :class="{ 'spin': componentsStore.loading }" />
                                    </button>
                                </div>
                                <small class="form-hint">Link del prodotto su Amazon per sincronizzazione
                                    automatica</small>

                                <!-- Amazon Product Info -->
                                <div v-if="amazonProductInfo" class="amazon-info">
                                    <div class="info-header">
                                        <Icon icon="mdi:information" />
                                        <span>Informazioni da Amazon</span>
                                        <button @click="applyAmazonData" class="apply-btn">
                                            <Icon icon="mdi:download" />
                                            Applica Dati
                                        </button>
                                    </div>
                                    <div class="info-content">
                                        <div class="info-item">
                                            <strong>Nome:</strong> {{ amazonProductInfo.title }}
                                        </div>
                                        <div class="info-item">
                                            <strong>Prezzo:</strong> €{{ amazonProductInfo.price.toFixed(2) }}
                                        </div>
                                        <div v-if="amazonProductInfo.specifications?.length" class="info-item">
                                            <strong>Specifiche:</strong>
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
                                    <Icon icon="mdi:format-list-bulleted" class="label-icon" />
                                    Specifiche Tecniche
                                </label>
                                <div class="specs-editor">
                                    <textarea v-model="specificationsText" class="form-textarea" rows="6"
                                        placeholder="Inserisci le specifiche, una per riga:&#10;12 Core / 24 Thread&#10;Base Clock: 3.7 GHz&#10;Boost Clock: 5.6 GHz&#10;AM5 Socket&#10;65W TDP"
                                        :disabled="isLoading" />
                                    <div class="specs-preview">
                                        <div class="preview-header">
                                            <Icon icon="mdi:eye" />
                                            <span>Anteprima Tag</span>
                                        </div>
                                        <div class="specs-tags">
                                            <span v-for="spec in previewSpecs" :key="spec" class="spec-tag">
                                                {{ spec }}
                                            </span>
                                            <span v-if="previewSpecs.length === 0" class="empty-specs">
                                                Nessuna specifica inserita
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <small class="form-hint">Inserisci le specifiche tecniche, una per riga</small>
                            </div>

                            <!-- Image URL -->
                            <div class="form-group">
                                <label class="form-label">
                                    <Icon icon="mdi:image" class="label-icon" />
                                    URL Immagine (opzionale)
                                </label>
                                <input v-model="editForm.imageUrl" type="url" class="form-input"
                                    placeholder="https://esempio.com/immagine.jpg" :disabled="isLoading" />
                                <small class="form-hint">URL dell'immagine del componente</small>
                            </div>

                            <!-- Change Summary -->
                            <div v-if="hasChanges" class="changes-summary">
                                <div class="summary-header">
                                    <Icon icon="mdi:pencil" />
                                    <span>Modifiche Rilevate</span>
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
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-else-if="isLoading" class="loading-container">
                    <div class="loading-content">
                        <Icon icon="mdi:loading" class="loading-icon spin" />
                        <h3>Caricamento componente...</h3>
                        <p>Attendere prego</p>
                    </div>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="error-container">
                    <div class="error-content">
                        <Icon icon="mdi:alert-circle" class="error-icon" />
                        <h3>Componente non trovato</h3>
                        <p>{{ error }}</p>
                        <button @click="goBack" class="error-btn">
                            <Icon icon="mdi:arrow-left" />
                            Torna Indietro
                        </button>
                    </div>
                </div>

                <!-- Reset Confirmation Modal -->
                <BaseModal v-model="showResetModal" title="Ripristina Modifiche" icon="mdi:restore" size="sm"
                    confirm-text="Ripristina" cancel-text="Annulla" @confirm="resetChanges"
                    @cancel="showResetModal = false">
                    <p>Sei sicuro di voler ripristinare tutte le modifiche ai valori originali?</p>
                    <p><strong>Questa azione non può essere annullata.</strong></p>
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

        editForm.value.model = amazonProductInfo.value.title;
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
        animation: gridMove 40s linear infinite;
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
        background: radial-gradient(circle at 20% 80%,
                rgba(var(--color-primary-rgb), 0.1) 0%,
                transparent 50%),
            radial-gradient(circle at 80% 20%,
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
    .reset-btn,
    .save-btn {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-4);
        border-radius: var(--radius-lg);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: var(--transition-all);
        border: 1px solid transparent;
    }

    .back-btn {
        background: rgba(var(--color-secondary-rgb), 0.1);
        border-color: rgba(var(--color-secondary-rgb), 0.3);
        color: var(--color-text-muted);
    }

    .back-btn:hover {
        background: rgba(var(--color-secondary-rgb), 0.2);
        color: var(--color-text-dark);
    }

    .reset-btn {
        background: rgba(var(--color-warning-rgb), 0.1);
        border-color: rgba(var(--color-warning-rgb), 0.3);
        color: var(--color-warning);
    }

    .reset-btn:hover {
        background: rgba(var(--color-warning-rgb), 0.2);
        transform: translateY(-2px);
    }

    .save-btn {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: var(--color-white);
    }

    .save-btn:hover:not(:disabled) {
        background: var(--color-primary-light);
        border-color: var(--color-primary-light);
        transform: translateY(-2px);
        box-shadow: var(--shadow-primary);
    }

    .save-btn:disabled {
        opacity: var(--opacity-50);
        cursor: not-allowed;
    }

    .save-btn.loading {
        cursor: wait;
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

    .header-actions {
        display: flex;
        gap: var(--space-3);
    }

    /* Main Content */
    .edit-container {
        position: relative;
        z-index: 3;
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--space-6);
        display: grid;
        grid-template-columns: 350px 1fr;
        gap: var(--space-8);
    }

    .section-header {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        margin-bottom: var(--space-6);
    }

    .section-header h2 {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0;
    }

    .header-line {
        flex: 1;
        height: 2px;
        background: linear-gradient(90deg, var(--color-primary), transparent);
    }

    /* Preview Section */
    .preview-section {
        position: sticky;
        top: var(--space-6);
        height: fit-content;
    }

    /* Form Section */
    .form-container {
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-xl);
        padding: var(--space-6);
        backdrop-filter: blur(20px);
    }

    .form-group {
        margin-bottom: var(--space-6);
    }

    .form-label {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-2);
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-sm);
        color: var(--color-text-dark);
    }

    .label-icon {
        font-size: 1rem;
        color: var(--color-primary);
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

    .form-input:disabled,
    .form-select:disabled,
    .form-textarea:disabled {
        opacity: var(--opacity-50);
        cursor: not-allowed;
    }

    .form-hint {
        display: block;
        margin-top: var(--space-1);
        color: var(--color-text-muted);
        font-size: var(--font-size-xs);
        line-height: var(--line-height-relaxed);
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

    /* Amazon Info */
    .amazon-info {
        margin-top: var(--space-4);
        background: rgba(var(--color-info-rgb), 0.05);
        border: 1px solid rgba(var(--color-info-rgb), 0.2);
        border-radius: var(--radius-lg);
        overflow: hidden;
    }

    .info-header {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-4);
        background: rgba(var(--color-info-rgb), 0.1);
        border-bottom: 1px solid rgba(var(--color-info-rgb), 0.2);
        color: var(--color-info);
        font-weight: var(--font-weight-medium);
    }

    .apply-btn {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: var(--space-1);
        padding: var(--space-1) var(--space-2);
        background: var(--color-info);
        color: var(--color-white);
        border: none;
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        cursor: pointer;
        transition: var(--transition-all);
    }

    .apply-btn:hover {
        background: var(--color-info-light);
    }

    .info-content {
        padding: var(--space-4);
    }

    .info-item {
        margin-bottom: var(--space-3);
        font-size: var(--font-size-sm);
    }

    .specs-grid {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-1);
        margin-top: var(--space-2);
    }

    .spec-badge {
        background: rgba(var(--color-info-rgb), 0.2);
        color: var(--color-info);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
    }

    /* Specifications Editor */
    .specs-editor {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-4);
    }

    .specs-preview {
        background: rgba(var(--color-secondary-rgb), 0.05);
        border: 1px solid rgba(var(--color-secondary-rgb), 0.2);
        border-radius: var(--radius-md);
        padding: var(--space-3);
    }

    .preview-header {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-3);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
    }

    .specs-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-1);
    }

    .spec-tag {
        background: rgba(var(--color-primary-rgb), 0.15);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        color: var(--color-primary-light);
    }

    .empty-specs {
        color: var(--color-text-muted);
        font-style: italic;
        font-size: var(--font-size-xs);
    }

    /* Changes Summary */
    .changes-summary {
        background: rgba(var(--color-warning-rgb), 0.05);
        border: 1px solid rgba(var(--color-warning-rgb), 0.2);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
        margin-top: var(--space-6);
    }

    .summary-header {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-3);
        font-weight: var(--font-weight-semibold);
        color: var(--color-warning);
    }

    .changes-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }

    .change-item {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-2);
        background: rgba(var(--color-warning-rgb), 0.1);
        border-radius: var(--radius-md);
    }

    .change-icon {
        font-size: 1rem;
        color: var(--color-warning);
    }

    .change-content {
        flex: 1;
    }

    .change-field {
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-sm);
        color: var(--color-text-dark);
    }

    .change-values {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-top: var(--space-1);
        font-size: var(--font-size-xs);
    }

    .old-value {
        color: var(--color-text-muted);
        text-decoration: line-through;
    }

    .arrow {
        color: var(--color-warning);
        font-size: 0.75rem;
    }

    .new-value {
        color: var(--color-success);
        font-weight: var(--font-weight-medium);
    }

    /* Loading & Error States */
    .loading-container,
    .error-container {
        position: relative;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        padding: var(--space-6);
    }

    .loading-content,
    .error-content {
        text-align: center;
        max-width: 400px;
    }

    .loading-icon,
    .error-icon {
        font-size: 4rem;
        margin-bottom: var(--space-4);
    }

    .loading-icon {
        color: var(--color-primary);
    }

    .error-icon {
        color: var(--color-error);
    }

    .loading-content h3,
    .error-content h3 {
        margin: 0 0 var(--space-2) 0;
        font-size: var(--font-size-xl);
        color: var(--color-text-dark);
    }

    .loading-content p,
    .error-content p {
        margin: 0 0 var(--space-6) 0;
        color: var(--color-text-muted);
    }

    .error-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-6);
        background: var(--color-error);
        color: var(--color-white);
        border: none;
        border-radius: var(--radius-lg);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: var(--transition-all);
    }

    .error-btn:hover {
        background: var(--color-error-light);
        transform: translateY(-2px);
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

    /* Responsive */
    @media (max-width: 1024px) {
        .edit-container {
            grid-template-columns: 1fr;
            gap: var(--space-6);
        }

        .preview-section {
            position: relative;
            top: auto;
        }
    }

    @media (max-width: 768px) {
        .header-content {
            flex-wrap: wrap;
            gap: var(--space-3);
        }

        .header-actions {
            width: 100%;
            justify-content: flex-end;
        }

        .specs-editor {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 480px) {
        .edit-container {
            padding: var(--space-4);
        }

        .form-container {
            padding: var(--space-4);
        }

        .url-input-group {
            flex-direction: column;
        }

        .fetch-btn {
            width: 100%;
            height: 40px;
        }
    }
</style>