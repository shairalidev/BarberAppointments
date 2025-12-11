<template>
  <div class="admin-panel bg-light min-vh-100">
    <!-- Admin Header -->
    <div class="admin-header bg-white shadow-sm py-3 mb-4">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col">
            <h2 class="mb-0 fw-bold text-primary">
              <i class="fas fa-cut me-2"></i>BarberPro Dashboard
            </h2>
            <p class="text-muted mb-0">Manage appointments & bookings</p>
          </div>
          <div class="col-auto">
            <div class="dropdown">
              <button class="btn btn-link text-decoration-none p-0 d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="admin-info me-3 text-start">
                  <small class="text-muted">Welcome back,</small>
                  <div class="fw-semibold text-dark">{{ adminUser?.username }}</div>
                </div>
                <div class="admin-avatar">
                  <i class="fas fa-user-shield"></i>
                </div>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg">
                <li><h6 class="dropdown-header">Admin Account</h6></li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button @click="logout" class="dropdown-item text-danger d-flex align-items-center">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="container-fluid mb-4">
      <div class="nav-tabs-wrapper">
        <ul class="nav nav-tabs nav-fill border-0">
          <li class="nav-item">
            <button 
              @click="activeTab = 'calendar'" 
              :class="['nav-link', 'fw-medium', activeTab === 'calendar' ? 'active' : '']"
            >
              <i class="fas fa-calendar-alt me-2"></i>Calendar & Booking
            </button>
          </li>
          <li class="nav-item">
            <button 
              @click="activeTab = 'requests'" 
              :class="['nav-link', 'fw-medium', 'position-relative', activeTab === 'requests' ? 'active' : '']"
            >
              <i class="fas fa-inbox me-2"></i>Booking Requests
              <span v-if="pendingAppointments.length" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{{ pendingAppointments.length }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button 
              @click="activeTab = 'services'" 
              :class="['nav-link', 'fw-medium', activeTab === 'services' ? 'active' : '']"
            >
              <i class="fas fa-cut me-2"></i>Services
            </button>
          </li>
          <li class="nav-item">
            <button 
              @click="activeTab = 'timeslots'" 
              :class="['nav-link', 'fw-medium', activeTab === 'timeslots' ? 'active' : '']"
            >
              <i class="fas fa-clock me-2"></i>Time Slots
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="container-fluid">

          <!-- Calendar & Booking Tab -->
          <div v-if="activeTab === 'calendar'" class="row g-4">
            <!-- Calendar Section -->
            <div class="col-lg-8">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3">
                  <div class="d-flex justify-content-between align-items-center flex-wrap">
                    <h5 class="mb-0"><i class="fas fa-calendar-alt me-2"></i>Calendar</h5>
                    <div class="d-flex gap-2">
                      <button @click="showBookingModal = true" class="btn btn-sm btn-success">
                        <i class="fas fa-plus me-1"></i>Book Appointment
                      </button>
                      <button @click="changeMonth(-1)" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-chevron-left"></i>
                      </button>
                      <button @click="goToToday" class="btn btn-sm btn-primary">Today</button>
                      <button @click="changeMonth(1)" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                  <h6 class="text-center mt-3 mb-0">{{ currentMonthYear }}</h6>
                </div>
                <div class="card-body p-0">
                  <div class="calendar-grid">
                    <div class="calendar-header" v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day">
                      {{ day }}
                    </div>
                    <div 
                      v-for="day in calendarDays" 
                      :key="day.date"
                      @click="selectCalendarDate(day)"
                      :class="['calendar-day', {
                        'other-month': !day.isCurrentMonth,
                        'today': day.isToday,
                        'selected': day.date === selectedCalendarDate,
                        'has-bookings': day.hasBookings
                      }]"
                    >
                      <span class="day-number">{{ day.dayNumber }}</span>
                      <span v-if="day.bookingCount" class="booking-badge">{{ day.bookingCount }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Appointments List -->
            <div class="col-lg-4">
              <div v-if="selectedCalendarDate" class="card border-0 shadow-sm">
                <div class="card-header bg-gradient-primary text-white">
                  <h6 class="mb-0"><i class="fas fa-calendar-day me-2"></i>{{ formatSelectedDate }}</h6>
                  <small class="opacity-75">{{ selectedDayAppointments.length }} appointment(s)</small>
                </div>
                <div class="card-body p-0">
                  <div v-if="selectedDayAppointments.length" class="appointments-list">
                    <div v-for="apt in selectedDayAppointments" :key="apt._id" class="appointment-card">
                      <div class="appointment-time">
                        <i class="fas fa-clock text-primary"></i>
                        <span class="fw-bold">{{ apt.time }}</span>
                      </div>
                      <div class="appointment-details">
                        <h6 class="customer-name mb-1">
                          <i class="fas fa-user me-2 text-muted"></i>{{ apt.customerName }}
                        </h6>
                        <p class="services mb-1">
                          <i class="fas fa-cut me-2 text-muted"></i>{{ apt.services?.map(s => s.name).join(', ') }}
                        </p>
                        <div class="appointment-meta">
                          <span class="price"><i class="fas fa-dollar-sign me-1"></i>${{ apt.totalPrice }}</span>
                          <span class="duration"><i class="fas fa-hourglass-half me-1"></i>{{ apt.totalDuration }}min</span>
                        </div>
                        <div v-if="apt.customerPhone" class="contact-info">
                          <small class="text-muted"><i class="fas fa-phone me-1"></i>{{ apt.customerPhone }}</small>
                        </div>
                      </div>
                      <div class="appointment-status">
                        <span :class="getStatusBadgeClass(apt.status)">{{ apt.status }}</span>
                        <div class="appointment-actions mt-2">
                          <button v-if="apt.status === 'pending'" @click="updateAppointmentStatus(apt, 'confirmed')" class="btn btn-sm btn-success">
                            <i class="fas fa-check"></i>
                          </button>
                          <button v-if="apt.status === 'confirmed'" @click="updateAppointmentStatus(apt, 'completed')" class="btn btn-sm btn-primary">
                            <i class="fas fa-check-double"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-state">
                    <i class="fas fa-calendar-times fa-2x text-muted mb-2"></i>
                    <p class="text-muted mb-0">No appointments scheduled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Booking Requests Tab -->
          <div v-if="activeTab === 'requests'" class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="fas fa-inbox me-2"></i>Booking Requests</h5>
            </div>
            <div class="card-body">
              <div v-if="pendingAppointments.length" class="list-group">
                <div v-for="apt in pendingAppointments" :key="apt._id" class="list-group-item mb-3 border rounded">
                  <div class="row">
                    <div class="col-md-8">
                      <h6 class="mb-2">{{ apt.customerName }}</h6>
                      <p class="mb-1 small"><i class="fas fa-calendar me-1"></i>{{ formatDate(apt.date) }} at {{ apt.time }}</p>
                      <p class="mb-1 small"><i class="fas fa-cut me-1"></i>{{ apt.services?.map(s => s.name).join(', ') }}</p>
                      <p class="mb-1 small"><i class="fas fa-user-tie me-1"></i>{{ apt.barberId?.name }}</p>
                      <p class="mb-1 small"><i class="fas fa-phone me-1"></i>{{ apt.customerPhone }}</p>
                      <p v-if="apt.customerEmail" class="mb-1 small"><i class="fas fa-envelope me-1"></i>{{ apt.customerEmail }}</p>
                      <p v-if="apt.notes" class="mb-0 small text-muted"><i class="fas fa-note-sticky me-1"></i>{{ apt.notes }}</p>
                    </div>
                    <div class="col-md-4 text-end">
                      <h5 class="text-primary mb-3">${{ apt.totalPrice }}</h5>
                      <div class="d-grid gap-2">
                        <button @click="openResponseModal(apt, 'confirmed')" class="btn btn-success btn-sm">
                          <i class="fas fa-check me-1"></i>Accept
                        </button>
                        <button @click="openResponseModal(apt, 'cancelled')" class="btn btn-danger btn-sm">
                          <i class="fas fa-times me-1"></i>Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-5">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <p class="text-muted">No pending booking requests</p>
              </div>
            </div>
          </div>

          <!-- Services Tab -->
          <div v-if="activeTab === 'services'" class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5><i class="fas fa-cut me-2"></i>Services Management</h5>
              <button @click="showServiceForm = true" class="btn btn-primary btn-sm">
                <i class="fas fa-plus me-1"></i>Add Service
              </button>
            </div>
            <div class="card-body">
              <!-- Service Form -->
              <div v-if="showServiceForm" class="card mb-4">
                <div class="card-body">
                  <form @submit.prevent="saveService">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label class="form-label">Service Name</label>
                          <input v-model="serviceForm.name" type="text" class="form-control" required>
                        </div>
                      </div>
                      <div class="col-md-3">
                        <div class="mb-3">
                          <label class="form-label">Duration (minutes)</label>
                          <input v-model="serviceForm.duration" type="number" class="form-control" required>
                        </div>
                      </div>
                      <div class="col-md-3">
                        <div class="mb-3">
                          <label class="form-label">Price ($)</label>
                          <input v-model="serviceForm.price" type="number" step="0.01" class="form-control" required>
                        </div>
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Description</label>
                      <textarea v-model="serviceForm.description" class="form-control" rows="2"></textarea>
                    </div>
                    <div class="d-flex gap-2">
                      <button type="submit" class="btn btn-success">Save Service</button>
                      <button @click="cancelServiceForm" type="button" class="btn btn-secondary">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- Services List -->
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="service in services" :key="service._id">
                      <td>{{ service.name }}</td>
                      <td>{{ service.duration }} min</td>
                      <td>${{ service.price }}</td>
                      <td>{{ service.description }}</td>
                      <td>
                        <button @click="editService(service)" class="btn btn-sm btn-outline-primary me-1">Edit</button>
                        <button @click="deleteService(service._id)" class="btn btn-sm btn-outline-danger">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Time Slots Tab -->
          <div v-if="activeTab === 'timeslots'" class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="fas fa-clock me-2"></i>Weekly Time Slots</h5>
              <p class="text-muted mb-0 small">Manage your working hours for each day</p>
            </div>
            <div class="card-body">
<div v-if="primaryBarber" class="alert alert-info d-flex justify-content-between align-items-center">
                <span><i class="fas fa-info-circle me-2"></i>Managing time slots for: <strong>{{ primaryBarber.name }}</strong></span>
                <small class="text-muted">Total slots: {{ timeSlots.length }}</small>
              </div>
              
              <div v-if="primaryBarber" class="row g-4">
                <div v-for="(day, index) in daysOfWeek" :key="index" class="col-lg-6 col-md-12">
                  <div class="card border">
                    <div class="card-header bg-light d-flex justify-content-between align-items-center">
                      <h6 class="mb-0">{{ day }}</h6>
                      <small class="text-muted">Day {{ index }}</small>
                    </div>
                    <div class="card-body">
                      <div class="mb-3">
                        <label class="form-label small">Add Time Slot</label>
                        <div class="row g-2">
                          <div class="col-4">
                            <input v-model="newSlot[index].startTime" type="time" class="form-control form-control-sm" placeholder="Start">
                          </div>
                          <div class="col-4">
                            <input v-model="newSlot[index].endTime" type="time" class="form-control form-control-sm" placeholder="End">
                          </div>
                          <div class="col-4">
                            <button @click="addTimeSlot(index)" class="btn btn-sm btn-success w-100">
                              <i class="fas fa-plus"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="time-slots-list">
                        <div v-for="slot in getTimeSlotsForDay(index)" :key="slot._id" class="d-flex justify-content-between align-items-center p-2 bg-light rounded mb-2">
                          <span class="fw-medium">{{ slot.startTime }} - {{ slot.endTime }}</span>
                          <button @click="deleteTimeSlot(slot._id)" class="btn btn-sm btn-outline-danger">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                        <div v-if="!getTimeSlotsForDay(index).length" class="text-muted text-center py-2">
                          <small>No time slots for {{ day }}</small>
                          <br><small class="text-info">Slots found: {{ timeSlots.filter(s => s.dayOfWeek === index).length }}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Debug Info -->
              <div v-if="primaryBarber" class="mt-4">
                <div class="card border-warning">
                  <div class="card-header bg-warning bg-opacity-10">
                    <h6 class="mb-0">Debug Info</h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Primary Barber ID:</strong> {{ primaryBarber._id }}</p>
                    <p><strong>Total Time Slots:</strong> {{ timeSlots.length }}</p>
                    <p><strong>Time Slots Data:</strong></p>
                    <pre class="small">{{ JSON.stringify(timeSlots, null, 2) }}</pre>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-5">
                <i class="fas fa-user-times fa-3x text-muted mb-3"></i>
                <p class="text-muted">No barber found. Please add a barber first.</p>
              </div>
            </div>
          </div>

    </div>

    <!-- Response Modal -->
    <div v-if="responseModal.show" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" @click.self="responseModal.show = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="responseModal.status === 'confirmed' ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger'"></i>
              {{ responseModal.status === 'confirmed' ? 'Accept Booking' : 'Reject Booking' }}
            </h5>
            <button @click="responseModal.show = false" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <p><strong>Customer:</strong> {{ responseModal.appointment?.customerName }}</p>
            <p><strong>Date:</strong> {{ formatDate(responseModal.appointment?.date) }} at {{ responseModal.appointment?.time }}</p>
            <div class="mb-3">
              <label class="form-label">Message to Customer</label>
              <textarea v-model="responseModal.message" class="form-control" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="responseModal.show = false" class="btn btn-secondary">Cancel</button>
            <button @click="respondToAppointment" :class="responseModal.status === 'confirmed' ? 'btn btn-success' : 'btn btn-danger'">
              {{ responseModal.status === 'confirmed' ? 'Accept & Notify' : 'Reject & Notify' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <div v-if="showBookingModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" @click.self="showBookingModal = false">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-gradient-primary text-white">
            <h5 class="modal-title"><i class="fas fa-plus me-2"></i>Book New Appointment</h5>
            <button @click="showBookingModal = false" class="btn-close btn-close-white"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="quickBookAppointment">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Date</label>
                  <input v-model="bookingForm.date" type="date" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Service</label>
                  <select v-model="bookingForm.serviceId" @change="updateBookingPrice" class="form-select" required>
                    <option value="">Select Service</option>
                    <option v-for="service in services" :key="service._id" :value="service._id">
                      {{ service.name }} - ${{ service.price }}
                    </option>
                  </select>
                </div>
                <div class="col-12" v-if="availableSlots.length">
                  <label class="form-label">Available Times</label>
                  <div class="time-slots-grid">
                    <button 
                      v-for="slot in availableSlots" 
                      :key="slot"
                      type="button"
                      @click="bookingForm.time = slot"
                      :class="['btn', 'btn-sm', bookingForm.time === slot ? 'btn-primary' : 'btn-outline-primary']"
                    >
                      {{ slot }}
                    </button>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Customer Name</label>
                  <input v-model="bookingForm.customerName" type="text" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Phone</label>
                  <input v-model="bookingForm.customerPhone" type="tel" class="form-control" required>
                </div>
                <div class="col-12">
                  <label class="form-label">Email (Optional)</label>
                  <input v-model="bookingForm.customerEmail" type="email" class="form-control">
                </div>
                <div class="col-12" v-if="bookingForm.totalPrice">
                  <div class="alert alert-success">
                    <strong><i class="fas fa-dollar-sign me-1"></i>Total: ${{ bookingForm.totalPrice }}</strong>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button @click="showBookingModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="quickBookAppointment" class="btn btn-success" :disabled="!bookingForm.time">
              <i class="fas fa-check me-2"></i>Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { logout as authLogout } from '../utils/auth'

export default {
  name: 'Admin',
  data() {
    return {
      activeTab: 'calendar',
      appointments: [],
      barbers: [],
      services: [],
      timeSlots: [],
      selectedDate: new Date().toISOString().split('T')[0],
      selectedBarberForSlots: '',
      showServiceForm: false,
      serviceForm: {
        name: '',
        duration: '',
        price: '',
        description: ''
      },
      daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      newSlot: Array(7).fill().map(() => ({ startTime: '', endTime: '' })),
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      selectedCalendarDate: null,
      responseModal: {
        show: false,
        appointment: null,
        status: '',
        message: ''
      },
      bookingForm: {
        date: new Date().toISOString().split('T')[0],
        serviceId: '',
        time: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        totalPrice: 0
      },
availableSlots: [],
      primaryBarber: null,
      showBookingModal: false
    }
  },
  computed: {
    adminUser() {
      const user = localStorage.getItem('adminUser')
      return user ? JSON.parse(user) : null
    },
    pendingAppointments() {
      return this.appointments.filter(appointment => appointment.status === 'pending')
    },
    currentMonthYear() {
      const date = new Date(this.currentYear, this.currentMonth)
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    },
    calendarDays() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1)
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0)
      const prevLastDay = new Date(this.currentYear, this.currentMonth, 0)
      
      const days = []
      const startDay = firstDay.getDay()
      
      for (let i = startDay - 1; i >= 0; i--) {
        const date = new Date(this.currentYear, this.currentMonth - 1, prevLastDay.getDate() - i)
        days.push(this.createDayObject(date, false))
      }
      
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(this.currentYear, this.currentMonth, i)
        days.push(this.createDayObject(date, true))
      }
      
      const remainingDays = 42 - days.length
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(this.currentYear, this.currentMonth + 1, i)
        days.push(this.createDayObject(date, false))
      }
      
      return days
    },
    selectedDayAppointments() {
      if (!this.selectedCalendarDate) return []
      return this.appointments.filter(apt => {
        const aptDate = new Date(apt.date).toISOString().split('T')[0]
        return aptDate === this.selectedCalendarDate
      })
    },
    formatSelectedDate() {
      if (!this.selectedCalendarDate) return ''
      return new Date(this.selectedCalendarDate).toLocaleDateString('en-US', { 
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
      })
    }
  },
  async mounted() {
    await this.fetchData()
    this.watchBookingFormChanges()
  },
  watch: {
    'bookingForm.date'() {
      this.fetchAvailableSlots()
    },
    'bookingForm.serviceId'() {
      this.fetchAvailableSlots()
    }
  },
  methods: {
    async fetchData() {
      await Promise.all([
        this.fetchAppointments(),
        this.fetchBarbers(),
        this.fetchServices(),
        this.fetchTimeSlots()
      ])
      this.selectedCalendarDate = new Date().toISOString().split('T')[0]
      this.setPrimaryBarber()
    },
    setPrimaryBarber() {
      if (this.barbers.length > 0) {
        this.primaryBarber = this.barbers.find(b => b.available) || this.barbers[0]
        this.selectedBarberForSlots = this.primaryBarber._id
      }
    },
    async fetchAppointments() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/appointments`)
        this.appointments = response.data
      } catch (error) {
        console.error('Error fetching appointments:', error)
      }
    },
    async fetchBarbers() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/barbers`)
        this.barbers = response.data
      } catch (error) {
        console.error('Error fetching barbers:', error)
      }
    },
    async fetchServices() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/services`)
        this.services = response.data
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    },
    async fetchTimeSlots() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/timeslots`)
        this.timeSlots = response.data
      } catch (error) {
        console.error('Error fetching time slots:', error)
      }
    },
