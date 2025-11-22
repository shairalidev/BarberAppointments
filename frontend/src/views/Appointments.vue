<template>
  <div class="booking-page">
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p class="text-primary fw-semibold mb-1">Step {{ currentStep }} of 3</p>
          <h2 class="fw-bold mb-0">Schedule your visit</h2>
          <p class="text-muted">Choose services, pick an available time, and share your details to confirm.</p>
        </div>
        <div class="d-none d-md-flex align-items-center gap-3">
          <div v-for="step in steps" :key="step.number" class="step-indicator" :class="{ active: currentStep === step.number, completed: currentStep > step.number }">
            <span class="badge rounded-circle me-2" :class="currentStep >= step.number ? 'bg-primary' : 'bg-light text-muted'">{{ step.number }}</span>
            <div class="d-flex flex-column">
              <small class="text-muted">{{ step.subtitle }}</small>
              <strong>{{ step.label }}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <!-- Step 1: Services -->
          <div v-if="currentStep === 1" class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white py-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="mb-0">Choose services</h5>
                  <small class="text-muted">Select one or more services to continue</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label class="text-muted small mb-0">Barber</label>
                  <select v-model="selectedBarber" class="form-select form-select-sm" @change="handleAvailabilityRefresh">
                    <option value="" disabled>Select a barber</option>
                    <option v-for="barber in barbers" :key="barber._id" :value="barber._id">{{ barber.name }}</option>
                  </select>
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
                          <span class="badge bg-light text-primary">Add</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <small class="text-muted">You can choose multiple services before continuing.</small>
                <button class="btn btn-primary" :disabled="!canProceedFromServices" @click="goToStep(2)">Choose time</button>
              </div>
            </div>
          </div>

          <!-- Step 2: Date and Time -->
          <div v-if="currentStep === 2" class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-0">Pick a date and time</h5>
                <small class="text-muted">Only free slots are shown for the selected barber</small>
              </div>
              <button class="btn btn-link text-decoration-none" @click="goToStep(1)">
                <i class="fas fa-arrow-left me-1"></i> Services
              </button>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                  <p class="text-muted mb-1">Step 2 of 3</p>
                  <h5 class="mb-0">Choose a date and time</h5>
                  <small class="text-muted">Pick a day in the week view and then choose an available slot</small>
                </div>
                <div class="d-flex flex-column">
                  <label class="text-muted small mb-1">Barber</label>
                  <select v-model="selectedBarber" class="form-select" @change="handleAvailabilityRefresh">
                    <option value="" disabled>Select a barber</option>
                    <option v-for="barber in barbers" :key="barber._id" :value="barber._id">{{ barber.name }}</option>
                  </select>
                </div>
              </div>

              <div class="calendar-wrapper mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <button class="btn btn-light icon-button" @click="changeWeek(-1)">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <div class="text-center">
                    <p class="text-muted small mb-1">{{ weekRangeLabel }}</p>
                    <h5 class="mb-0">{{ monthLabel }}</h5>
                  </div>
                  <button class="btn btn-light icon-button" @click="changeWeek(1)">
                    <i class="fas fa-chevron-right"></i>
                  </button>
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
                    <p class="mb-0 fw-semibold">Available times</p>
                    <small v-if="selectedDate" class="text-muted">What time works best for you on {{ formatDate(selectedDate) }}?</small>
                  </div>
                  <small class="text-muted">Times are listed in your local time zone.</small>
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
                    No available slots for the selected date and services.
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center">
                <button class="btn btn-outline-secondary" @click="goToStep(1)">Back</button>
                <button class="btn btn-primary" :disabled="!canProceedFromSchedule" @click="goToStep(3)">Continue</button>
              </div>
            </div>
          </div>

          <!-- Step 3: Contact details -->
          <div v-if="currentStep === 3" class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-0">Your details</h5>
                <small class="text-muted">We will send confirmation to your email</small>
              </div>
              <button class="btn btn-link text-decoration-none" @click="goToStep(2)">
                <i class="fas fa-arrow-left me-1"></i> Date & time
              </button>
            </div>
            <div class="card-body">
              <form @submit.prevent="submitBooking" class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Full name *</label>
                  <input v-model="customer.name" type="text" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Mobile number *</label>
                  <input v-model="customer.phone" type="tel" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input v-model="customer.email" type="email" class="form-control" placeholder="you@example.com">
                </div>
                <div class="col-12">
                  <label class="form-label">Special requests</label>
                  <textarea v-model="customer.notes" class="form-control" rows="3" placeholder="Anything else we should know?"></textarea>
                </div>
                <div class="col-12">
                  <div class="form-check">
                    <input v-model="customer.marketingOptIn" class="form-check-input" type="checkbox" id="marketingConsent">
                    <label class="form-check-label" for="marketingConsent">
                      Yes, I want to receive appointment updates via email.
                    </label>
                  </div>
                </div>
                <div class="col-12 d-flex justify-content-between align-items-center">
                  <button type="button" class="btn btn-outline-secondary" @click="goToStep(2)">Back</button>
                  <button type="submit" class="btn btn-primary">Book now</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card border-0 shadow-sm sticky-top" style="top: 100px;">
            <div class="card-header bg-white py-3">
              <h6 class="mb-0">Summary</h6>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Date</span>
                <strong>{{ selectedDate ? formatDate(selectedDate) : 'Choose a date' }}</strong>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Time</span>
                <strong>{{ selectedTime || 'Pick a slot' }}</strong>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Barber</span>
                <strong>{{ selectedBarberName || 'Select a barber' }}</strong>
              </div>
              <hr>
              <div>
                <p class="text-muted mb-2">Services</p>
                <div v-if="selectedServiceDetails.length">
                  <div v-for="service in selectedServiceDetails" :key="service._id" class="d-flex justify-content-between align-items-center mb-1">
                    <span>{{ service.name }} <small class="text-muted">({{ service.duration }} min)</small></span>
                    <strong>{{ formatCurrency(service.price) }}</strong>
                  </div>
                </div>
                <p v-else class="text-muted small">No services selected</p>
              </div>
              <hr>
              <div class="d-flex justify-content-between">
                <span>Total duration</span>
                <strong>{{ totalDuration }} min</strong>
              </div>
              <div class="d-flex justify-content-between">
                <span>Total price</span>
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

