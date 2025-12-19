<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="container position-relative">
        <div class="row align-items-center min-vh-90">
          <div class="col-lg-7 col-md-8 text-white hero-content">
            <div class="badge bg-white bg-opacity-25 text-white mb-3 px-3 py-2">💈 Premium Grooming</div>
            <h1 class="display-2 fw-bold mb-3 hero-title">{{ $t('home.title') }}</h1>
            <p class="lead mb-3 fs-5 hero-subtitle">{{ $t('home.subtitle') }}</p>
            <div class="d-flex align-items-center mb-4 text-white-75">
              <i class="fas fa-map-marker-alt me-2"></i>
              <span>Bahnhofstraße 3, 6410 Telfs</span>
            </div>
            <div class="d-flex flex-column flex-sm-row gap-3">
              <router-link class="btn btn-light btn-lg px-5 py-3 shadow-lg" to="/appointments">
                <i class="fas fa-calendar-check me-2"></i>{{ $t('home.bookNow') }}
              </router-link>
              <a href="tel:+1234567890" class="btn btn-outline-light btn-lg px-5 py-3">
                <i class="fas fa-phone me-2"></i>{{ $t('home.callUs') }}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-shape"></div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section py-4 bg-dark text-white">
      <div class="container">
        <div class="row text-center g-4">
          <div class="col-6 col-md-3">
            <h3 class="fw-bold mb-1">500+</h3>
            <small class="text-white-50">Happy Clients</small>
          </div>
          <div class="col-6 col-md-3">
            <h3 class="fw-bold mb-1">15+</h3>
            <small class="text-white-50">Years Experience</small>
          </div>
          <div class="col-6 col-md-3">
            <h3 class="fw-bold mb-1">5</h3>
            <small class="text-white-50">Expert Barbers</small>
          </div>
          <div class="col-6 col-md-3">
            <h3 class="fw-bold mb-1">4.9★</h3>
            <small class="text-white-50">Customer Rating</small>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="services-section py-5">
      <div class="container py-4">
        <div class="text-center mb-5">
          <span class="badge bg-primary bg-opacity-10 text-primary mb-3 px-3 py-2">{{ $t('home.services') }}</span>
          <h2 class="display-5 fw-bold mb-3">{{ $t('home.servicesSubtitle') }}</h2>
          <p class="text-muted fs-6">{{ $t('home.servicesDescription') }}</p>
        </div>
        <div class="row g-4">
          <div class="col-lg-4 col-md-6" v-for="service in services" :key="service._id">
            <div class="service-card h-100">
              <div class="service-icon">
                <i class="fas fa-cut"></i>
              </div>
              <h5 class="fw-bold mb-2">{{ service.name }}</h5>
              <p class="text-muted small mb-3">{{ service.description || 'Professional service with attention to detail' }}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="price">${{ service.price }}</span>
                <span class="duration"><i class="fas fa-clock me-1"></i>{{ service.duration }}min</span>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center mt-5">
          <router-link class="btn btn-primary btn-lg px-5 text-white" to="/appointments">
            {{ $t('home.viewAllServices') }} <i class="fas fa-arrow-right ms-2"></i>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-5">
      <div class="container py-4">
        <div class="row g-4">
          <div class="col-lg-3 col-md-6">
            <div class="feature-card text-center">
              <div class="feature-icon mb-3">
                <i class="fas fa-calendar-check"></i>
              </div>
              <h6 class="fw-bold mb-2">{{ $t('home.features.easyBooking') }}</h6>
              <p class="text-muted small mb-0">{{ $t('home.features.easyBookingDesc') }}</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="feature-card text-center">
              <div class="feature-icon mb-3">
                <i class="fas fa-user-tie"></i>
              </div>
              <h6 class="fw-bold mb-2">{{ $t('home.features.expertBarbers') }}</h6>
              <p class="text-muted small mb-0">{{ $t('home.features.expertBarbersDesc') }}</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="feature-card text-center">
              <div class="feature-icon mb-3">
                <i class="fas fa-star"></i>
              </div>
              <h6 class="fw-bold mb-2">{{ $t('home.features.premiumQuality') }}</h6>
              <p class="text-muted small mb-0">{{ $t('home.features.premiumQualityDesc') }}</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="feature-card text-center">
              <div class="feature-icon mb-3">
                <i class="fas fa-shield-alt"></i>
              </div>
              <h6 class="fw-bold mb-2">{{ $t('home.features.hygieneFirst') }}</h6>
              <p class="text-muted small mb-0">{{ $t('home.features.hygieneFirstDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section py-5">
      <div class="container py-4">
        <div class="cta-card text-center text-white p-5">
          <h2 class="display-6 fw-bold mb-3">{{ $t('home.cta.title') }}</h2>
          <p class="lead mb-4">{{ $t('home.cta.subtitle') }}</p>
          <router-link class="btn btn-light btn-lg px-5 py-3 text-dark" to="/appointments">
            <i class="fas fa-calendar-plus me-2"></i>{{ $t('home.cta.button') }}
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Home',
  data() {
    return {
      services: []
    }
  },
  async mounted() {
    await this.fetchServices()
  },
  methods: {
    async fetchServices() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/services/public`)
        this.services = response.data.slice(0, 3) // Show only first 3 services
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }
  }
}
</script>

<style scoped>
.home {
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
}

.hero-shape {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 100px;
  background: var(--bg-primary);
  clip-path: polygon(0 50%, 100% 0, 100% 100%, 0 100%);
}

.min-vh-90 {
  min-height: 90vh;
  display: flex;
  align-items: center;
}

.hero-content {
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  line-height: 1.1;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: white !important;
}

.hero-subtitle {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  opacity: 0.95;
  color: white !important;
}

/* Stats Section */
.stats-section {
  background: #0a0a0a;
}

.stats-section h3 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}

/* Services Section */
.services-section {
  background: var(--bg-primary);
}

.service-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
  cursor: pointer;
  color: var(--text-primary);
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.service-icon {
  width: 60px;
  height: 60px;
  background: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: white;
}

.service-card .price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.service-card .duration {
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Features Section */
.features-section {
  background: var(--bg-tertiary);
}

.feature-card {
  background: var(--bg-secondary);
  padding: 2rem 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  color: var(--text-primary);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  width: 70px;
  height: 70px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: var(--primary);
}

/* CTA Section */
.cta-section {
  background: var(--bg-primary);
}

.cta-card {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3);
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .hero-section {
    min-height: 100vh;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .btn-lg {
    padding: 0.75rem 2rem !important;
    font-size: 1rem;
  }
  
  .service-card {
    padding: 1.5rem;
  }
  
  .feature-card {
    padding: 1.5rem 1rem;
  }
  
  .cta-card {
    padding: 2rem 1.5rem !important;
  }
  
  .stats-section h3 {
    font-size: 1.75rem;
  }
}

@media (max-width: 576px) {
  .hero-shape {
    height: 50px;
  }
  
  .display-5 {
    font-size: 2rem;
  }
  
  .display-6 {
    font-size: 1.75rem;
  }
}
</style>