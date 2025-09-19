<template>
  <ion-page>
    <ion-content>
      <div class="home-page">
        <!-- Dynamic Background -->
        <div class="bg-particles"></div>
        <div class="bg-waves"></div>

        <!-- Navigation -->
        <nav class="top-nav">
          <div class="nav-content">
            <div class="logo-brand">
              <Icon icon="mdi:cpu-64-bit" class="brand-icon" />
              <span class="brand-text">PcSpex</span>
            </div>
            <div class="nav-status">
              <div class="status-dot"></div>
              <span>System Ready</span>
            </div>
          </div>
        </nav>

        <!-- Hero Section -->
        <section class="hero">
          <div class="hero-container">
            <div class="hero-content">
              <div class="hero-badge">
                <Icon icon="mdi:rocket-launch" />
                <span>PC Configurator</span>
              </div>

              <h1 class="hero-title">
                Build Your
                <span class="gradient-text">Dream PC</span>
                Configuration
              </h1>

              <p class="hero-description">
                Potente strumento per progettare, ottimizzare e gestire configurazioni PC complete.
                Dalla selezione componenti all'analisi prestazioni.
              </p>

              <div class="hero-actions">
                <button class="cta-primary" @click="$router.push('/builds')">
                  <Icon icon="mdi:plus-circle" />
                  <span>Create New Build</span>
                  <div class="button-shine"></div>
                </button>

                <button class="cta-secondary" @click="$router.push('/components')">
                  <Icon icon="mdi:database-search" />
                  <span>Browse Components</span>
                </button>
              </div>
            </div>

            <div class="hero-visual">
              <div class="visual-card main-card">
                <div class="card-header">
                  <div class="card-indicator active"></div>
                  <span>Active Build</span>
                </div>
                <div class="card-content">
                  <div class="build-preview">
                    <Icon icon="mdi:desktop-tower" class="build-icon" />
                    <div class="build-info">
                      <h4>Gaming Rig Pro</h4>
                      <p>{{ totalComponents }} components</p>
                    </div>
                  </div>
                  <div class="build-stats">
                    <div class="stat">
                      <span class="stat-value">€{{ totalValue.toFixed(0) }}</span>
                      <span class="stat-label">Total Value</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="visual-card secondary-card">
                <div class="mini-chart">
                  <div class="chart-bars">
                    <div class="bar" style="height: 60%"></div>
                    <div class="bar" style="height: 80%"></div>
                    <div class="bar" style="height: 45%"></div>
                    <div class="bar" style="height: 90%"></div>
                    <div class="bar" style="height: 70%"></div>
                  </div>
                  <span class="chart-label">Performance</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Features Grid -->
        <section class="features">
          <div class="features-container">
            <div class="section-header">
              <span class="section-tag">Features</span>
              <h2>Everything You Need</h2>
            </div>

            <div class="features-grid">
              <div class="feature-card" @click="$router.push('/builds')">
                <div class="feature-icon">
                  <Icon icon="mdi:view-dashboard-variant" />
                </div>
                <div class="feature-content">
                  <h3>Build Manager</h3>
                  <p>Gestisci configurazioni complete con strumenti avanzati di progettazione</p>
                  <div class="feature-stat">
                    <span class="stat-number">{{ totalBuilds }}</span>
                    <span class="stat-text">Active Builds</span>
                  </div>
                </div>
                <div class="feature-arrow">
                  <Icon icon="mdi:arrow-right" />
                </div>
              </div>

              <div class="feature-card" @click="$router.push('/components')">
                <div class="feature-icon">
                  <Icon icon="mdi:memory" />
                </div>
                <div class="feature-content">
                  <h3>Components Library</h3>
                  <p>Database completo con prezzi aggiornati e specifiche dettagliate</p>
                  <div class="feature-stat">
                    <span class="stat-number">{{ totalComponents }}</span>
                    <span class="stat-text">Components</span>
                  </div>
                </div>
                <div class="feature-arrow">
                  <Icon icon="mdi:arrow-right" />
                </div>
              </div>

              <div class="feature-card disabled">
                <div class="feature-icon">
                  <Icon icon="mdi:chart-line" />
                </div>
                <div class="feature-content">
                  <h3>Performance Analytics</h3>
                  <p>Analisi dettagliate delle prestazioni e compatibilità componenti</p>
                  <div class="feature-badge">Coming Soon</div>
                </div>
              </div>

              <!-- <div class="feature-card disabled">
                <div class="feature-icon">
                  <Icon icon="mdi:share-variant" />
                </div>
                <div class="feature-content">
                  <h3>Share & Export</h3>
                  <p>Condividi le tue configurazioni e esporta in diversi formati</p>
                  <div class="feature-badge">Coming Soon</div>
                </div>
              </div> -->
            </div>
          </div>
        </section>

        <!-- Quick Stats -->
        <section v-if="totalBuilds || totalComponents" class="stats">
          <div class="stats-container">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <Icon icon="mdi:desktop-tower-monitor" />
                </div>
                <div class="stat-data">
                  <span class="stat-value">{{ totalBuilds }}</span>
                  <span class="stat-label">PC Builds</span>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <Icon icon="mdi:chip" />
                </div>
                <div class="stat-data">
                  <span class="stat-value">{{ totalComponents }}</span>
                  <span class="stat-label">Components</span>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <Icon icon="mdi:currency-eur" />
                </div>
                <div class="stat-data">
                  <span class="stat-value">{{ totalValue.toFixed(0) }}€</span>
                  <span class="stat-label">Total Value</span>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <Icon icon="mdi:speedometer" />
                </div>
                <div class="stat-data">
                  <span class="stat-value">{{ totalBuilds > 0 ? (totalComponents / totalBuilds).toFixed(1) : '0'
                  }}</span>
                  <span class="stat-label">Avg per Build</span>
                </div>
              </div>
            </div>
          </div>
        </section>
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
    background: linear-gradient(135deg, var(--color-bg-dark) 0%, var(--color-bg-alt-dark) 100%);
    color: var(--color-text-dark);
    position: relative;
    overflow-x: hidden;
  }

  /* Animated Background */
  .bg-particles {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(circle at 20% 20%, rgba(var(--color-primary-rgb), 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 60%, rgba(var(--color-accent-rgb), 0.08) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(var(--color-success-rgb), 0.06) 0%, transparent 50%);
    animation: particleFloat 20s ease-in-out infinite;
    z-index: var(--z-base);
  }

  .bg-waves {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background: linear-gradient(45deg,
        rgba(var(--color-primary-rgb), 0.1) 0%,
        rgba(var(--color-accent-rgb), 0.05) 50%,
        transparent 100%);
    clip-path: polygon(0 50%, 100% 80%, 100% 100%, 0% 100%);
    z-index: var(--z-base);
  }

  @keyframes particleFloat {

    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }

    33% {
      transform: translateY(-20px) rotate(2deg);
    }

    66% {
      transform: translateY(-10px) rotate(-1deg);
    }
  }

  /* Navigation */
  .top-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    backdrop-filter: blur(var(--blur-lg));
    background: rgba(var(--color-bg-dark-rgb), 0.8);
    border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
    z-index: var(--z-sticky);
  }

  .nav-content {
    max-width: var(--container-xl);
    margin: 0 auto;
    padding: var(--space-4) var(--space-8);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo-brand {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .brand-icon {
    font-size: var(--font-size-2xl);
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .brand-text {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    background: linear-gradient(135deg, var(--color-white), var(--color-secondary-400));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .nav-status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: rgba(var(--color-success-rgb), 0.1);
    border: var(--border-thin) solid rgba(var(--color-success-rgb), 0.2);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    color: var(--color-success);
  }

  .status-dot {
    width: var(--space-2);
    height: var(--space-2);
    background: var(--color-success);
    border-radius: var(--radius-round);
    animation: statusPulse 2s ease-in-out infinite;
  }

  @keyframes statusPulse {

    0%,
    100% {
      opacity: var(--opacity-100);
      transform: scale(1);
    }

    50% {
      opacity: var(--opacity-60);
      transform: scale(1.2);
    }
  }

  /* Hero Section */
  .hero {
    padding: var(--space-32) var(--space-8) var(--space-16);
    position: relative;
    z-index: calc(var(--z-base) + 1);
  }

  .hero-container {
    max-width: var(--container-xl);
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-16);
    align-items: center;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: rgba(var(--color-primary-rgb), 0.1);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    color: var(--color-primary);
    margin-bottom: var(--space-8);
  }

  .hero-title {
    font-size: var(--font-size-6xl);
    font-weight: var(--font-weight-black);
    line-height: var(--line-height-tight);
    margin-bottom: var(--space-6);
    color: var(--color-white);
  }

  .gradient-text {
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent), var(--color-info));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% 200%;
    animation: gradientShift var(--transition-slow) ease-in-out infinite;
  }

  @keyframes gradientShift {

    0%,
    100% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }
  }

  .hero-description {
    font-size: var(--font-size-lg);
    line-height: var(--line-height-relaxed);
    color: var(--color-secondary-400);
    margin-bottom: var(--space-10);
    max-width: 500px;
  }

  .hero-actions {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .cta-primary,
  .cta-secondary {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-8);
    border-radius: var(--radius-lg);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
    cursor: pointer;
    transition: var(--transition-all);
    border: none;
    position: relative;
    overflow: hidden;
  }

  .cta-primary {
    background: var(--gradient-primary);
    color: var(--color-white);
    box-shadow: var(--shadow-primary);
  }

  .cta-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
  }

  .button-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(var(--color-white-rgb), 0.2), transparent);
    transition: left var(--transition-medium) ease;
  }

  .cta-primary:hover .button-shine {
    left: 100%;
  }

  .cta-secondary {
    background: rgba(var(--color-white-rgb), 0.05);
    color: var(--color-white);
    border: var(--border-thin) solid rgba(var(--color-white-rgb), 0.1);
    backdrop-filter: blur(var(--blur-sm));
  }

  .cta-secondary:hover {
    background: rgba(var(--color-white-rgb), 0.1);
    border-color: rgba(var(--color-white-rgb), 0.2);
    transform: translateY(-1px);
  }

  /* Hero Visual */
  .hero-visual {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    position: relative;
  }

  .visual-card {
    background: rgba(var(--color-white-rgb), 0.05);
    backdrop-filter: blur(var(--blur-lg));
    border: var(--border-thin) solid rgba(var(--color-white-rgb), 0.1);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    position: relative;
    overflow: hidden;
  }

  .visual-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(var(--color-primary-rgb), 0.5), transparent);
  }

  .main-card {
    animation: cardFloat 6s ease-in-out infinite;
  }

  .secondary-card {
    align-self: flex-end;
    width: 200px;
    animation: cardFloat 6s ease-in-out infinite reverse;
  }

  @keyframes cardFloat {

    0%,
    100% {
      transform: translateY(0px);
    }

    50% {
      transform: translateY(-10px);
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
    font-size: var(--font-size-sm);
    color: var(--color-secondary-400);
  }

  .card-indicator {
    width: var(--space-2);
    height: var(--space-2);
    border-radius: var(--radius-round);
    background: var(--color-success);
  }

  .card-indicator.active {
    animation: statusPulse 2s ease-in-out infinite;
  }

  .build-preview {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .build-icon {
    font-size: var(--font-size-4xl);
    color: var(--color-primary);
  }

  .build-info h4 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-white);
    margin: 0 0 var(--space-1) 0;
  }

  .build-info p {
    font-size: var(--font-size-sm);
    color: var(--color-secondary-400);
    margin: 0;
  }

  .build-stats .stat {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-success);
  }

  .stat-label {
    font-size: var(--font-size-xs);
    color: var(--color-secondary-400);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
  }

  .mini-chart {
    text-align: center;
  }

  .chart-bars {
    display: flex;
    justify-content: center;
    align-items: end;
    gap: var(--space-1);
    height: 40px;
    margin-bottom: var(--space-2);
  }

  .bar {
    width: var(--space-2);
    background: linear-gradient(to top, var(--color-primary), var(--color-info));
    border-radius: var(--radius-lg);
    animation: barGrow 2s ease-in-out infinite alternate;
  }

  .bar:nth-child(2) {
    animation-delay: 0.2s;
  }

  .bar:nth-child(3) {
    animation-delay: 0.4s;
  }

  .bar:nth-child(4) {
    animation-delay: 0.6s;
  }

  .bar:nth-child(5) {
    animation-delay: 0.8s;
  }

  @keyframes barGrow {
    0% {
      transform: scaleY(0.7);
    }

    100% {
      transform: scaleY(1);
    }
  }

  .chart-label {
    font-size: var(--font-size-xs);
    color: var(--color-secondary-400);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
  }

  /* Features Section */
  .features {
    padding: var(--space-16) var(--space-8);
    position: relative;
    z-index: calc(var(--z-base) + 1);
  }

  .features-container {
    max-width: var(--container-xl);
    margin: 0 auto;
  }

  .section-header {
    text-align: center;
    margin-bottom: var(--space-12);
  }

  .section-tag {
    display: inline-block;
    padding: var(--space-2) var(--space-4);
    background: rgba(var(--color-accent-rgb), 0.1);
    border: var(--border-thin) solid rgba(var(--color-accent-rgb), 0.2);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    color: var(--color-accent);
    margin-bottom: var(--space-4);
  }

  .section-header h2 {
    font-size: var(--font-size-5xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-white);
    margin: 0;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-6);
  }

  .feature-card {
    background: rgba(var(--color-white-rgb), 0.02);
    backdrop-filter: blur(var(--blur-sm));
    border: var(--border-thin) solid rgba(var(--color-white-rgb), 0.05);
    border-radius: var(--radius-xl);
    padding: var(--space-8);
    cursor: pointer;
    transition: var(--transition-all);
    position: relative;
    overflow: hidden;
  }

  .feature-card:not(.disabled):hover {
    background: rgba(var(--color-white-rgb), 0.05);
    border-color: rgba(var(--color-primary-rgb), 0.3);
    transform: translateY(-5px);
    box-shadow: var(--shadow-xl);
  }

  .feature-card.disabled {
    opacity: var(--opacity-60);
    cursor: not-allowed;
  }

  .feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(var(--color-white-rgb), 0.1), transparent);
    opacity: 0;
    transition: var(--transition-opacity);
  }

  .feature-card:hover::before {
    opacity: var(--opacity-100);
  }

  .feature-icon {
    width: 60px;
    height: 60px;
    background: rgba(var(--color-primary-rgb), 0.1);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xl);
    color: var(--color-primary);
    margin-bottom: var(--space-6);
  }

  .feature-content h3 {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-white);
    margin: 0 0 var(--space-3) 0;
  }

  .feature-content p {
    font-size: var(--font-size-md);
    line-height: var(--line-height-relaxed);
    color: var(--color-secondary-400);
    margin: 0 0 var(--space-6) 0;
  }

  .feature-stat {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
  }

  .stat-number {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-success);
  }

  .stat-text {
    font-size: var(--font-size-sm);
    color: var(--color-secondary-400);
  }

  .feature-badge {
    display: inline-block;
    padding: var(--space-1) var(--space-3);
    background: rgba(var(--color-warning-rgb), 0.1);
    border: var(--border-thin) solid rgba(var(--color-warning-rgb), 0.2);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-xs);
    color: var(--color-warning);
    font-weight: var(--font-weight-medium);
  }

  .feature-arrow {
    position: absolute;
    top: var(--space-8);
    right: var(--space-8);
    font-size: var(--font-size-xl);
    color: var(--color-secondary-600);
    transition: var(--transition-all);
  }

  .feature-card:hover .feature-arrow {
    color: var(--color-primary);
    transform: translateX(3px);
  }

  /* Stats Section */
  .stats {
    padding: var(--space-8);
    position: relative;
    z-index: calc(var(--z-base) + 1);
  }

  .stats-container {
    max-width: var(--container-xl);
    margin: 0 auto;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-6);
  }

  .stat-card {
    background: rgba(var(--color-white-rgb), 0.02);
    backdrop-filter: blur(var(--blur-sm));
    border: var(--border-thin) solid rgba(var(--color-white-rgb), 0.05);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    display: flex;
    align-items: center;
    gap: var(--space-4);
    transition: var(--transition-all);
  }

  .stat-card:hover {
    background: rgba(var(--color-white-rgb), 0.05);
    transform: translateY(-2px);
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    background: rgba(var(--color-primary-rgb), 0.1);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xl);
    color: var(--color-primary);
  }

  .stat-data {
    display: flex;
    flex-direction: column;
  }

  .stat-data .stat-value {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-white);
    line-height: var(--line-height-tight);
  }

  .stat-data .stat-label {
    font-size: var(--font-size-sm);
    color: var(--color-secondary-400);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .hero-container {
      grid-template-columns: 1fr;
      gap: var(--space-12);
      text-align: center;
    }

    .hero-title {
      font-size: var(--font-size-5xl);
    }

    .nav-content {
      padding: var(--space-4);
    }

    .brand-text {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .hero {
      padding: var(--space-24) var(--space-4) var(--space-12);
    }

    .hero-title {
      font-size: var(--font-size-4xl);
    }

    .features,
    .stats {
      padding: var(--space-12) var(--space-4);
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .hero-actions {
      flex-direction: column;
      align-items: center;
    }

    .cta-primary,
    .cta-secondary {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 640px) {
    .hero-title {
      font-size: var(--font-size-3xl);
    }

    .section-header h2 {
      font-size: var(--font-size-3xl);
    }

    .nav-status {
      display: none;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>