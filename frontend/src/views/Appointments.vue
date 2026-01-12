<template>
  <div class="booking-page">
    <div class="container py-5">
      <!-- Steps Indicator -->
      <div class="steps-header mb-3">
        <div class="steps-row">
          <template v-for="(step, index) in steps" :key="step.number">
            <div class="step-item" :class="{ active: currentStep === step.number, completed: currentStep > step.number }">
              <span class="step-badge" :class="currentStep >= step.number ? 'active' : ''">{{ step.number }}</span>
              <span class="step-label">{{ $t(`booking.step${step.number}`) }}</span>
            </div>
            <div v-if="index < steps.length - 1" class="step-connector" :class="{ completed: currentStep > step.number }"></div>
          </template>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <!-- Step 1: Services -->
          <div v-if="currentStep === 1" class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <div class="row g-2">
                <div class="col-md-6" v-for="service in services" :key="service._id">
                  <label class="service-card-new" :class="{ selected: selectedServices.includes(service._id) }">
                    <div class="service-info">
                      <span class="service-name">{{ service.name }}</span>
                      <div class="service-meta">
                        <span class="service-duration">{{ service.duration }} Min.</span>
                        <span class="service-price">{{ formatCurrency(service.price) }}</span>
                      </div>
                    </div>
                    <input type="checkbox" class="service-checkbox" :value="service._id" v-model="selectedServices" @change="handleAvailabilityRefresh">
                  </label>
                </div>
              </div>
              <div class="d-flex justify-content-end mt-3">
                <button class="btn btn-sm btn-primary" :disabled="!canProceedFromServices" @click="goToStep(2)">
                  {{ $t('common.continue') }} <i class="fas fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Date and Time -->
          <div v-if="currentStep === 2" class="card border-0 shadow-sm mb-4">
            <div class="card-body">

              <div class="calendar-wrapper mb-2">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <button 
                    class="btn btn-sm btn-outline-secondary calendar-nav-btn" 
                    @click="navigateCalendar(-1)"
                    :disabled="isCurrentMonth"
                    title="Previous month">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <div class="text-center flex-grow-1">
                    <h5 class="mb-0">{{ monthYearLabel }}</h5>
                    <p class="text-muted small mb-0">{{ $t('booking.availableDates') }}</p>
                  </div>
                  <button 
                    class="btn btn-sm btn-outline-secondary calendar-nav-btn" 
                    @click="navigateCalendar(1)"
                    title="Next month">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>

                <div class="calendar-grid-month">
                  <div class="calendar-header" v-for="day in calendarDayNames" :key="day">
                    {{ day }}
                  </div>
                  <button
                    v-for="day in monthDays"
                    :key="day.value"
                    class="calendar-day"
                    :class="{ 
                      active: day.isSelected, 
                      today: day.isToday,
                      'other-month': !day.isCurrentMonth,
                      'past-date': day.isPast,
                      disabled: day.isPast
                    }"
                    :disabled="day.isPast"
                    @click="selectDate(day.value)">
                    <span class="day-number">{{ day.number }}</span>
                  </button>
                </div>
              </div>

              <div class="mb-2">
                <p class="mb-1 fw-semibold small">{{ $t('booking.availableTimes') }}</p>
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

              <div class="d-flex justify-content-between align-items-center mt-3">
                <button class="btn btn-sm btn-outline-secondary" @click="goToStep(1)">
                  <i class="fas fa-arrow-left me-1"></i>{{ $t('booking.services') }}
                </button>
                <button class="btn btn-sm btn-primary" :disabled="!canProceedFromSchedule" @click="goToStep(3)">
                  {{ $t('common.continue') }} <i class="fas fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 3: Contact details -->
          <div v-if="currentStep === 3" class="card border-0 shadow-sm mb-4">
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
                  <label class="form-label">{{ $t('booking.email') }} *</label>
                  <input v-model="customer.email" type="email" class="form-control" required>
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
                <div class="col-12 d-flex justify-content-between align-items-center mt-2">
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="goToStep(2)">
                    <i class="fas fa-arrow-left me-1"></i>{{ $t('common.back') }}
                  </button>
                  <button
                    type="submit"
                    class="btn btn-sm btn-primary"
                    :disabled="isSubmitting || !canProceedFromSchedule"
                  >
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
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
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      customer: {
        name: '',
        phone: '',
        email: '',
        notes: '',
        marketingOptIn: true
      },
      isSubmitting: false,

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
    calendarDayNames() {
      return [
        this.$t('booking.dayNames.sun'),
        this.$t('booking.dayNames.mon'),
        this.$t('booking.dayNames.tue'),
        this.$t('booking.dayNames.wed'),
        this.$t('booking.dayNames.thu'),
        this.$t('booking.dayNames.fri'),
        this.$t('booking.dayNames.sat')
      ]
    },
    monthDays() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const firstDay = new Date(this.currentYear, this.currentMonth, 1)
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0)
      const prevLastDay = new Date(this.currentYear, this.currentMonth, 0)
      
      const days = []
      const startDay = firstDay.getDay()
      
      // Previous month days
      for (let i = startDay - 1; i >= 0; i--) {
        const date = new Date(this.currentYear, this.currentMonth - 1, prevLastDay.getDate() - i)
        const value = this.formatDateValue(date)
        const isPast = date < today && !this.isSameDay(date, today)
        
        days.push({
          number: String(date.getDate()).padStart(2, '0'),
          value,
          isSelected: this.selectedDate === value,
          isToday: this.isSameDay(date, today),
          isCurrentMonth: false,
          isPast
        })
      }
      
      // Current month days
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(this.currentYear, this.currentMonth, i)
        const value = this.formatDateValue(date)
        const isPast = date < today && !this.isSameDay(date, today)
        
        days.push({
          number: String(i).padStart(2, '0'),
          value,
          isSelected: this.selectedDate === value,
          isToday: this.isSameDay(date, today),
          isCurrentMonth: true,
          isPast
        })
      }
      
      // Next month days to complete the grid
      const totalSlots = Math.ceil(days.length / 7) * 7
      const nextMonthStart = new Date(this.currentYear, this.currentMonth + 1, 1)
      while (days.length < totalSlots) {
        const date = new Date(nextMonthStart)
        date.setDate(nextMonthStart.getDate() + (days.length - (startDay + lastDay.getDate())))
        const value = this.formatDateValue(date)
        const isPast = date < today && !this.isSameDay(date, today)
        
        days.push({
          number: String(date.getDate()).padStart(2, '0'),
          value,
          isSelected: this.selectedDate === value,
          isToday: this.isSameDay(date, today),
          isCurrentMonth: false,
          isPast
        })
      }
      
      return days
    },
    monthYearLabel() {
      const date = new Date(this.currentYear, this.currentMonth)
      return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    },
    isCurrentMonth() {
      const today = new Date()
      return this.currentYear === today.getFullYear() && this.currentMonth === today.getMonth()
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
    navigateCalendar(direction) {
      // Navigate forward or backward by month
      if (direction === -1 && this.isCurrentMonth) {
        return // Don't allow going back before current month
      }
      
      let newMonth = this.currentMonth + direction
      let newYear = this.currentYear
      
      if (newMonth < 0) {
        newMonth = 11
        newYear--
      } else if (newMonth > 11) {
        newMonth = 0
        newYear++
      }
      
      // Don't allow going back before current month
      const today = new Date()
      const todayMonth = today.getMonth()
      const todayYear = today.getFullYear()
      
      if (newYear < todayYear || (newYear === todayYear && newMonth < todayMonth)) {
        return
      }
      
      this.currentMonth = newMonth
      this.currentYear = newYear
      
      // Clear selected time when navigating
      this.selectedTime = ''
      
      // If selected date is not in current month, clear it
      if (this.selectedDate) {
        const selected = new Date(this.selectedDate)
        if (selected.getMonth() !== this.currentMonth || selected.getFullYear() !== this.currentYear) {
          this.selectedDate = ''
          this.availableTimes = []
        }
      }
    },
    selectDate(date) {
      // Prevent selecting past dates
      const selectedDate = new Date(date)
      selectedDate.setHours(0, 0, 0, 0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
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

        this.toast.success(this.$t('toast.bookingSuccess'), {
          timeout: 5000,
          position: 'top-center'
        })

        // Force refresh availability to hide the booked slot immediately
        await this.handleAvailabilityRefresh()
        
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
      this.dateOffset = 0 // Reset to first page
      
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
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
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
  padding-bottom: 1rem;
  color: var(--text-primary);
}

.booking-page .container {
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
}

@media (max-width: 576px) {
  .booking-page .container {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
    padding-top: 0.5rem !important;
  }
}

/* Steps Header */
.steps-header {
  padding: 0.5rem 0;
}

.steps-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.5rem;
  border-radius: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.step-item.active {
  background: rgba(107, 114, 128, 0.1);
  border-color: var(--primary);
}

.step-item.completed {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--success);
}

.step-badge {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 600;
  background: var(--bg-tertiary);
  color: var(--text-muted);
}

.step-badge.active {
  background: var(--primary);
  color: white;
}

.step-item.completed .step-badge {
  background: var(--success);
  color: white;
}

.step-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.step-item.active .step-label {
  color: var(--primary);
  font-weight: 600;
}

.step-item.completed .step-label {
  color: var(--success);
}

.step-connector {
  width: 14px;
  height: 2px;
  background: var(--border-color);
  border-radius: 1px;
}

.step-connector.completed {
  background: var(--success);
}

@media (max-width: 576px) {
  .step-item {
    padding: 0.2rem 0.4rem;
  }
  
  .step-badge {
    width: 16px;
    height: 16px;
    font-size: 0.6rem;
  }
  
  .step-label {
    font-size: 0.6rem;
  }
  
  .step-connector {
    width: 10px;
  }
}

/* Enhanced mobile optimizations */
@media (max-width: 768px) {
  .booking-page .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
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


/* New Service Card Design */
.service-card-new {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-secondary);
  width: 100%;
}

.service-card-new:hover {
  border-color: var(--primary);
  background: rgba(107, 114, 128, 0.02);
}

.service-card-new.selected {
  border-color: var(--primary);
  background: rgba(107, 114, 128, 0.05);
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.service-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-primary);
}

