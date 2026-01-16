<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero-section" :style="heroBackgroundStyle">
      <div class="hero-overlay" :style="heroOverlayStyle"></div>
      <div class="container position-relative">
        <div class="row align-items-center justify-content-center min-vh-90">
          <div class="col-lg-8 col-md-10 text-white hero-content text-center">
            <h1 class="fw-bold mb-2 hero-title">{{ $t('home.title') }}</h1>
            <p class="mb-3 hero-subtitle">{{ $t('home.subtitle') }}</p>
            <router-link class="btn btn-light px-4 py-2 shadow-lg" to="/appointments">
              <i class="fas fa-calendar-check me-2"></i>{{ $t('home.bookNow') }}
            </router-link>
          </div>
        </div>
      </div>
      <div class="hero-shape"></div>
    </section>

    <!-- Stats Section -->
  
    <!-- Services Section -->
    <section class="services-section py-4">
      <div class="container py-3">
        <div class="text-center mb-4">
          <span class="badge bg-primary bg-opacity-10 text-primary mb-2 px-3 py-1">{{ $t('home.services') }}</span>
          <h2 class="fs-4 fw-bold mb-2">{{ $t('home.servicesSubtitle') }}</h2>
          <p class="text-muted">{{ $t('home.servicesDescription') }}</p>
        </div>
        <div class="row g-3">
          <div class="col-lg-4 col-md-6" v-for="service in services" :key="service._id">
            <div class="service-card h-100">
              <div class="service-icon">
                <i class="fas fa-cut"></i>
              </div>
              <h6 class="fw-bold mb-1">{{ service.name }}</h6>
              <p class="text-muted small mb-2">{{ service.description || 'Professional service' }}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="price">{{ formatCurrency(service.price) }}</span>
                <span class="duration"><i class="fas fa-clock me-1"></i>{{ service.duration }}min</span>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center mt-4">
          <router-link class="btn btn-primary px-4 py-2 text-white" to="/appointments">
            {{ $t('home.viewAllServices') }} <i class="fas fa-arrow-right ms-2"></i>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Gallery Section -->
    <section class="gallery-section py-4" v-if="galleryImages.length > 0">
      <div class="container py-3">
        <div class="text-center mb-4">
          <span class="badge bg-primary bg-opacity-10 text-primary mb-2 px-3 py-1">{{ $t('home.gallery') }}</span>
          <h2 class="fs-4 fw-bold mb-2">{{ $t('home.galleryTitle') }}</h2>
          <p class="text-muted">{{ $t('home.galleryDescription') }}</p>
        </div>
        <div class="row g-3">
          <div class="col-lg-4 col-md-6 col-6" v-for="(image, index) in galleryImages" :key="index">
            <div class="gallery-item">
              <img 
                :src="image" 
                :alt="`Gallery image ${index + 1}`"
                @error="handleImageError(index)"
                loading="lazy"
                class="gallery-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-4">
      <div class="container py-3">
        <div class="row g-3 justify-content-center">
          <div class="col-lg-4 col-md-6 col-4">
            <div class="feature-card text-center">
              <div class="feature-icon mb-2">
                <i class="fas fa-calendar-check"></i>
              </div>
              <p class="fw-bold mb-1">{{ $t('home.features.easyBooking') }}</p>
              <p class="text-muted small mb-0">{{ $t('home.features.easyBookingDesc') }}</p>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 col-4">
            <div class="feature-card text-center">
              <div class="feature-icon mb-2">
                <i class="fas fa-star"></i>
              </div>
              <p class="fw-bold mb-1">{{ $t('home.features.premiumQuality') }}</p>
              <p class="text-muted small mb-0">{{ $t('home.features.premiumQualityDesc') }}</p>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 col-4">
            <div class="feature-card text-center">
              <div class="feature-icon mb-2">
                <i class="fas fa-shield-alt"></i>
              </div>
              <p class="fw-bold mb-1">{{ $t('home.features.hygieneFirst') }}</p>
              <p class="text-muted small mb-0">{{ $t('home.features.hygieneFirstDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section py-4">
      <div class="container py-3">
        <div class="cta-card text-center text-white p-4">
          <h2 class="fs-4 fw-bold mb-2">{{ $t('home.cta.title') }}</h2>
          <p class="mb-3">{{ $t('home.cta.subtitle') }}</p>
          <router-link class="btn btn-light px-4 py-2 text-dark" to="/appointments">
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
      services: [],
      galleryImages: [],
      maxGalleryImages: 20 // Maximum number of images to check
    }
  },
  async mounted() {
    await Promise.all([
      this.fetchServices(),
      this.loadGalleryImages()
    ])
  },
  computed: {
    heroBackgroundStyle() {
      // Use process.env.BASE_URL or just / for public folder files
      const imgPath = '/img1.jpeg'
      return {
        backgroundImage: `linear-gradient(135deg, rgba(55, 55, 55, 0.7) 0%, rgba(45, 45, 45, 0.7) 50%, rgba(35, 35, 35, 0.7) 100%), url(${imgPath})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    },
    heroOverlayStyle() {
      const imgPath = '/img1.jpeg'
      return {
        backgroundImage: `url(${imgPath})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: '0.3'
      }
    }
  },
  methods: {
    async fetchServices() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/services/public`)
        // Show first 3 services from available services
        this.services = response.data.slice(0, 3)
      } catch (error) {
        console.error('Error fetching services:', error)
        this.services = []
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
    },
    async loadGalleryImages() {
      const images = []
      let imageIndex = 1
      let consecutiveErrors = 0
      const maxConsecutiveErrors = 3 // Stop after 3 consecutive missing images
      
      // Load images sequentially, stopping after 3 consecutive errors
      while (imageIndex <= this.maxGalleryImages && consecutiveErrors < maxConsecutiveErrors) {
        const imagePath = `/img${imageIndex}.jpeg`
        
        const imageExists = await this.checkImageExists(imagePath)
        
        if (imageExists) {
          images.push(imagePath)
          consecutiveErrors = 0 // Reset error counter on success
        } else {
          consecutiveErrors++
        }
        
        imageIndex++
      }
      
      this.galleryImages = images
    },
    checkImageExists(imagePath) {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = imagePath
        // Timeout after 2 seconds to prevent hanging
        setTimeout(() => resolve(false), 2000)
      })
    },
    handleImageError(index) {
      // Remove failed image from gallery
      this.galleryImages = this.galleryImages.filter((_, i) => i !== index)
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
  background: linear-gradient(135deg, #373737 0%, #2d2d2d 50%, #232323 100%);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(55, 55, 55, 0.7) 0%, rgba(45, 45, 45, 0.7) 50%, rgba(35, 35, 35, 0.7) 100%);
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
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
  position: relative;
  z-index: 2;
}

.container.position-relative {
  position: relative;
  z-index: 2;
}

.hero-shape {
  position: relative;
  z-index: 1;
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
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  line-height: 1.2;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: white !important;
}

.hero-subtitle {
  font-size: clamp(0.85rem, 2vw, 1rem);
  opacity: 0.9;
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

/* Gallery Section */
.gallery-section {
  background: var(--bg-tertiary);
}

.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  aspect-ratio: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-image {
  transform: scale(1.05);
}

.service-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  cursor: pointer;
  color: var(--text-primary);
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.service-icon {
  width: 44px;
  height: 44px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  color: white;
}

.service-card .price {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary);
}

.service-card .duration {
  color: var(--text-muted);
  font-size: 0.8rem;
}

/* Features Section */
.features-section {
  background: var(--bg-tertiary);
}

.feature-card {
  background: var(--bg-secondary);
  padding: 1.25rem 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  color: var(--text-primary);
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  width: 50px;
  height: 50px;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--primary);
}

/* CTA Section */
.cta-section {
  background: var(--bg-primary);
}

.cta-card {
  background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(107, 114, 128, 0.3);
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .hero-section {
    min-height: 100vh;
    padding: 1rem 0;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .btn-lg {
    padding: 0.875rem 2rem !important;
    font-size: 1rem;
    min-height: 48px;
  }
  
  .touch-friendly {
    min-height: 48px;
    padding: 0.875rem 1.5rem;
  }
  
  .service-card {
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .feature-card {
    padding: 1.5rem 1rem;
    margin-bottom: 1rem;
  }
  
  .cta-card {
    padding: 2rem 1.5rem !important;
  }
  
  .stats-section h3 {
    font-size: 1.75rem;
  }
}

/* iOS specific optimizations */
@supports (-webkit-touch-callout: none) {
  .btn {
    -webkit-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
  }
  
  .touch-friendly {
    -webkit-tap-highlight-color: rgba(0,0,0,0.1);
  }
}

/* Android specific optimizations */
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  .btn {
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }
}

/* Button Fixes */

.call-us-btn {
  color: white !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.call-us-btn:hover {
  color: #1a1a2e !important;
  background-color: white !important;
  border-color: white !important;
}

.premium-badge {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d3748 100%) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Force dark background in both light and dark themes */
:root .premium-badge,
.dark-theme .premium-badge {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%) !important;
  color: white !important;
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