<template>
  <ion-page>
    <ion-content>
      <div class="home-page">
        <!-- Animated Background -->
        <div class="bg-grid"></div>
        <div class="bg-overlay"></div>

        <!-- Main Content -->
        <div class="home-container">
          <!-- Hero Section -->
          <section class="hero-section">
            <div class="hero-content">
              <div class="logo-container">
                <Icon icon="mdi:memory" class="logo-icon" />
                <div class="logo-glow"></div>
              </div>
              <h1 class="hero-title">
                <span class="title-primary">PC</span>
                <span class="title-accent">Spex</span>
              </h1>
              <p class="hero-subtitle">
                Sistema avanzato per la creazione e gestione di configurazioni PC personalizzate
              </p>
              <div class="hero-stats">
                <div class="stat-pill">
                  <Icon icon="mdi:lightning-bolt" />
                  <span>Performance Driven</span>
                </div>
                <div class="stat-pill">
                  <Icon icon="mdi:shield-check" />
                  <span>Secure & Reliable</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Quick Actions -->
          <section class="actions-section">
            <div class="section-header">
              <h2>Control Panel</h2>
              <div class="header-line"></div>
            </div>

            <div class="actions-grid">
              <div class="action-card" @click="$router.push('/builds')">
                <div class="card-glow"></div>
                <div class="card-content">
                  <div class="card-icon-wrapper">
                    <Icon icon="mdi:desktop-tower-monitor" class="card-icon" />
                    <div class="icon-pulse"></div>
                  </div>
                  <div class="card-info">
                    <h3>PC Builds</h3>
                    <p>Manage your complete system configurations</p>
                    <div class="card-stats">
                      <span class="stat-number">{{ totalBuilds }}</span>
                      <span class="stat-label">Configurations</span>
                    </div>
                  </div>
                  <Icon icon="mdi:chevron-right" class="card-arrow" />
                </div>
              </div>

              <div class="action-card" @click="$router.push('/components')">
                <div class="card-glow"></div>
                <div class="card-content">
                  <div class="card-icon-wrapper">
                    <Icon icon="mdi:chip" class="card-icon" />
                    <div class="icon-pulse"></div>
                  </div>
                  <div class="card-info">
                    <h3>Components</h3>
                    <p>Complete database of PC components</p>
                    <div class="card-stats">
                      <span class="stat-number">{{ totalComponents }}</span>
                      <span class="stat-label">Components</span>
                    </div>
                  </div>
                  <Icon icon="mdi:chevron-right" class="card-arrow" />
                </div>
              </div>
            </div>
          </section>

          <!-- Analytics Section -->
          <section v-if="totalBuilds || totalComponents" class="analytics-section">
            <div class="section-header">
              <h2>Performance Analytics</h2>
              <div class="header-line"></div>
            </div>

            <div class="analytics-grid">
              <div class="analytics-card">
                <div class="analytics-header">
                  <Icon icon="mdi:chart-line" class="analytics-icon" />
                  <span>Performance Overview</span>
                </div>
                <div class="analytics-content">
                  <div class="metric">
                    <div class="metric-value">{{ totalBuilds }}</div>
                    <div class="metric-label">Total Builds</div>
                    <div class="metric-bar">
                      <div class="metric-fill" :style="{ width: totalBuilds > 0 ? '100%' : '0%' }"></div>
                    </div>
                  </div>
                  <div class="metric">
                    <div class="metric-value">{{ totalComponents }}</div>
                    <div class="metric-label">Components Library</div>
                    <div class="metric-bar">
                      <div class="metric-fill" :style="{ width: totalComponents > 0 ? '100%' : '0%' }"></div>
                    </div>
                  </div>
                  <div class="metric">
                    <div class="metric-value">€{{ totalValue.toFixed(0) }}</div>
                    <div class="metric-label">Total Value</div>
                    <div class="metric-bar">
                      <div class="metric-fill accent" :style="{ width: totalValue > 0 ? '100%' : '0%' }"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="quick-stats">
                <div class="quick-stat">
                  <Icon icon="mdi:speedometer" class="quick-stat-icon" />
                  <div class="quick-stat-info">
                    <span class="quick-stat-value">{{ totalBuilds + totalComponents }}</span>
                    <span class="quick-stat-label">Total Items</span>
                  </div>
                </div>
                <div class="quick-stat">
                  <Icon icon="mdi:database" class="quick-stat-icon" />
                  <div class="quick-stat-info">
                    <span class="quick-stat-value">{{ totalBuilds > 0 ? (totalComponents /
                      totalBuilds).toFixed(1) : '0' }}</span>
                    <span class="quick-stat-label">Avg Components</span>
                  </div>
                </div>
                <div class="quick-stat">
                  <Icon icon="mdi:trending-up" class="quick-stat-icon" />
                  <div class="quick-stat-info">
                    <span class="quick-stat-value">{{ totalBuilds > 0 ? (totalValue /
                      totalBuilds).toFixed(0) : '0' }}€</span>
                    <span class="quick-stat-label">Avg Value</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { IonPage, IonContent } from '@ionic/vue';
  import { useBuildsStore } from '@/stores/useBuildsStore';
  import { useComponentsStore } from '@/stores/useComponentsStore';

  const buildsStore = useBuildsStore();
  const componentsStore = useComponentsStore();

  const totalBuilds = computed(() => buildsStore.totalBuilds);
  const totalComponents = computed(() => componentsStore.totalComponents);
  const totalValue = computed(() =>
    componentsStore.components.reduce((sum, component) => sum + component.price, 0)
  );