async updateAppointmentStatus(appointment, newStatus) {
      try {
        await axios.put(`${process.env.VUE_APP_API_URL}/appointments/${appointment._id}`, {
          status: newStatus
        })
        await this.fetchAppointments()
      } catch (error) {
        console.error('Error updating appointment:', error)
      }
    },
    async saveService() {
      try {
        if (this.serviceForm._id) {
          await axios.put(`${process.env.VUE_APP_API_URL}/services/${this.serviceForm._id}`, this.serviceForm)
        } else {
          await axios.post(`${process.env.VUE_APP_API_URL}/services`, this.serviceForm)
        }
        await this.fetchServices()
        this.cancelServiceForm()
      } catch (error) {
        console.error('Error saving service:', error)
      }
    },
    editService(service) {
      this.serviceForm = { ...service }
      this.showServiceForm = true
    },
    async deleteService(id) {
      if (confirm('Are you sure you want to delete this service?')) {
        try {
          await axios.delete(`${process.env.VUE_APP_API_URL}/services/${id}`)
          await this.fetchServices()
        } catch (error) {
          console.error('Error deleting service:', error)
        }
      }
    },
    cancelServiceForm() {
      this.showServiceForm = false
      this.serviceForm = { name: '', duration: '', price: '', description: '' }
    },
