<template>
  <div class="booking-page">
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4 booking-header">
        <div>
          <p class="text-primary fw-semibold mb-1">{{ $t('booking.step') }} {{ currentStep }} {{ $t('booking.of') }} 3</p>
          <h2 class="fw-bold mb-0">{{ $t('booking.title') }}</h2>
          <p class="text-muted mb-2">{{ $t('booking.subtitle') }}</p>
          <div class="d-flex align-items-center text-muted small">
            <i class="fas fa-map-marker-alt me-2"></i>
            <span>Bahnhofstraße 3, 6410 Telfs</span>
          </div>
        </div>
        <div class="d-none d-md-flex align-items-center gap-3">
          <div v-for="step in steps" :key="step.number" class="step-indicator" :class="{ active: currentStep === step.number, completed: currentStep > step.number }">
            <span class="badge rounded-circle me-2" :class="currentStep >= step.number ? 'bg-primary' : 'bg-light text-muted'">{{ step.number }}</span>
            <div class="d-flex flex-column">
              <small class="text-muted">{{ $t(`booking.stepSubtitle${step.number}`) }}</small>
              <strong>{{ $t(`booking.step${step.number}`) }}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <!-- Step 1: Services -->
          <div v-if="currentStep === 1" class="card border-0 shadow-sm mb-4">
            <div class="card-header py-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="mb-0">{{ $t('booking.step1') }}</h5>
                  <small class="text-muted">{{ $t('booking.chooseServices') }}</small>
                </div>

              </div>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6" v-for="service in services" :key="service._id">
                  <label class="service-card w-100" :class="{ selected: selectedServices.includes(service._id) }">
                    <div class="d-flex align-items-start">
                      <input type="checkbox" class="form-check-input me-3" :value="service._id" v-model="selectedServices" @change="handleAvailabilityRefresh">
                      <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start mb-1">
                          <div>
                            <h6 class="mb-1">{{ service.name }}</h6>
                            <small class="text-muted">{{ service.description || 'Professional service' }}</small>
                          </div>
                          <span class="text-primary fw-semibold">{{ formatCurrency(service.price) }}</span>
                        </div>
                        <div class="d-flex justify-content-between text-muted small">
                          <span><i class="fas fa-clock me-1"></i>{{ service.duration }} min</span>
                          <span class="badge bg-light text-primary">{{ $t('common.add') }}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <small class="text-muted">{{ $t('booking.youCanChooseMultiple') }}</small>
                <button class="btn btn-primary touch-friendly" :disabled="!canProceedFromServices" @click="goToStep(2)">
                  {{ $t('booking.chooseTime') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Date and Time -->
          <div v-if="currentStep === 2" class="card border-0 shadow-sm mb-4">
            <div class="card-header py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-0">{{ $t('booking.pickDateTime') }}</h5>
                <small class="text-muted">{{ $t('booking.pickDateTimeDesc') }}</small>
              </div>
              <button class="btn btn-link text-decoration-none" @click="goToStep(1)">
                <i class="fas fa-arrow-left me-1"></i> {{ $t('booking.services') }}
              </button>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                  <p class="text-muted mb-1">{{ $t('booking.step') }} 2 {{ $t('booking.of') }} 3</p>
                  <h5 class="mb-0">{{ $t('booking.pickDateTime') }}</h5>
                  <small class="text-muted">{{ $t('booking.pickDateTimeDesc') }}</small>
                </div>
                <div class="d-flex flex-column">
                  <label class="text-muted small mb-1">{{ $t('booking.barber') }}</label>
                  <select v-model="selectedBarber" @change="handleAvailabilityRefresh" class="form-select">
                    <option value="">{{ $t('booking.selectBarber') }}</option>
                    <option v-for="barber in barbers" :key="barber._id" :value="barber._id">
                      {{ barber.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="calendar-wrapper mb-4">
                <div class="text-center mb-3">
                  <h5 class="mb-0">{{ $t('booking.availableDates') }}</h5>
                  <p class="text-muted small mb-1">{{ $t('booking.selectFromNext14Days') }}</p>
                </div>

                <div class="week-grid">
                  <button
                    v-for="day in weekDays"
                    :key="day.value"
                    class="day-card"
                    :class="{ active: day.isSelected, today: day.isToday }"
                    @click="selectDate(day.value)">
                    <span class="weekday">{{ day.label }}</span>
                    <span class="day-number">{{ day.number }}</span>
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                  <div>
                    <p class="mb-0 fw-semibold">{{ $t('booking.availableTimes') }}</p>
                    <small v-if="selectedDate" class="text-muted">{{ $t('booking.whatTimeWorks') }} {{ formatDate(selectedDate) }}?</small>
                  </div>
                  <small class="text-muted">{{ $t('booking.timesInLocalTimezone') }}</small>
                </div>
                <div class="slot-grid">
                  <button
                    v-for="slot in availableTimes"
                    :key="slot"
                    class="btn btn-outline-primary slot-button"
                    :class="{ active: selectedTime === slot }"
                    @click="selectedTime = slot">
                    {{ slot }}
                  </button>
                  <div v-if="!availableTimes.length" class="text-muted small">
                    {{ $t('booking.noAvailableSlots') }}
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center">
                <button class="btn btn-outline-secondary touch-friendly" @click="goToStep(1)">{{ $t('common.back') }}</button>
                <button class="btn btn-primary touch-friendly" :disabled="!canProceedFromSchedule" @click="goToStep(3)">{{ $t('common.continue') }}</button>
              </div>
            </div>
          </div>

          <!-- Step 3: Contact details -->
          <div v-if="currentStep === 3" class="card border-0 shadow-sm mb-4">
            <div class="card-header py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-0">{{ $t('booking.yourDetails') }}</h5>
                <small class="text-muted">{{ $t('booking.detailsDesc') }}</small>
              </div>
              <button class="btn btn-link text-decoration-none" @click="goToStep(2)">
                <i class="fas fa-arrow-left me-1"></i> {{ $t('booking.dateTime') }}
              </button>
            </div>
            <div class="card-body">
              <form @submit.prevent="submitBooking" class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">{{ $t('booking.fullName') }} *</label>
                  <input v-model="customer.name" type="text" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ $t('booking.mobileNumber') }} *</label>
                  <input v-model="customer.phone" type="tel" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ $t('booking.email') }}</label>
                  <input v-model="customer.email" type="email" class="form-control" :placeholder="$t('booking.youAtExample')">
                </div>
                <div class="col-12">
                  <label class="form-label">{{ $t('booking.specialRequests') }}</label>
                  <textarea v-model="customer.notes" class="form-control" rows="3" :placeholder="$t('booking.anythingElseToKnow')"></textarea>
                </div>
                <div class="col-12">
                  <div class="form-check">
                    <input v-model="customer.marketingOptIn" class="form-check-input" type="checkbox" id="marketingConsent">
                    <label class="form-check-label" for="marketingConsent">
                      {{ $t('booking.emailUpdatesConsent') }}
                    </label>
                  </div>
                </div>
                <div class="col-12 d-flex justify-content-between align-items-center">
                  <button type="button" class="btn btn-outline-secondary touch-friendly" @click="goToStep(2)">{{ $t('common.back') }}</button>
                  <button
                    type="submit"
                    class="btn btn-primary touch-friendly"
                    :disabled="isSubmitting || !canProceedFromSchedule"
                  >
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isSubmitting ? $t('common.loading') : $t('booking.bookNow') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card border-0 shadow-sm sticky-top" style="top: 100px;">
            <div class="card-header py-3">
              <h6 class="mb-0">{{ $t('booking.summary') }}</h6>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">{{ $t('booking.date') }}</span>
                <strong>{{ selectedDate ? formatDate(selectedDate) : $t('booking.chooseDate') }}</strong>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">{{ $t('booking.time') }}</span>
                <strong>{{ selectedTime || $t('booking.pickSlot') }}</strong>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">{{ $t('booking.barber') }}</span>
                <strong>{{ selectedBarberName || $t('booking.professionalBarber') }}</strong>
              </div>
              <hr>
              <div>
                <p class="text-muted mb-2">{{ $t('booking.services') }}</p>
                <div v-if="selectedServiceDetails.length">
                  <div v-for="service in selectedServiceDetails" :key="service._id" class="d-flex justify-content-between align-items-center mb-1">
                    <span>{{ service.name }} <small class="text-muted">({{ service.duration }} {{ $t('booking.minutes') }})</small></span>
                    <strong>{{ formatCurrency(service.price) }}</strong>
                  </div>
                </div>
                <p v-else class="text-muted small">{{ $t('booking.noServicesSelected') }}</p>
              </div>
              <hr>
              <div class="d-flex justify-content-between">
                <span>{{ $t('booking.totalDuration') }}</span>
                <strong>{{ totalDuration }} {{ $t('booking.minutes') }}</strong>
              </div>
              <div class="d-flex justify-content-between">
                <span>{{ $t('booking.totalPrice') }}</span>
                <strong>{{ formatCurrency(totalPrice) }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Debug Panel (Development Only) -->
      <div v-if="debugMode" class="row mt-4">
        <div class="col-12">
          <div class="card border-warning">
            <div class="card-header bg-warning text-dark">
              <h6 class="mb-0">🐛 Debug Information</h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <strong>API Configuration:</strong>
                  <pre class="small">{{ JSON.stringify({
                    apiUrl: getApiUrl(),
                    nodeEnv: process.env.NODE_ENV
                  }, null, 2) }}</pre>
                </div>
                <div class="col-md-6">
                  <strong>Current State:</strong>
                  <pre class="small">{{ JSON.stringify({
                    currentStep,
                    selectedServices: selectedServices.length,
                    selectedBarber,
                    selectedDate,
                    selectedTime,
                    availableTimes: availableTimes.length
                  }, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useToast } from 'vue-toastification'

export default {
  name: 'Appointments',
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      services: [],
      barbers: [],
      selectedServices: [],
      selectedBarber: '',
      selectedDate: '',
      currentWeekStart: '',
      selectedTime: '',
      availableTimes: [],
      currentStep: 1,
      availabilityTimeout: null,
      customer: {
        name: '',
        phone: '',
        email: '',
        notes: '',
        marketingOptIn: true
      },
      isSubmitting: false,
      debugMode: process.env.NODE_ENV === 'development',
      steps: [
        { number: 1, label: 'Services', subtitle: 'Choose' },
        { number: 2, label: 'Date & time', subtitle: 'Schedule' },
        { number: 3, label: 'Details', subtitle: 'Confirm' }
      ]
    }
  },
  computed: {
    selectedServiceDetails() {
      return this.services.filter(s => this.selectedServices.includes(s._id))
    },
    totalPrice() {
      return this.selectedServiceDetails.reduce((sum, s) => sum + s.price, 0)
    },
    totalDuration() {
      return this.selectedServiceDetails.reduce((sum, s) => sum + s.duration, 0)
    },
    canProceedFromServices() {
      return this.selectedServices.length > 0
    },
    canProceedFromSchedule() {
      return !!(this.selectedDate && this.selectedTime)
    },
    selectedBarberName() {
      const barber = this.barbers.find(b => b._id === this.selectedBarber)
      return barber?.name
    },
    weekDays() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const startDate = new Date(today)

      return Array.from({ length: 14 }, (_, index) => {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + index)
        const value = this.formatDateValue(date)

        return {
          label: date.toLocaleDateString(undefined, { weekday: 'short' }),
          number: String(date.getDate()).padStart(2, '0'),
          value,
          isSelected: this.selectedDate === value,
          isToday: this.isSameDay(date, today)
        }
      })
    },
    monthLabel() {
      const referenceDate = this.selectedDate || this.currentWeekStart || this.formatDateValue(new Date())
      return new Date(referenceDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    },
    weekRangeLabel() {
      const start = new Date(this.currentWeekStart || this.getStartOfWeek(new Date()))
      const end = new Date(start)
      end.setDate(start.getDate() + 6)

      const startLabel = start.toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
      const endLabel = end.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })
      return `${startLabel} - ${endLabel}`
    }
  },
  async mounted() {
    // Test API connectivity first
    await this.testApiConnectivity()
    await Promise.all([this.fetchServices(), this.fetchBarbers()])

    const today = new Date()
    this.selectedDate = this.formatDateValue(today)
    this.currentWeekStart = this.getStartOfWeek(today)
    
    // Ensure we start with today or the first available future date
    const firstAvailable = this.findFirstAvailableDate(new Date(this.currentWeekStart))
    this.selectedDate = firstAvailable
  },
  
  beforeUnmount() {
    // Clean up timeout when component is destroyed
    clearTimeout(this.availabilityTimeout)
  },
  methods: {
    formatDateValue(date) {
      const parsedDate = new Date(date)
      const year = parsedDate.getFullYear()
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
      const day = String(parsedDate.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    getStartOfWeek(date) {
      const parsedDate = new Date(date)
      const day = parsedDate.getDay()
      const diff = day === 0 ? -6 : 1 - day
      parsedDate.setDate(parsedDate.getDate() + diff)
      return this.formatDateValue(parsedDate)
    },
    isSameDay(dateA, dateB) {
      return (
        dateA.getFullYear() === dateB.getFullYear() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getDate() === dateB.getDate()
      )
    },
    formatBackendMessage(message) {
      if (!message) return ''

      if (this.$te(message)) {
        return this.$t(message)
      }

      const namespacedKey = message.startsWith('backend.') ? message : `backend.${message}`
      if (this.$te(namespacedKey)) {
        return this.$t(namespacedKey)
      }

      // Fallback: humanize backend keys so users never see raw identifiers
      const humanized = message
        .replace(/^backend[.:]/, '')
        .replace(/^toast[.:]/, '')
        .replace(/[._]/g, ' ')
      return humanized.charAt(0).toUpperCase() + humanized.slice(1)
    },
    async fetchServices() {
      try {
        const response = await axios.get(`${this.getApiUrl()}/services/public`)
        this.services = response.data
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    },
      async fetchBarbers() {
        try {
          const response = await axios.get(`${this.getApiUrl()}/barbers/public`)
          this.barbers = response.data
          // Auto-select Shair Ali Barber (single barber system)
          if (this.barbers.length > 0) {
            const shairAliBarber = this.barbers.find(b => b.name === 'Shair Ali Barber')
            this.selectedBarber = shairAliBarber?._id || this.barbers[0]._id
          }
        } catch (error) {
          console.error('Error fetching barbers:', error)
        }
      },
    changeWeek(direction) {
      // Navigation disabled since we show future dates only
    },
    
    findFirstAvailableDate(weekStart) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + i)
        date.setHours(0, 0, 0, 0)
        
        if (date >= today) {
          return this.formatDateValue(date)
        }
      }
      
      // Fallback to today if no future date found in week
      return this.formatDateValue(today)
    },
    selectDate(date) {
      // Prevent selecting past dates
      const selectedDate = new Date(date)
      const today = new Date()
      if (selectedDate < today && !this.isSameDay(selectedDate, today)) {
        return
      }
      
      this.selectedDate = date
      this.currentWeekStart = this.getStartOfWeek(date)
      this.selectedTime = ''
      // Debounce availability refresh to prevent excessive API calls
      clearTimeout(this.availabilityTimeout)
      this.availabilityTimeout = setTimeout(() => {
        this.handleAvailabilityRefresh()
      }, 300)
    },
    async handleAvailabilityRefresh() {
      if (this.currentStep < 2) return
      this.selectedTime = ''

      if (!this.selectedDate || !this.selectedBarber) {
        this.availableTimes = []
        return
      }
      
      // Use default duration if no services selected
      const duration = this.totalDuration || 30
      this.currentWeekStart = this.getStartOfWeek(this.selectedDate)

      try {
        console.log('Fetching availability with params:', {
          barberId: this.selectedBarber,
          date: this.selectedDate,
          duration: duration,
          apiUrl: process.env.VUE_APP_API_URL
        })
        
        const response = await axios.get(`${this.getApiUrl()}/appointments/availability`, {
          params: {
            barberId: this.selectedBarber,
            date: this.selectedDate,
            duration: duration
          },
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        console.log('Availability response:', response.data)
        this.availableTimes = response.data.availableTimes || []
        
        // Show additional info in console for debugging
        if (response.data.totalSlots !== undefined) {
          console.log(`Found ${response.data.totalSlots} available slots for ${this.selectedDate}`);
        }
      } catch (error) {
        console.error('Error fetching availability:', error)
        console.error('Error response:', error.response)
        console.error('Error request:', error.request)
        
        this.availableTimes = []
        
        let errorMessage = this.$t('toast.availabilityError')
        if (error.response) {
          errorMessage = `API Error: ${error.response.status} - ${error.response.statusText}`
        } else if (error.request) {
          errorMessage = 'Network Error: Unable to reach server'
        } else {
          errorMessage = `Request Error: ${error.message}`
        }
        
        this.toast.error(errorMessage, {
          position: 'top-center',
          timeout: 8000
        })
      }
    },
    goToStep(step) {
      this.currentStep = step
      if (step === 2) {
        this.handleAvailabilityRefresh()
      }
    },
    async submitBooking() {
      if (!this.canProceedFromSchedule) {
        this.toast.warning(this.$t('toast.selectTimeSlot'), {
          position: 'top-center'
        })
        return
      }

      if (this.isSubmitting) return
      this.isSubmitting = true

      // Validate slot availability before booking
      try {
        console.log('Validating slot with data:', {
          barberId: this.selectedBarber,
          date: this.selectedDate,
          time: this.selectedTime,
          duration: this.totalDuration || 30
        })
        
        const validationResponse = await axios.post(`${this.getApiUrl()}/appointments/validate-slot`, {
          barberId: this.selectedBarber,
          date: this.selectedDate,
          time: this.selectedTime,
          duration: this.totalDuration || 30
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })

        if (!validationResponse.data.available) {
          this.toast.error(this.$t('toast.bookingValidationError', {
            reason: validationResponse.data.reason || 'Time slot no longer available'
          }), {
            timeout: 5000,
            position: 'top-center'
          })

          // Refresh availability and suggest alternatives
          await this.handleAvailabilityRefresh()
          return
        }
      } catch (validationError) {
        console.error('Slot validation failed:', validationError)
        this.toast.error(this.$t('toast.slotValidationError'), {
          position: 'top-center'
        })
        this.isSubmitting = false
        return
      }

      // Proceed with booking
      try {
        console.log('Submitting booking with data:', {
          customerName: this.customer.name,
          customerPhone: this.customer.phone,
          customerEmail: this.customer.email,
          barberId: this.selectedBarber,
          services: this.selectedServices,
          date: this.selectedDate,
          time: this.selectedTime,
          apiUrl: process.env.VUE_APP_API_URL
        })
        
        const response = await axios.post(`${this.getApiUrl()}/appointments`, {
          customerName: this.customer.name,
          customerPhone: this.customer.phone,
          customerEmail: this.customer.email,
          notes: this.customer.notes,
          marketingOptIn: this.customer.marketingOptIn,
          barberId: this.selectedBarber,
          services: this.selectedServices,
          date: this.selectedDate,
          time: this.selectedTime
        }, {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })

        this.toast.success(this.$t('toast.bookingRequestSuccess'), {
          timeout: 5000,
          position: 'top-center'
        })

        // Show additional message if provided by backend
        if (response.data.message) {
          setTimeout(() => {
            this.toast.info(this.formatBackendMessage(response.data.message), {
              timeout: 7000,
              position: 'top-center'
            })
          }, 1000)
        }

        this.resetFlow()
      } catch (error) {
        const errorData = error.response?.data
        let message = this.$t('toast.bookingGenericError')

        if (errorData?.message) {
          message = this.$t('toast.bookingErrorWithReason', {
            reason: this.formatBackendMessage(errorData.message)
          })
        }

        // If slot conflict, refresh availability
        if (error.response?.status === 409) {
          await this.handleAvailabilityRefresh()

          if (errorData?.availableTimes?.length) {
            message += ` ${this.$t('toast.bookingConflictAlternatives', {
              count: errorData.availableTimes.length
            })}`
          }
        }

        this.toast.error(message, {
          timeout: 5000,
          position: 'top-center'
        })
      } finally {
        this.isSubmitting = false
      }
    },
    resetFlow() {
      this.selectedServices = []
      const today = new Date()
      this.selectedDate = this.formatDateValue(today)
      this.currentWeekStart = this.getStartOfWeek(today)
      this.selectedTime = ''
      this.currentStep = 1
      this.availableTimes = []
      
      // Clear any pending availability refresh
      clearTimeout(this.availabilityTimeout)
      
      this.customer = {
        name: '',
        phone: '',
        email: '',
        notes: '',
        marketingOptIn: true
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(value)
    },
    formatDate(value) {
      return new Date(value).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    },
    getApiUrl() {
      return process.env.VUE_APP_API_URL || 'http://localhost:5000/api'
    },
    async testApiConnectivity() {
      try {
        const apiUrl = this.getApiUrl()
        console.log('Testing API connectivity to:', apiUrl)
        
        if (!apiUrl || apiUrl.includes('undefined')) {
          throw new Error('API URL is not properly configured')
        }
        
        const response = await axios.get(`${this.getApiUrl()}/health`, {
          timeout: 5000
        })
        console.log('API health check successful:', response.data)
      } catch (error) {
        console.error('API connectivity test failed:', {
          message: error.message,
          response: error.response,
          request: error.request,
          apiUrl: this.getApiUrl()
        })
        
        let errorMessage = 'Unable to connect to booking system.'
        if (error.message.includes('API URL')) {
          errorMessage = 'Booking system configuration error. Please contact support.'
        } else if (!error.response) {
          errorMessage = 'Network error. Please check your internet connection.'
        }
        
        this.toast.error(errorMessage, {
          position: 'top-center',
          timeout: 10000
        })
      }
    }
  }
}
</script>

<style scoped>
.booking-page {
  background: var(--bg-primary);
  min-height: 100vh;
  padding-bottom: 2rem;
  color: var(--text-primary);
}

.booking-header {
  gap: 1rem;
}

/* Enhanced mobile optimizations */
@media (max-width: 768px) {
  .booking-page .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .booking-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem;
  }

  .booking-page h2 {
    font-size: 1.75rem;
  }
  
  .d-none.d-md-flex {
    display: none !important;
  }
  
  .touch-friendly {
    min-height: 48px;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
  
  .btn {
    min-height: 44px;
    padding: 0.75rem 1.25rem;
  }
  
  .form-control, .form-select {
    min-height: 48px;
    padding: 0.875rem 1rem;
    font-size: 16px;
  }
}

.step-indicator {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  color: var(--text-muted);
}

.step-indicator.active {
  background: rgba(59, 130, 246, 0.1);
  color: var(--primary);
}

.step-indicator.completed {
  color: var(--success);
}

.service-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.service-card:hover {
  border-color: var(--text-muted);
  box-shadow: var(--shadow-lg);
}

.service-card.selected {
  border-color: var(--primary);
  box-shadow: 0 12px 25px rgba(37, 99, 235, 0.15);
}

.service-card .form-check-input {
  margin-top: 6px;
}

.btn-outline-primary.active {
  background: #2563eb;
  color: #fff;
}

.calendar-wrapper {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 16px;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
}

.icon-button {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px;
}

/* iOS and Android specific optimizations */
@supports (-webkit-touch-callout: none) {
  .service-card, .day-card, .slot-button {
    -webkit-tap-highlight-color: rgba(59, 130, 246, 0.1);
  }
  
  input, select, textarea {
    -webkit-appearance: none;
    border-radius: 8px;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .service-card, .day-card, .card {
    border-width: 0.5px;
  }
}

/* Landscape orientation adjustments */
@media (max-height: 500px) and (orientation: landscape) {
  .booking-page {
    padding-bottom: 1rem;
  }
  
  .hero-content {
    padding: 1rem 0;
  }
  
  .btn {
    min-height: 40px;
    padding: 0.5rem 1rem;
  }
}

.day-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  text-align: left;
  transition: all 0.2s ease;
  color: var(--text-primary);
}

.day-card .weekday {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.day-card .day-number {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
}

.day-card:hover {
  border-color: var(--text-muted);
  box-shadow: var(--shadow-lg);
}

.day-card.today {
  border-color: var(--text-muted);
  background: var(--bg-tertiary);
}

.day-card.active {
  border-color: var(--primary);
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.2);
}



.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
}

@media (max-width: 576px) {
  .slot-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}

.slot-button {
  border-width: 1.5px;
  border-radius: 12px;
  padding: 10px 12px;
}

@media (max-width: 576px) {
  .slot-button {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
}

.card {
  border-radius: 16px;
}

.card-header {
  border-radius: 16px 16px 0 0 !important;
}

@media (max-width: 992px) {
  .sticky-top {
    position: relative !important;
    top: 0 !important;
  }
}

@media (max-width: 768px) {
  .service-card {
    padding: 12px;
  }
  
  .day-card {
    padding: 8px;
  }
  
  .day-card .day-number {
    font-size: 1.2rem;
  }
  
  .calendar-wrapper {
    padding: 12px;
  }
  
  .icon-button {
    width: 36px;
    height: 36px;
  }
}
</style>