export default {
  name: 'Appointments',
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
      customer: {
        name: '',
        phone: '',
        email: '',
        notes: '',
        marketingOptIn: true
      },
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
      return this.selectedServices.length > 0 && !!this.selectedBarber
    },
    canProceedFromSchedule() {
      return !!(this.selectedDate && this.selectedTime && this.selectedBarber)
    },
    selectedBarberName() {
      const barber = this.barbers.find(b => b._id === this.selectedBarber)
      return barber?.name
    },
    weekDays() {
      const startValue = this.currentWeekStart || this.getStartOfWeek(new Date())
      const start = new Date(startValue)

      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(start)
        date.setDate(start.getDate() + index)
        const value = this.formatDateValue(date)

        return {
          label: date.toLocaleDateString(undefined, { weekday: 'short' }),
          number: String(date.getDate()).padStart(2, '0'),
          value,
          isSelected: this.selectedDate === value,
          isToday: this.isSameDay(date, new Date())
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
    await Promise.all([this.fetchServices(), this.fetchBarbers()])

    const today = new Date()
    this.selectedDate = this.formatDateValue(today)
    this.currentWeekStart = this.getStartOfWeek(today)
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
    async fetchServices() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/services`)
        this.services = response.data
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    },
    async fetchBarbers() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/barbers`)
        this.barbers = response.data
        if (!this.selectedBarber && this.barbers.length) {
          this.selectedBarber = this.barbers[0]._id
        }
      } catch (error) {
        console.error('Error fetching barbers:', error)
      }
    },
    changeWeek(direction) {
      const start = new Date(this.currentWeekStart || this.getStartOfWeek(new Date()))
      start.setDate(start.getDate() + 7 * direction)
      this.currentWeekStart = this.formatDateValue(start)
      this.selectedDate = this.formatDateValue(start)
      this.selectedTime = ''
      this.handleAvailabilityRefresh()
    },
    selectDate(date) {
      this.selectedDate = date
      this.currentWeekStart = this.getStartOfWeek(date)
      this.selectedTime = ''
      this.handleAvailabilityRefresh()
    },
    async handleAvailabilityRefresh() {
      if (this.currentStep < 2) return
      this.selectedTime = ''

      if (!this.canProceedFromServices || !this.selectedDate) {
        this.availableTimes = []
        return
      }

      this.currentWeekStart = this.getStartOfWeek(this.selectedDate)

      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/appointments/availability`, {
          params: {
            barberId: this.selectedBarber,
            date: this.selectedDate,
            duration: this.totalDuration
          }
        })
        this.availableTimes = response.data.availableTimes || []
      } catch (error) {
        console.error('Error fetching availability:', error)
        this.availableTimes = []
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
        alert('Please select a date and time slot.')
        return
      }

      try {
        await axios.post(`${process.env.VUE_APP_API_URL}/appointments`, {
          customerName: this.customer.name,
          customerPhone: this.customer.phone,
          customerEmail: this.customer.email,
          notes: this.customer.notes,
          marketingOptIn: this.customer.marketingOptIn,
          barberId: this.selectedBarber,
          services: this.selectedServices,
          date: this.selectedDate,
          time: this.selectedTime
        })

        alert('Appointment booked successfully! A confirmation email will be prepared from the admin template.')
        this.resetFlow()
      } catch (error) {
        const message = error.response?.data?.message || 'Error booking appointment. Please try another slot.'
        alert(message)
      }
    },
    resetFlow() {
      this.selectedServices = []
      const today = new Date()
      this.selectedDate = this.formatDateValue(today)
      this.currentWeekStart = this.getStartOfWeek(today)
      this.selectedTime = ''
      this.currentStep = 1
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
    }
  }
}
</script>

<style scoped>
.booking-page {
  background: #f8fafc;
  min-height: 100vh;
}

.step-indicator {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  color: #94a3b8;
}

.step-indicator.active {
  background: #eef2ff;
  color: #1d4ed8;
}

.step-indicator.completed {
  color: #22c55e;
}

.service-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
}

.service-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.service-card.selected {
  border-color: #2563eb;
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
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.icon-button {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px;
}

.day-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: #ffffff;
  text-align: left;
  transition: all 0.2s ease;
}

.day-card .weekday {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
}

.day-card .day-number {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
}

.day-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
}

.day-card.today {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.day-card.active {
  border-color: #2563eb;
  background: #e0e7ff;
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.2);
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
}

.slot-button {
  border-width: 1.5px;
  border-radius: 12px;
  padding: 10px 12px;
}
</style>
