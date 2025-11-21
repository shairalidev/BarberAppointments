<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero-section bg-gradient text-white py-5">
      <div class="container">
        <div class="row align-items-center min-vh-75">
          <div class="col-lg-6">
            <h1 class="display-3 fw-bold mb-4">Premium Barber Services</h1>
            <p class="lead mb-4 fs-5">Experience the finest grooming services with our expert barbers. Book your appointment online and enjoy professional care.</p>
            <div class="d-flex gap-3">
              <router-link class="btn btn-light btn-lg px-4 py-3" to="/appointments">
                <i class="fas fa-calendar-plus me-2"></i>Book Appointment
              </router-link>
              <button class="btn btn-outline-light btn-lg px-4 py-3">
                <i class="fas fa-phone me-2"></i>Call Now
              </button>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-image text-center">
              <i class="fas fa-cut display-1 text-white-50"></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold mb-3">Our Services</h2>
          <p class="text-muted">Professional grooming services tailored to your needs</p>
        </div>
        <div class="row g-4">
          <div class="col-md-4" v-for="service in services" :key="service._id">
            <div class="card h-100 text-center p-4">
              <div class="card-body">
                <i class="fas fa-cut text-primary mb-3" style="font-size: 2rem;"></i>
                <h5 class="card-title fw-bold">{{ service.name }}</h5>
                <p class="card-text text-muted">{{ service.description }}</p>
                <div class="d-flex justify-content-between align-items-center mt-3">
                  <span class="badge bg-primary fs-6">${{ service.price }}</span>
                  <small class="text-muted">{{ service.duration }} min</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4 text-center">
            <i class="fas fa-clock text-primary mb-3" style="font-size: 2.5rem;"></i>
            <h5 class="fw-bold">Easy Booking</h5>
            <p class="text-muted">Book your appointment online in just a few clicks</p>
          </div>
          <div class="col-md-4 text-center">
            <i class="fas fa-user-tie text-primary mb-3" style="font-size: 2.5rem;"></i>
            <h5 class="fw-bold">Expert Barbers</h5>
            <p class="text-muted">Professional barbers with years of experience</p>
          </div>
          <div class="col-md-4 text-center">
            <i class="fas fa-star text-primary mb-3" style="font-size: 2.5rem;"></i>
            <h5 class="fw-bold">Quality Service</h5>
            <p class="text-muted">Premium quality services at affordable prices</p>
          </div>
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
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/services`)
        this.services = response.data.slice(0, 3) // Show only first 3 services
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }
  }
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.min-vh-75 {
  min-height: 75vh;
}

.hero-image {
  opacity: 0.1;
}
</style>