.service-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-duration,
.service-price {
  font-size: 0.7rem;
  color: var(--primary);
  font-weight: 500;
}

.service-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  accent-color: var(--primary);
  flex-shrink: 0;
}

.service-card-new.selected .service-checkbox {
  border-color: var(--primary);
}

.btn-outline-primary.active {
  background: #4b5563;
  color: #fff;
}

.calendar-nav-btn {
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 0.7rem;
}

.calendar-nav-btn:hover:not(:disabled) {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.calendar-nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.calendar-wrapper {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
}

.calendar-wrapper h5 {
  font-size: 0.75rem !important;
  margin-bottom: 0 !important;
}

.calendar-wrapper p {
  font-size: 0.6rem !important;
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

.calendar-grid-month {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-header {
  text-align: center;
  font-weight: 600;
  font-size: 0.55rem;
  color: var(--text-secondary);
  padding: 2px 1px;
  text-transform: uppercase;
}

.calendar-day {
  aspect-ratio: 1;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0;
  min-height: 28px;
  max-height: 32px;
}

.calendar-day:hover:not(.disabled):not(.past-date) {
  border-color: var(--primary);
  background: rgba(107, 114, 128, 0.05);
}

.calendar-day.today {
  border-color: var(--primary);
  background: rgba(107, 114, 128, 0.1);
  font-weight: 700;
}

.calendar-day.active {
  border-color: var(--primary);
  background: rgba(107, 114, 128, 0.2);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
  font-weight: 700;
}

.calendar-day.other-month {
  opacity: 0.4;
  color: var(--text-muted);
}

.calendar-day.past-date,
.calendar-day.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: var(--bg-tertiary);
  color: var(--text-muted);
}

.calendar-day.past-date:hover,
.calendar-day.disabled:hover {
  border-color: var(--border-color);
  background: var(--bg-tertiary);
}

.calendar-day .day-number {
  font-size: 0.65rem;
  font-weight: 500;
}

.calendar-day.today .day-number,
.calendar-day.active .day-number {
  font-weight: 700;
}

/* iOS and Android specific optimizations */
@supports (-webkit-touch-callout: none) {
  .service-card, .day-card, .slot-button {
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.1);
  }
  
  input, select, textarea {
    -webkit-appearance: none;
    appearance: none;
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
  background: rgba(107, 114, 128, 0.1);
  box-shadow: 0 12px 30px rgba(107, 114, 128, 0.2);
}



.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 6px;
}

@media (max-width: 576px) {
  .slot-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }
}