async quickBookAppointment() {
      try {
        if (!this.primaryBarber) {
          alert('No barber available')
          return
        }
        
        const appointmentData = {
          customerName: this.bookingForm.customerName,
          customerPhone: this.bookingForm.customerPhone,
          customerEmail: this.bookingForm.customerEmail,
          barberId: this.primaryBarber._id,
          services: [this.bookingForm.serviceId],
          date: this.bookingForm.date,
          time: this.bookingForm.time,
          status: 'confirmed'
        }
        
        await axios.post(`${process.env.VUE_APP_API_URL}/appointments`, appointmentData)
        await this.fetchAppointments()
        this.resetBookingForm()
        this.showBookingModal = false
        alert('Appointment booked successfully!')
      } catch (error) {
        console.error('Error booking appointment:', error)
        alert('Error booking appointment: ' + (error.response?.data?.message || error.message))
      }
    },
    resetBookingForm() {
      this.bookingForm = {
        date: new Date().toISOString().split('T')[0],
        serviceId: '',
        time: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        totalPrice: 0
      }
      this.availableSlots = []
    },
    updateBookingPrice() {
      const service = this.services.find(s => s._id === this.bookingForm.serviceId)
      this.bookingForm.totalPrice = service ? service.price : 0
    },
    async fetchAvailableSlots() {
      if (!this.bookingForm.date || !this.bookingForm.serviceId || !this.primaryBarber) {
        this.availableSlots = []
        return
      }
      
      try {
        const service = this.services.find(s => s._id === this.bookingForm.serviceId)
        if (!service) return
        
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/appointments/availability`, {
          params: {
            barberId: this.primaryBarber._id,
            date: this.bookingForm.date,
            duration: service.duration
          }
        })
        
        this.availableSlots = response.data.availableTimes || []
      } catch (error) {
        console.error('Error fetching available slots:', error)
        this.availableSlots = []
      }
    },
    watchBookingFormChanges() {
      this.$watch('bookingForm.serviceId', () => {
        this.updateBookingPrice()
        this.fetchAvailableSlots()
      })
    },
async addTimeSlot(dayIndex) {
      if (!this.primaryBarber || !this.newSlot[dayIndex].startTime || !this.newSlot[dayIndex].endTime) {
        alert('Please fill in both start and end times')
        return
      }
      try {
        await axios.post(`${process.env.VUE_APP_API_URL}/timeslots`, {
          barberId: this.primaryBarber._id,
          dayOfWeek: dayIndex,
          startTime: this.newSlot[dayIndex].startTime,
          endTime: this.newSlot[dayIndex].endTime
        })
        await this.fetchTimeSlots()
        this.newSlot[dayIndex] = { startTime: '', endTime: '' }
        alert('Time slot added successfully!')
      } catch (error) {
        console.error('Error adding time slot:', error)
        alert('Error adding time slot: ' + (error.response?.data?.message || error.message))
      }
    },
    async deleteTimeSlot(id) {
      if (!confirm('Are you sure you want to delete this time slot?')) return
      try {
        await axios.delete(`${process.env.VUE_APP_API_URL}/timeslots/${id}`)
        await this.fetchTimeSlots()
        alert('Time slot deleted successfully!')
      } catch (error) {
        console.error('Error deleting time slot:', error)
        alert('Error deleting time slot: ' + (error.response?.data?.message || error.message))
      }
    },
getTimeSlotsForDay(dayIndex) {
      if (!this.primaryBarber) return []
      return this.timeSlots.filter(slot => {
        const slotBarberId = slot.barberId?._id || slot.barberId
        return slot.dayOfWeek === dayIndex && slotBarberId === this.primaryBarber._id
      })
    },
    getStatusBadgeClass(status) {
      const classes = {
        pending: 'badge bg-warning',
        confirmed: 'badge bg-primary',
        completed: 'badge bg-success',
        cancelled: 'badge bg-danger'
      }
      return classes[status] || 'badge bg-secondary'
    },
    logout() {
      authLogout()
    },
    createDayObject(date, isCurrentMonth) {
      const dateStr = date.toISOString().split('T')[0]
      const bookings = this.appointments.filter(apt => {
        const aptDate = new Date(apt.date).toISOString().split('T')[0]
        return aptDate === dateStr
      })
      
      return {
        date: dateStr,
        dayNumber: date.getDate(),
        isCurrentMonth,
        isToday: this.isToday(date),
        hasBookings: bookings.length > 0,
        bookingCount: bookings.length
      }
    },
    isToday(date) {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    },
    changeMonth(direction) {
      this.currentMonth += direction
      if (this.currentMonth > 11) {
        this.currentMonth = 0
        this.currentYear++
      } else if (this.currentMonth < 0) {
        this.currentMonth = 11
        this.currentYear--
      }
    },
    goToToday() {
      const today = new Date()
      this.currentMonth = today.getMonth()
      this.currentYear = today.getFullYear()
      this.selectedCalendarDate = today.toISOString().split('T')[0]
    },
    selectCalendarDate(day) {
      if (day.isCurrentMonth) {
        this.selectedCalendarDate = day.date
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      })
    },
    openResponseModal(appointment, status) {
      this.responseModal = {
        show: true,
        appointment,
        status,
        message: status === 'confirmed' 
          ? 'Your appointment has been confirmed. We look forward to seeing you!' 
          : 'Unfortunately, we cannot accommodate your appointment at this time.'
      }
    },
    async respondToAppointment() {
      try {
        await axios.put(`${process.env.VUE_APP_API_URL}/appointments/${this.responseModal.appointment._id}`, {
          status: this.responseModal.status,
          responseMessage: this.responseModal.message
        })
        await this.fetchAppointments()
        this.responseModal.show = false
        alert(`Appointment ${this.responseModal.status}. Email will be sent to customer.`)
      } catch (error) {
        console.error('Error responding to appointment:', error)
        alert('Error updating appointment')
      }
    },

  }
}
</script>

<style scoped>
.admin-panel {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.admin-header {
  border-bottom: 1px solid #e2e8f0;
}

.admin-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
}

.list-group-item {
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.list-group-item:hover {
  background-color: rgba(59, 130, 246, 0.05);
  border-left-color: #3b82f6;
}

.list-group-item.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%);
  border-left-color: #3b82f6;
  color: #3b82f6;
  font-weight: 600;
}

.stat-card {
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 16px;
  opacity: 0.8;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0;
}

.card {
  border-radius: 12px;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.table-hover tbody tr:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.form-control, .form-select {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.badge {
  font-size: 0.75rem;
  padding: 6px 12px;
  border-radius: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.dashboard-content {
  animation: fadeIn 0.5s ease;
}

.card-header {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(10px);
}

.dropdown-menu {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  min-width: 200px;
}

.dropdown-item {
  padding: 10px 16px;
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.2s;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

/* Navigation Tabs */
.nav-tabs-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
}

.nav-tabs .nav-link {
  border: none;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.2s ease;
  padding: 0.75rem 1rem;
}

.nav-tabs .nav-link:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.nav-tabs .nav-link.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.dropdown-header {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
}

.btn-link:hover .admin-avatar {
  transform: scale(1.05);
}

.admin-avatar {
  transition: transform 0.2s ease;
}

/* Calendar Styles */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e5e7eb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-header {
  background: #f3f4f6;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
}

.calendar-day {
  background: white;
  padding: 8px;
  min-height: 70px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.calendar-day:hover {
  background: #f9fafb;
  transform: scale(1.02);
}

.calendar-day.other-month {
  background: #fafafa;
  color: #9ca3af;
}

.calendar-day.today {
  background: #eff6ff;
  border: 2px solid #3b82f6;
}

.calendar-day.selected {
  background: #dbeafe;
  border: 2px solid #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.calendar-day.has-bookings {
  background: #d1fae5;
}

.calendar-day.has-bookings.selected {
  background: #a7f3d0;
  border: 2px solid #10b981;
}

.day-number {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.booking-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
}

/* Time Slots Grid */
.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.time-slots-grid .btn {
  font-size: 0.8rem;
  padding: 6px 8px;
}

/* Appointment Cards */
.appointments-list {
  max-height: 400px;
  overflow-y: auto;
}

.appointment-card {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.appointment-card:hover {
  background-color: #f8fafc;
}

.appointment-card:last-child {
  border-bottom: none;
}

.appointment-time {
  min-width: 80px;
  text-align: center;
  margin-right: 1rem;
}

.appointment-time i {
  display: block;
  margin-bottom: 0.25rem;
}

.appointment-details {
  flex: 1;
}

.customer-name {
  color: #1f2937;
  font-size: 1rem;
}

.services {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.appointment-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.price {
  color: #059669;
  font-weight: 600;
  font-size: 0.875rem;
}

.duration {
  color: #6b7280;
  font-size: 0.875rem;
}

.contact-info {
  font-size: 0.75rem;
}

.appointment-status {
  text-align: center;
  min-width: 100px;
}

.appointment-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .appointment-card {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .appointment-time {
    min-width: auto;
    text-align: left;
    margin-right: 0;
  }
  
  .appointment-time i {
    display: inline;
    margin-bottom: 0;
    margin-right: 0.5rem;
  }
  
  .appointment-status {
    min-width: auto;
    text-align: left;
  }
  
  .appointment-actions {
    justify-content: flex-start;
  }
  .calendar-day {
    min-height: 50px;
    padding: 4px;
  }
  
  .calendar-header {
    padding: 6px 4px;
    font-size: 0.7rem;
  }
  
  .day-number {
    font-size: 0.8rem;
  }
  
  .booking-badge {
    width: 16px;
    height: 16px;
    font-size: 0.6rem;
    top: 4px;
    right: 4px;
  }
  
  .time-slots-grid {
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: 6px;
  }
  
  .admin-panel .col-lg-3 {
    order: 2;
  }
  
  .admin-panel .col-lg-9 {
    order: 1;
  }
}

@media (max-width: 576px) {
  .calendar-day {
    min-height: 40px;
    padding: 2px;
  }
  
  .calendar-header {
    padding: 4px 2px;
    font-size: 0.65rem;
  }
  
  .day-number {
    font-size: 0.7rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>