</script>

<style scoped>
  .home-page {
    min-height: 100vh;
    background: var(--color-bg-dark);
    color: var(--color-text-dark);
    position: relative;
    overflow: hidden;
  }

  /* Premium Background Effects */
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
    z-index: var(--z-base);
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
    background:
      radial-gradient(circle at 20% 20%, rgba(var(--color-primary-rgb), 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(var(--color-accent-rgb), 0.1) 0%, transparent 50%);
    z-index: calc(var(--z-base) + 1);
  }

  .home-container {
    position: relative;
    z-index: calc(var(--z-base) + 2);
    max-width: var(--container-xl);
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
  }

  /* Hero Section */
  .hero-section {
    text-align: center;
    padding: var(--space-20) 0 var(--space-16);
  }

  .hero-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .logo-container {
    position: relative;
    display: inline-block;
    margin-bottom: var(--space-8);
  }

  .logo-icon {
    font-size: var(--font-size-6xl);
    color: var(--color-primary);
    position: relative;
    z-index: calc(var(--z-base) + 1);
  }

  .logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(var(--color-primary-rgb), 0.3) 0%, transparent 70%);
    border-radius: var(--radius-full);
    animation: logoGlow 2s ease-in-out infinite;
  }

  @keyframes logoGlow {

    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: var(--opacity-70);
    }

    50% {
      transform: translate(-50%, -50%) scale(1.1);
      opacity: var(--opacity-40);
    }
  }

  .hero-title {
    font-size: var(--font-size-6xl);
    font-weight: var(--font-weight-black);
    margin-bottom: var(--space-6);
    line-height: var(--line-height-tight);
  }

  .title-primary {
    color: var(--color-primary);
  }

  .title-accent {
    background: linear-gradient(135deg, var(--color-accent), var(--color-primary-light));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-muted);
    margin-bottom: var(--space-10);
    line-height: var(--line-height-relaxed);
  }

  .hero-stats {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .stat-pill {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6);
    background: rgba(var(--color-primary-rgb), 0.1);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-primary-light);
    backdrop-filter: blur(var(--blur-sm));
  }

  /* Actions Section */
  .actions-section,
  .analytics-section {
    margin: var(--space-16) 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-8);
  }

  .section-header h2 {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-dark);
    margin: 0;
  }

  .header-line {
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary), transparent);
    border-radius: var(--radius-full);
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--space-6);
  }

  .action-card {
    position: relative;
    background: rgba(var(--color-surface-dark-rgb), 0.8);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
    border-radius: var(--radius-2xl);
    padding: var(--space-6);
    cursor: pointer;
    transition: var(--transition-all);
    backdrop-filter: blur(var(--blur-lg));
    overflow: hidden;
  }

  .action-card:hover {
    transform: translateY(-8px);
    border-color: rgba(var(--color-primary-rgb), 0.4);
    box-shadow: 0 20px 40px rgba(var(--color-primary-rgb), 0.2);
  }

  .action-card:hover .card-glow {
    opacity: var(--opacity-100);
  }

  .action-card:hover .icon-pulse {
    animation: iconPulse 1s ease-in-out infinite;
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
    opacity: 0;
    transition: var(--transition-opacity);
  }

  .card-content {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    position: relative;
  }

  .card-icon-wrapper {
    position: relative;
    padding: var(--space-4);
    background: rgba(var(--color-primary-rgb), 0.1);
    border-radius: var(--radius-lg);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
  }

  .card-icon {
    font-size: var(--font-size-4xl);
    color: var(--color-primary);
    display: block;
  }

  .icon-pulse {
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, var(--color-primary), var(--color-accent));
    border-radius: var(--radius-lg);
    opacity: 0;
    z-index: var(--z-hide);
  }

  @keyframes iconPulse {

    0%,
    100% {
      opacity: 0;
      transform: scale(1);
    }

    50% {
      opacity: var(--opacity-30);
      transform: scale(1.05);
    }
  }

  .card-info {
    flex: 1;
  }

  .card-info h3 {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-dark);
    margin: 0 0 var(--space-1) 0;
  }

  .card-info p {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    margin: 0 0 var(--space-3) 0;
  }

  .card-stats {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
  }

  .stat-number {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-accent);
  }

  .stat-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
  }

  .card-arrow {
    font-size: var(--font-size-2xl);
    color: var(--color-text-muted);
    transition: var(--transition-all);
  }

  .action-card:hover .card-arrow {
    color: var(--color-primary);
    transform: translateX(4px);
  }

  /* Analytics Section */
  .analytics-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-6);
  }

  .analytics-card {
    background: rgba(var(--color-surface-dark-rgb), 0.8);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
    border-radius: var(--radius-2xl);
    padding: var(--space-6);
    backdrop-filter: blur(var(--blur-lg));
  }

  .analytics-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-dark);
  }

  .analytics-icon {
    font-size: var(--font-size-xl);
    color: var(--color-primary);
  }

  .analytics-content {
    display: grid;
    gap: var(--space-4);
  }

  .metric {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: var(--space-2) var(--space-4);
    align-items: center;
  }

  .metric-value {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-dark);
  }

  .metric-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  .metric-bar {
    grid-column: 1 / -1;
    height: 4px;
    background: rgba(var(--color-primary-rgb), 0.1);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .metric-fill {
    height: 100%;
    background: var(--color-primary);
    border-radius: var(--radius-full);
    transition: width var(--transition-slow);
  }

  .metric-fill.accent {
    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  }

  .quick-stats {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 200px;
  }

  .quick-stat {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: rgba(var(--color-surface-dark-rgb), 0.6);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
    border-radius: var(--radius-lg);
    backdrop-filter: blur(var(--blur-sm));
  }

  .quick-stat-icon {
    font-size: var(--font-size-2xl);
    color: var(--color-accent);
  }

  .quick-stat-info {
    display: flex;
    flex-direction: column;
  }

  .quick-stat-value {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-dark);
    line-height: var(--line-height-none);
  }

  .quick-stat-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .home-container {
      padding: var(--space-6) var(--space-4);
    }

    .hero-title {
      font-size: var(--font-size-5xl);
    }

    .actions-grid {
      grid-template-columns: 1fr;
    }

    .analytics-grid {
      grid-template-columns: 1fr;
    }

    .quick-stats {
      flex-direction: row;
      overflow-x: auto;
      min-width: auto;
    }

    .quick-stat {
      min-width: 160px;
    }

    .hero-stats {
      flex-direction: column;
      align-items: center;
    }
  }

  @media (max-width: 640px) {
    .hero-title {
      font-size: var(--font-size-4xl);
    }

    .card-content {
      flex-direction: column;
      text-align: center;
    }

    .card-arrow {
      display: none;
    }

    .logo-icon {
      font-size: var(--font-size-5xl);
    }

    .section-header h2 {
      font-size: var(--font-size-2xl);
    }
  }
</style>