.slot-button {
  border-width: 1px;
  border-radius: 6px;
  padding: 4px 6px;
  font-size: 0.7rem;
  min-height: 28px;
}

@media (max-width: 576px) {
  .slot-button {
    padding: 3px 4px;
    font-size: 0.65rem;
    min-height: 26px;
  }
}

.card {
  border-radius: 10px;
}

.card-header {
  border-radius: 10px 10px 0 0 !important;
}

.card-body {
  padding: 10px !important;
}

@media (max-width: 576px) {
  .card-body {
    padding: 8px !important;
  }
}

.card-body span,
.card-body p {
  font-size: 0.7rem !important;
}

.card-body strong {
  font-size: 0.7rem !important;
}

.card-body small {
  font-size: 0.6rem !important;
}

.card-body hr {
  margin: 0.5rem 0 !important;
}

.card h6 {
  font-size: 0.75rem !important;
}

.card-header {
  padding: 0.5rem 0.75rem !important;
}

.form-label {
  font-size: 0.7rem !important;
  margin-bottom: 0.25rem !important;
}

.form-control, .form-select {
  font-size: 0.75rem !important;
  padding: 0.4rem 0.6rem !important;
  min-height: 34px !important;
}

.form-check-label {
  font-size: 0.7rem !important;
}

.btn-sm {
  font-size: 0.7rem !important;
  padding: 0.35rem 0.7rem !important;
}

@media (max-width: 992px) {
  .sticky-top {
    position: relative !important;
    top: 0 !important;
  }
}

@media (max-width: 768px) {
  .service-card-new {
    padding: 8px 10px;
  }
  
  .service-name {
    font-size: 0.75rem;
  }
  
  .service-duration,
  .service-price {
    font-size: 0.65rem;
  }
  
  .service-checkbox {
    width: 16px;
    height: 16px;
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
  
  .calendar-grid-month {
    gap: 2px;
  }
  
  .calendar-header {
    font-size: 0.5rem;
    padding: 2px 0;
  }
  
  .calendar-day {
    min-height: 26px;
    max-height: 28px;
    border-radius: 3px;
  }
  
  .calendar-day .day-number {
    font-size: 0.6rem;
  }
  
  .calendar-wrapper {
    padding: 6px;
  }
  
  .calendar-wrapper h5 {
    font-size: 0.7rem !important;
  }
}
</style>
