<template>
    <ion-page>
        <ion-content>
            <div class="edit-build-page">
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
                            <span class="breadcrumb-current">{{ build ? 'Edit Build' : 'Loading...' }}</span>
                        </nav>

                        <div class="header-main">
                            <div class="build-identity">
                                <div class="build-avatar">
                                    <Icon icon="mdi:pencil-box" />
                                </div>
                                <div class="build-meta">
                                    <h1 class="build-name">{{ build ? 'Edit Build' : 'Loading Build...' }}</h1>
                                    <p class="build-description">
                                        {{ build ? `Editing "${build.name}" configuration` : 'Loading build details...'
                                        }}
                                    </p>
                                </div>
                            </div>

                            <div class="header-actions">
                                <button v-if="build && hasChanges" @click="showResetModal = true"
                                    class="action-secondary">
                                    <Icon icon="mdi:restore" />
                                    <span>Reset</span>
                                </button>
                                <button @click="saveChanges" :disabled="!canSave || isSaving" class="action-primary">
                                    <Icon v-if="isSaving" icon="mdi:loading" class="loading-spin" />
                                    <Icon v-else icon="mdi:content-save" />
                                    <span>{{ isSaving ? 'Saving...' : 'Save Changes' }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Loading State -->
                <div v-if="isLoading" class="loading-container">
                    <div class="loading-content">
                        <Icon icon="mdi:loading" class="loading-icon loading-spin" />
                        <h3>Loading Build</h3>
                        <p>Retrieving build details...</p>
                    </div>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="error-container">
                    <div class="error-content">
                        <Icon icon="mdi:alert-circle" class="error-icon" />
                        <h3>Build Not Found</h3>
                        <p>{{ error }}</p>
                        <button @click="goBack" class="error-action">
                            <Icon icon="mdi:arrow-left" />
                            <span>Back to Builds</span>
                        </button>
                    </div>
                </div>

                <!-- Main Dashboard -->
                <main v-else-if="build" class="dashboard">
                    <div class="dashboard-grid">
                        <!-- Build Preview Section -->
                        <section class="preview-section">
                            <div class="section-header">
                                <h2>Build Preview</h2>
                                <div class="section-divider"></div>
                            </div>

                            <div class="preview-container">
                                <div class="build-preview-card">
                                    <div class="preview-header">
                                        <div class="preview-avatar">
                                            <Icon icon="mdi:desktop-tower" />
                                        </div>
                                        <div class="preview-info">
                                            <h3 class="preview-name">{{ editForm.name || 'Unnamed Build' }}</h3>
                                            <p class="preview-description">{{ editForm.description ||
                                                'No description provided' }}</p>
                                        </div>
                                    </div>

                                    <div class="preview-stats">
                                        <div class="stat-item">
                                            <Icon icon="mdi:memory" class="stat-icon" />
                                            <div class="stat-data">
                                                <span class="stat-value">{{ totalComponentsCount }}</span>
                                                <span class="stat-label">Components</span>
                                            </div>
                                        </div>
                                        <div class="stat-item">
                                            <Icon icon="mdi:currency-eur" class="stat-icon" />
                                            <div class="stat-data">
                                                <span class="stat-value">€{{ totalPrice.toFixed(0) }}</span>
                                                <span class="stat-label">Total Cost</span>
                                            </div>
                                        </div>
                                        <div class="stat-item">
                                            <Icon icon="mdi:progress-check" class="stat-icon" />
                                            <div class="stat-data">
                                                <span class="stat-value">{{ completionPercentage }}%</span>
                                                <span class="stat-label">Complete</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="completion-progress">
                                        <div class="progress-info">
                                            <span class="progress-label">Build Completion</span>
                                            <span class="progress-percentage">{{ completionPercentage }}%</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress-fill" :style="{ width: `${completionPercentage}%` }"
                                                :class="progressClass">
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                                <h2>Build Details</h2>
                                <div class="section-divider"></div>
                            </div>

                            <div class="form-container">
                                <!-- Basic Information -->
                                <div class="form-group">
                                    <label class="form-label">
                                        <Icon icon="mdi:tag" />
                                        Build Name
                                    </label>
                                    <input v-model="editForm.name" type="text" class="form-input premium"
                                        placeholder="Enter build name..." :disabled="isLoading || isSaving"
                                        @input="validateForm" />
                                    <span class="form-hint">Give your build a memorable name</span>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        <Icon icon="mdi:text" />
                                        Description
                                    </label>
                                    <textarea v-model="editForm.description" class="form-textarea premium" rows="4"
                                        placeholder="Describe your build purpose, target use case, or special features..."
                                        :disabled="isLoading || isSaving"></textarea>
                                    <span class="form-hint">Optional description to help identify this
                                        configuration</span>
                                </div>

                                <!-- Build Metadata -->
                                <div class="metadata-section">
                                    <h3 class="metadata-title">
                                        <Icon icon="mdi:information" />
                                        Build Information
                                    </h3>
                                    <div class="metadata-grid">
                                        <div class="info-item">
                                            <Icon icon="mdi:calendar-plus" class="info-icon" />
                                            <div class="info-content">
                                                <span class="info-label">Created</span>
                                                <span class="info-value">{{ formatDate(build.createdAt) }}</span>
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <Icon icon="mdi:calendar-edit" class="info-icon" />
                                            <div class="info-content">
                                                <span class="info-label">Last Modified</span>
                                                <span class="info-value">{{ formatDate(build.updatedAt) }}</span>
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <Icon icon="mdi:identifier" class="info-icon" />
                                            <div class="info-content">
                                                <span class="info-label">Build ID</span>
                                                <span class="info-value build-id">{{ build.id }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Advanced Options -->
                                <div class="advanced-section">
                                    <h3 class="advanced-title">
                                        <Icon icon="mdi:cog" />
                                        Advanced Options
                                    </h3>
                                    <div class="advanced-options">
                                        <button @click="showDuplicateModal = true" class="option-btn">
                                            <Icon icon="mdi:content-copy" />
                                            <div class="option-content">
                                                <span class="option-name">Duplicate Build</span>
                                                <span class="option-desc">Create a copy of this build</span>
                                            </div>
                                        </button>
                                        <button @click="exportBuild(buildId)" class="option-btn">
                                            <Icon icon="mdi:export" />
                                            <div class="option-content">
                                                <span class="option-name">Export Build</span>
                                                <span class="option-desc">Download as JSON file</span>
                                            </div>
                                        </button>
                                        <button @click="showDeleteModal = true" class="option-btn danger">
                                            <Icon icon="mdi:delete" />
                                            <div class="option-content">
                                                <span class="option-name">Delete Build</span>
                                                <span class="option-desc">Permanently remove this build</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>

                <!-- Reset Changes Modal -->
                <BaseModal v-model="showResetModal" title="Reset Changes" icon="mdi:restore" type="warning"
                    confirm-text="Reset" cancel-text="Cancel" @confirm="resetChanges" @cancel="showResetModal = false">
                    <p>Are you sure you want to reset all changes to their original values?</p>
                    <p><strong>This action cannot be undone.</strong></p>
                </BaseModal>

                <!-- Duplicate Build Modal -->
                <BaseModal v-model="showDuplicateModal" title="Duplicate Build" icon="mdi:content-copy"
                    :confirm-disabled="!duplicateName.trim()" confirm-text="Create Duplicate" @confirm="duplicateBuild"
                    @cancel="showDuplicateModal = false">
                    <div class="duplicate-form">
                        <div class="form-field">
                            <label class="field-label">New Build Name</label>
                            <input v-model="duplicateName" type="text" class="field-input"
                                placeholder="Enter name for the duplicate build..." />
                        </div>
                    </div>
                </BaseModal>

                <!-- Delete Build Modal -->
                <BaseModal v-model="showDeleteModal" title="Delete Build" icon="mdi:delete" type="error"
                    confirm-text="Delete" cancel-text="Cancel" @confirm="deleteBuild" @cancel="showDeleteModal = false">
                    <p>Are you sure you want to permanently delete <strong>"{{ build?.name }}"</strong>?</p>
                    <p>This action cannot be undone and will remove:</p>
                    <ul class="delete-list">
                        <li>All build configuration data</li>
                        <li>Component associations</li>
                        <li>Build history and metadata</li>
                    </ul>
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
    import { PCBuild } from '@/interfaces/builds';
    import BaseModal from '@/components/BaseModal.vue';
    import { exportBuild } from '@/composables/buildJsonExport';
    import { useAlert } from '@/composables/alertManager';

    const route = useRoute();
    const router = useRouter();
    const buildsStore = useBuildsStore();
    const { success, error: showError, confirm } = useAlert();

    // State
    const build = ref<PCBuild | null>(null);
    const isLoading = ref(true);
    const isSaving = ref(false);
    const error = ref<string | null>(null);
    const showResetModal = ref(false);
    const showDuplicateModal = ref(false);
    const showDeleteModal = ref(false);
    const duplicateName = ref('');

    // Form data
    const editForm = ref({
        name: '',
        description: ''
    });

    const originalBuild = ref<PCBuild | null>(null);

    // Computed
    const buildId = computed(() => route.params.id as string);

    const hasChanges = computed(() => {
        if (!originalBuild.value) return false;

        return (
            editForm.value.name !== originalBuild.value.name ||
            editForm.value.description !== (originalBuild.value.description || '')
        );
    });

    const canSave = computed(() => {
        return hasChanges.value &&
            editForm.value.name.trim() !== '' &&
            !isLoading.value &&
            !isSaving.value;
    });

    const totalComponentsCount = computed(() => {
        if (!build.value) return 0;
        return Object.values(build.value.componentsByCategory).flat().length;
    });

    const totalPrice = computed(() => {
        if (!build.value) return 0;
        return Object.values(build.value.componentsByCategory).flat().reduce((total, c) => total + c.price, 0);
    });

    const completionPercentage = computed(() => {
        if (!build.value) return 0;
        const essentialCategories = ['cpu', 'motherboard', 'memory', 'storage_primary', 'psu', 'case'];
        const filledCategories = essentialCategories.filter(cat => {
            const components = build.value?.componentsByCategory[cat as keyof typeof build.value.componentsByCategory];
            return components && components.length > 0;
        });
        return Math.round((filledCategories.length / essentialCategories.length) * 100);
    });

    const progressClass = computed(() => {
        const completion = completionPercentage.value;
        if (completion === 100) return 'complete';
        if (completion >= 70) return 'almost';
        if (completion >= 30) return 'progress';
        return 'started';
    });

    const changesSummary = computed(() => {
        if (!originalBuild.value || !hasChanges.value) return [];

        const changes = [];

        if (editForm.value.name !== originalBuild.value.name) {
            changes.push({
                field: 'name',
                label: 'Build Name',
                icon: 'mdi:tag',
                oldValue: originalBuild.value.name,
                newValue: editForm.value.name
            });
        }

        if (editForm.value.description !== (originalBuild.value.description || '')) {
            changes.push({
                field: 'description',
                label: 'Description',
                icon: 'mdi:text',
                oldValue: originalBuild.value.description || 'No description',
                newValue: editForm.value.description || 'No description'
            });
        }

        return changes;
    });

    // Methods
    const loadBuild = async () => {
        try {
            isLoading.value = true;
            error.value = null;

            const foundBuild = buildsStore.getBuildById(buildId.value);

            if (!foundBuild) {
                error.value = 'Build not found';
                return;
            }

            build.value = foundBuild;
            originalBuild.value = { ...foundBuild };

            // Initialize form
            editForm.value = {
                name: foundBuild.name,
                description: foundBuild.description || ''
            };

            duplicateName.value = `${foundBuild.name} (Copy)`;

        } catch (err) {
            console.error('Error loading build:', err);
            error.value = 'Failed to load build';
        } finally {
            isLoading.value = false;
        }
    };

    const validateForm = () => {
        // Basic validation - could be expanded
        return editForm.value.name.trim().length > 0;
    };

    const saveChanges = async () => {
        if (!canSave.value || !build.value) return;

        try {
            isSaving.value = true;

            await buildsStore.updateBuild(build.value.id, {
                name: editForm.value.name.trim(),
                description: editForm.value.description.trim() || undefined
            });

            // Prima ottieni il build aggiornato dallo store
            const updatedBuild = buildsStore.getBuildById(buildId.value);

            // Poi aggiorna le referenze locali
            if (updatedBuild) {
                build.value = updatedBuild;
                originalBuild.value = { ...updatedBuild };

                // Assicurati che il form rifletta i valori salvati
                editForm.value = {
                    name: updatedBuild.name,
                    description: updatedBuild.description || ''
                };
            }

            await success('Build updated successfully!', 'Changes Saved');

        } catch (err) {
            console.error('Error saving build:', err);
            await showError('Failed to save changes. Please try again.');
        } finally {
            isSaving.value = false;
        }
    };


    const resetChanges = () => {
        if (!originalBuild.value) return;

        editForm.value = {
            name: originalBuild.value.name,
            description: originalBuild.value.description || ''
        };

        showResetModal.value = false;
    };

    const duplicateBuild = async () => {
        if (!build.value || !duplicateName.value.trim()) return;

        try {
            const newBuild = await buildsStore.createBuild(
                duplicateName.value.trim(),
                build.value.description
            );

            // Copy components
            for (const [category, components] of Object.entries(build.value.componentsByCategory)) {
                for (const component of components) {
                    await buildsStore.addComponentToBuild(newBuild.id, component);
                }
            }

            showDuplicateModal.value = false;
            await success(`Build "${duplicateName.value}" created successfully!`, 'Build Duplicated');

            // Navigate to the new build
            router.push(`/builds/${newBuild.id}`);

        } catch (err) {
            console.error('Error duplicating build:', err);
            await showError('Failed to duplicate build. Please try again.');
        }
    };

    const deleteBuild = async () => {
        if (!build.value) return;

        try {
            await buildsStore.deleteBuild(build.value.id);
            showDeleteModal.value = false;
            await success('Build deleted successfully.', 'Build Deleted');
            router.push('/builds');

        } catch (err) {
            console.error('Error deleting build:', err);
            await showError('Failed to delete build. Please try again.');
        }
    };

    const goBack = () => {
        if (hasChanges.value) {
            confirm('You have unsaved changes. Are you sure you want to leave?')
                .then((confirmed) => {
                    if (confirmed) {
                        router.push('/builds');
                    }
                });
        } else {
            router.push('/builds');
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    // Lifecycle
    onMounted(() => {
        loadBuild();
    });

    // Watchers
    watch(() => route.params.id, (newId) => {
        if (newId) {
            loadBuild();
        }
    });
</script>

<style scoped>
    .edit-build-page {
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
        background: linear-gradient(135deg, var(--color-warning), var(--color-accent));
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-3xl);
        color: var(--color-white);
        box-shadow: 0 10px 25px rgba(var(--color-warning-rgb), 0.3);
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

    .action-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.4);
    }

    .action-primary:disabled {
        opacity: var(--opacity-50);
        cursor: not-allowed;
        transform: none;
    }

    .action-secondary {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-6);
        background: rgba(var(--color-secondary-rgb), 0.1);
        border: var(--border-thin) solid rgba(var(--color-secondary-rgb), 0.3);
        border-radius: var(--radius-lg);
        color: var(--color-text-muted);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: var(--transition-medium);
    }

    .action-secondary:hover {
        background: rgba(var(--color-secondary-rgb), 0.2);
        border-color: rgba(var(--color-secondary-rgb), 0.5);
        color: var(--color-text-dark);
        transform: translateY(-1px);
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
        grid-template-columns: 1fr 1.5fr;
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

    .build-preview-card {
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
        border-radius: var(--radius-2xl);
        padding: var(--space-8);
        backdrop-filter: blur(var(--blur-sm));
    }

    .preview-header {
        display: flex;
        align-items: center;
        gap: var(--space-6);
        margin-bottom: var(--space-8);
    }

    .preview-avatar {
        width: 60px;
        height: 60px;
        background: var(--gradient-primary);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-2xl);
        color: var(--color-white);
        flex-shrink: 0;
    }

    .preview-info {
        flex: 1;
        min-width: 0;
    }

    .preview-name {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-2) 0;
        word-wrap: break-word;
    }

    .preview-description {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin: 0;
        line-height: var(--line-height-relaxed);
    }

    .preview-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-4);
        margin-bottom: var(--space-8);
    }

    .stat-item {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-4);
        background: rgba(var(--color-bg-dark-rgb), 0.4);
        border-radius: var(--radius-lg);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
    }

    .stat-icon {
        font-size: var(--font-size-lg);
        color: var(--color-accent);
        flex-shrink: 0;
    }

    .stat-data {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .stat-value {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
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
        margin-top: var(--space-6);
    }

    .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-3);
    }

    .progress-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        font-weight: var(--font-weight-medium);
    }

    .progress-percentage {
        font-size: var(--font-size-sm);
        color: var(--color-text-dark);
        font-weight: var(--font-weight-semibold);
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(var(--color-secondary-rgb), 0.2);
        border-radius: var(--radius-full);
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        transition: width var(--transition-slow);
        border-radius: var(--radius-full);
    }

    .progress-fill.complete {
        background: var(--color-success);
    }

    .progress-fill.almost {
        background: var(--color-warning);
    }

    .progress-fill.progress {
        background: var(--color-info);
    }

    .progress-fill.started {
        background: var(--color-secondary);
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
        color: var(--color-warning);
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-sm);
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
        gap: var(--space-4);
    }

    .change-icon {
        font-size: var(--font-size-md);
        color: var(--color-warning);
        margin-top: var(--space-1);
        flex-shrink: 0;
    }

    .change-content {
        flex: 1;
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
        font-size: var(--font-size-md);
        color: var(--color-primary);
    }

    .form-input,
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
        resize: vertical;
    }

    .form-input.premium,
    .form-textarea.premium {
        background: rgba(var(--color-surface-dark-rgb), 0.8);
        border: var(--border-2) solid rgba(var(--color-primary-rgb), 0.4);
    }

    .form-input:focus,
    .form-textarea:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
        background: rgba(var(--color-surface-dark-rgb), 0.9);
    }

    .form-input::placeholder,
    .form-textarea::placeholder {
        color: var(--color-text-muted);
    }

    .form-hint {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        margin-top: var(--space-1);
    }

    /* Metadata Section */
    .metadata-section {
        background: rgba(var(--color-bg-dark-rgb), 0.4);
        border: var(--border-thin) solid rgba(var(--color-secondary-rgb), 0.2);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
    }

    .metadata-title {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-6) 0;
    }

    .metadata-title svg {
        font-size: var(--font-size-lg);
        color: var(--color-info);
    }

    .metadata-grid {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .info-item {
        display: flex;
        align-items: center;
        gap: var(--space-4);
    }

    .info-icon {
        font-size: var(--font-size-md);
        color: var(--color-secondary);
        flex-shrink: 0;
    }

    .info-content {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
        flex: 1;
    }

    .info-label {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
        font-weight: var(--font-weight-medium);
    }

    .info-value {
        font-size: var(--font-size-sm);
        color: var(--color-text-dark);
        font-weight: var(--font-weight-medium);
    }

    .build-id {
        font-family: var(--font-mono);
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
    }

    /* Advanced Section */
    .advanced-section {
        background: rgba(var(--color-error-rgb), 0.02);
        border: var(--border-thin) solid rgba(var(--color-error-rgb), 0.1);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
    }

    .advanced-title {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-dark);
        margin: 0 0 var(--space-6) 0;
    }

    .advanced-title svg {
        font-size: var(--font-size-lg);
        color: var(--color-secondary);
    }

    .advanced-options {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }

    .option-btn {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-4) var(--space-5);
        background: rgba(var(--color-surface-dark-rgb), 0.4);
        border: var(--border-thin) solid rgba(var(--color-secondary-rgb), 0.2);
        border-radius: var(--radius-lg);
        color: var(--color-text-dark);
        cursor: pointer;
        transition: var(--transition-medium);
        text-align: left;
    }

    .option-btn:hover {
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border-color: rgba(var(--color-secondary-rgb), 0.4);
        transform: translateX(4px);
    }

    .option-btn.danger {
        border-color: rgba(var(--color-error-rgb), 0.2);
    }

    .option-btn.danger:hover {
        background: rgba(var(--color-error-rgb), 0.1);
        border-color: rgba(var(--color-error-rgb), 0.4);
        color: var(--color-error);
    }

    .option-btn svg {
        font-size: var(--font-size-lg);
        color: var(--color-secondary);
        flex-shrink: 0;
    }

    .option-btn.danger svg {
        color: var(--color-error);
    }

    .option-content {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
        flex: 1;
    }

    .option-name {
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-sm);
        color: var(--color-text-dark);
    }

    .option-desc {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
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
    }

    .error-action {
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
    }

    .error-action:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-primary);
    }

    /* Modal Content */
    .duplicate-form {
        padding: var(--space-4);
    }

    .field-label {
        display: block;
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-sm);
        color: var(--color-text-dark);
        margin-bottom: var(--space-2);
    }

    .field-input {
        width: 100%;
        padding: var(--space-3) var(--space-4);
        background: rgba(var(--color-surface-dark-rgb), 0.6);
        border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
        border-radius: var(--radius-lg);
        color: var(--color-text-dark);
        font-size: var(--font-size-sm);
        transition: var(--transition-medium);
    }

    .field-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
    }

    .delete-list {
        margin: var(--space-4) 0;
        padding-left: var(--space-6);
        color: var(--color-text-muted);
    }

    .delete-list li {
        margin-bottom: var(--space-2);
    }

    /* Responsive Design */
    @media (max-width: var(--breakpoint-lg)) {
        .dashboard-grid {
            grid-template-columns: 1fr;
            gap: var(--space-8);
        }

        .preview-section {
            position: static;
        }
    }

    @media (max-width: var(--breakpoint-md)) {

        .header-content,
        .dashboard {
            padding-left: var(--space-4);
            padding-right: var(--space-4);
        }

        .header-main {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-6);
        }

        .build-identity {
            width: 100%;
        }

        .build-avatar {
            width: 48px;
            height: 48px;
            font-size: var(--font-size-2xl);
        }

        .build-name {
            font-size: var(--font-size-2xl);
        }

        .action-primary span,
        .action-secondary span {
            display: none;
        }

        .preview-stats {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: var(--breakpoint-sm)) {
        .dashboard {
            padding: var(--space-6) var(--space-4);
        }

        .metadata-grid {
            gap: var(--space-6);
        }

        .info-item {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
        }
    }
</style>