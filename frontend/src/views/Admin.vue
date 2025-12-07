<template>
  <div class="admin-panel bg-light min-vh-100">
    <!-- Admin Header -->
    <div class="admin-header bg-white shadow-sm py-3 mb-4">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col">
            <h2 class="mb-0 fw-bold text-primary">
              <i class="fas fa-shield-alt me-2"></i>Admin Dashboard
            </h2>
            <p class="text-muted mb-0">Manage your barber shop operations</p>
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

    <div class="container-fluid">
      <div class="row">
        <!-- Enhanced Sidebar -->
        <div class="col-md-3 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-gradient-primary text-white border-0">
              <h5 class="mb-0 fw-semibold">
                <i class="fas fa-cog me-2"></i>Control Panel
              </h5>
            </div>
            <div class="list-group list-group-flush">
              <button 
                @click="activeTab = 'dashboard'" 
                :class="['list-group-item', 'list-group-item-action', 'border-0', 'py-3', activeTab === 'dashboard' ? 'active' : '']"
              >
                <i class="fas fa-chart-line me-3 text-primary"></i>
                <span class="fw-medium">Dashboard</span>
              </button>
              <button 
                @click="activeTab = 'calendar'" 
                :class="['list-group-item', 'list-group-item-action', 'border-0', 'py-3', activeTab === 'calendar' ? 'active' : '']"
              >
                <i class="fas fa-calendar-alt me-3 text-primary"></i>
                <span class="fw-medium">Calendar View</span>
              </button>
              <button 
                @click="activeTab = 'requests'" 
                :class="['list-group-item', 'list-group-item-action', 'border-0', 'py-3', activeTab === 'requests' ? 'active' : '']"
              >
                <i class="fas fa-inbox me-3 text-primary"></i>
                <span class="fw-medium">Booking Requests</span>
                <span v-if="pendingAppointments.length" class="badge bg-danger ms-2">{{ pendingAppointments.length }}</span>
              </button>
              <button 
                @click="activeTab = 'services'" 
                :class="['list-group-item', 'list-group-item-action', 'border-0', 'py-3', activeTab === 'services' ? 'active' : '']"
              >
                <i class="fas fa-cut me-3 text-primary"></i>
                <span class="fw-medium">Services</span>
              </button>
              <button 
                @click="activeTab = 'barbers'" 
                :class="['list-group-item', 'list-group-item-action', 'border-0', 'py-3', activeTab === 'barbers' ? 'active' : '']"
              >
                <i class="fas fa-user-tie me-3 text-primary"></i>
                <span class="fw-medium">Barbers</span>
              </button>
              <button 
                @click="activeTab = 'timeslots'" 
                :class="['list-group-item', 'list-group-item-action', 'border-0', 'py-3', activeTab === 'timeslots' ? 'active' : '']"
              >
                <i class="fas fa-clock me-3 text-primary"></i>
                <span class="fw-medium">Manage Slots</span>
              </button>
              <button 
                @click="activeTab = 'restrictions'" 
                :class="['list-group-item', 'list-group-item-action', 'border-0', 'py-3', activeTab === 'restrictions' ? 'active' : '']"
              >
                <i class="fas fa-ban me-3 text-primary"></i>
                <span class="fw-medium">Date Restrictions</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-9">
          <!-- Dashboard Tab -->
          <div v-if="activeTab === 'dashboard'" class="dashboard-content">
            <div class="row g-4 mb-4">
              <div class="col-md-3">
                <div class="stat-card bg-primary text-white">
                  <div class="stat-icon">
                    <i class="fas fa-calendar-check"></i>
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-number">{{ todayAppointments.length }}</h3>
                    <p class="stat-label">Today's Appointments</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stat-card bg-success text-white">
                  <div class="stat-icon">
                    <i class="fas fa-user-tie"></i>
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-number">{{ availableBarbers.length }}</h3>
                    <p class="stat-label">Available Barbers</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stat-card bg-info text-white">
                  <div class="stat-icon">
                    <i class="fas fa-cut"></i>
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-number">{{ services.length }}</h3>
                    <p class="stat-label">Active Services</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stat-card bg-warning text-white">
                  <div class="stat-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-number">{{ pendingAppointments.length }}</h3>
                    <p class="stat-label">Pending Bookings</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="row g-4">
              <div class="col-md-8">
                <div class="card border-0 shadow-sm">
                  <div class="card-header bg-white border-0 py-3">
                    <h5 class="mb-0 fw-semibold">Recent Appointments</h5>
                  </div>
                  <div class="card-body">
                    <div class="table-responsive">
                      <table class="table table-hover">
                        <thead class="table-light">
                          <tr>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="appointment in recentAppointments" :key="appointment._id">
                            <td class="fw-medium">{{ appointment.customerName }}</td>
                            <td>{{ appointment.services?.[0]?.name || 'N/A' }}</td>
                            <td>{{ appointment.time }}</td>
                            <td>
                              <span :class="getStatusBadgeClass(appointment.status)">{{ appointment.status }}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 shadow-sm">
                  <div class="card-header bg-white border-0 py-3">
                    <h5 class="mb-0 fw-semibold">Quick Actions</h5>
                  </div>
                  <div class="card-body">
                    <div class="d-grid gap-2">
                      <button @click="activeTab = 'services'; showServiceForm = true" class="btn btn-outline-primary">
                        <i class="fas fa-plus me-2"></i>Add Service
                      </button>
                      <button @click="activeTab = 'barbers'; showBarberForm = true" class="btn btn-outline-success">
                        <i class="fas fa-user-plus me-2"></i>Add Barber
                      </button>
                      <button @click="activeTab = 'calendar'" class="btn btn-outline-info">
                        <i class="fas fa-calendar me-2"></i>View Calendar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Calendar Tab -->
          <div v-if="activeTab === 'calendar'" class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="fas fa-calendar-alt me-2"></i>Calendar View</h5>
                <div class="d-flex gap-2">
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
              
              <!-- Selected Day Appointments -->
              <div v-if="selectedCalendarDate" class="p-4 border-top">
                <h6 class="mb-3">Appointments for {{ formatSelectedDate }}</h6>
                <div v-if="selectedDayAppointments.length" class="list-group">
                  <div v-for="apt in selectedDayAppointments" :key="apt._id" class="list-group-item">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="mb-1">{{ apt.time }} - {{ apt.customerName }}</h6>
                        <p class="mb-1 small text-muted">{{ apt.services?.map(s => s.name).join(', ') }}</p>
                        <p class="mb-0 small"><i class="fas fa-user-tie me-1"></i>{{ apt.barberId?.name }}</p>
                      </div>
                      <span :class="getStatusBadgeClass(apt.status)">{{ apt.status }}</span>
                    </div>
                  </div>
                </div>
                <p v-else class="text-muted mb-0">No appointments for this day</p>
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
          <div v-if="activeTab === 'timeslots'" class="card">
            <div class="card-header">
              <h5><i class="fas fa-clock me-2"></i>Weekly Time Slots</h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <select v-model="selectedBarberForSlots" class="form-select">
                    <option value="">Select Barber</option>
                    <option v-for="barber in barbers" :key="barber._id" :value="barber._id">
                      {{ barber.name }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div v-if="selectedBarberForSlots" class="row">
                <div v-for="(day, index) in daysOfWeek" :key="index" class="col-md-6 mb-4">
                  <div class="card">
                    <div class="card-header">
                      <h6>{{ day }}</h6>
                    </div>
                    <div class="card-body">
                      <div class="mb-2">
                        <div class="row">
                          <div class="col-5">
                            <input v-model="newSlot[index].startTime" type="time" class="form-control form-control-sm">
                          </div>
                          <div class="col-5">
                            <input v-model="newSlot[index].endTime" type="time" class="form-control form-control-sm">
                          </div>
                          <div class="col-2">
                            <button @click="addTimeSlot(index)" class="btn btn-sm btn-primary">+</button>
                          </div>
                        </div>
                      </div>
                      <div v-for="slot in getTimeSlotsForDay(index)" :key="slot._id" class="d-flex justify-content-between align-items-center mb-1">
                        <span>{{ slot.startTime }} - {{ slot.endTime }}</span>
                        <button @click="deleteTimeSlot(slot._id)" class="btn btn-sm btn-outline-danger">×</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Date Restrictions Tab -->
          <div v-if="activeTab === 'restrictions'" class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="fas fa-ban me-2"></i>Date Restrictions</h5>
            </div>
            <div class="card-body">
              <div class="card mb-4">
                <div class="card-body">
                  <h6 class="mb-3">Block Specific Date</h6>
                  <div class="row g-3">
                    <div class="col-md-4">
                      <input v-model="restrictionForm.date" type="date" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                      <input v-model="restrictionForm.reason" type="text" class="form-control" placeholder="Reason (e.g., Holiday, Closed)" required>
                    </div>
                    <div class="col-md-2">
                      <button @click="addRestriction" class="btn btn-danger w-100">
                        <i class="fas fa-ban me-1"></i>Block
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <h6 class="mb-3">Blocked Dates</h6>
              <div v-if="restrictions.length" class="list-group">
                <div v-for="restriction in restrictions" :key="restriction._id" class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ formatDate(restriction.date) }}</strong>
                    <span class="text-muted ms-2">- {{ restriction.reason }}</span>
                  </div>
                  <button @click="removeRestriction(restriction._id)" class="btn btn-sm btn-outline-danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <p v-else class="text-muted">No date restrictions set</p>
            </div>
          </div>

          <!-- Barbers Tab -->
          <div v-if="activeTab === 'barbers'" class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5><i class="fas fa-user-tie me-2"></i>Barbers Management</h5>
              <button @click="showBarberForm = true" class="btn btn-primary btn-sm">
                <i class="fas fa-plus me-1"></i>Add Barber
              </button>
            </div>
            <div class="card-body">
              <!-- Barber Form -->
              <div v-if="showBarberForm" class="card mb-4">
                <div class="card-body">
                  <form @submit.prevent="saveBarber">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label class="form-label">Barber Name</label>
                          <input v-model="barberForm.name" type="text" class="form-control" required>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label class="form-label">Specialties (comma separated)</label>
                          <input v-model="barberSpecialties" type="text" class="form-control" placeholder="Haircut, Beard Trim">
                        </div>
                      </div>
                    </div>
                    <div class="d-flex gap-2">
                      <button type="submit" class="btn btn-success">Save Barber</button>
                      <button @click="cancelBarberForm" type="button" class="btn btn-secondary">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- Barbers List -->
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Specialties</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="barber in barbers" :key="barber._id">
                      <td>{{ barber.name }}</td>
                      <td>{{ barber.specialties?.join(', ') }}</td>
                      <td>
                        <span :class="barber.available ? 'badge bg-success' : 'badge bg-danger'">
                          {{ barber.available ? 'Available' : 'Unavailable' }}
                        </span>
                      </td>
                      <td>
                        <button @click="toggleBarberAvailability(barber)" class="btn btn-sm btn-outline-primary me-1">
                          {{ barber.available ? 'Disable' : 'Enable' }}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
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
      selectedBarber: '',
      selectedBarberForSlots: '',
      showServiceForm: false,
      showBarberForm: false,
      serviceForm: {
        name: '',
        duration: '',
        price: '',
        description: ''
      },
      barberForm: {
        name: '',
        available: true
      },
      barberSpecialties: '',
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
      restrictions: [],
      restrictionForm: {
        date: '',
        reason: ''
      }
    }
  },
  computed: {
    adminUser() {
      const user = localStorage.getItem('adminUser')
      return user ? JSON.parse(user) : null
    },
    filteredAppointments() {
      return this.appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date).toISOString().split('T')[0]
        const dateMatch = appointmentDate === this.selectedDate
        const barberId = appointment.barberId?._id || appointment.barberId
        const barberMatch = !this.selectedBarber || barberId === this.selectedBarber
        return dateMatch && barberMatch
      })
    },
    todayAppointments() {
      const today = new Date().toISOString().split('T')[0]
      return this.appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date).toISOString().split('T')[0]
        return appointmentDate === today
      })
    },
    availableBarbers() {
      return this.barbers.filter(barber => barber.available)
    },
    pendingAppointments() {
      return this.appointments.filter(appointment => appointment.status === 'pending')
    },
    recentAppointments() {
      return this.appointments.slice(0, 5)
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
  },
  methods: {
    async fetchData() {
      await Promise.all([
        this.fetchAppointments(),
        this.fetchBarbers(),
        this.fetchServices(),
        this.fetchTimeSlots(),
        this.fetchRestrictions()
      ])
      this.selectedCalendarDate = new Date().toISOString().split('T')[0]
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
    async updateAppointmentStatus(appointment) {
      try {
        await axios.put(`${process.env.VUE_APP_API_URL}/appointments/${appointment._id}`, {
          status: appointment.status
        })
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
    async saveBarber() {
      try {
        const barberData = {
          ...this.barberForm,
          specialties: this.barberSpecialties.split(',').map(s => s.trim()).filter(s => s)
        }
        await axios.post(`${process.env.VUE_APP_API_URL}/barbers`, barberData)
        await this.fetchBarbers()
        this.cancelBarberForm()
      } catch (error) {
        console.error('Error saving barber:', error)
      }
    },
    cancelBarberForm() {
      this.showBarberForm = false
      this.barberForm = { name: '', available: true }
      this.barberSpecialties = ''
    },
    async toggleBarberAvailability(barber) {
      try {
        await axios.put(`${process.env.VUE_APP_API_URL}/barbers/${barber._id}`, {
          available: !barber.available
        })
        await this.fetchBarbers()
      } catch (error) {
        console.error('Error updating barber:', error)
      }
    },
    async addTimeSlot(dayIndex) {
      if (!this.selectedBarberForSlots || !this.newSlot[dayIndex].startTime || !this.newSlot[dayIndex].endTime) {
        return
      }
      try {
        await axios.post(`${process.env.VUE_APP_API_URL}/timeslots`, {
          barberId: this.selectedBarberForSlots,
          dayOfWeek: dayIndex,
          startTime: this.newSlot[dayIndex].startTime,
          endTime: this.newSlot[dayIndex].endTime
        })
        await this.fetchTimeSlots()
        this.newSlot[dayIndex] = { startTime: '', endTime: '' }
      } catch (error) {
        console.error('Error adding time slot:', error)
      }
    },
    async deleteTimeSlot(id) {
      try {
        await axios.delete(`${process.env.VUE_APP_API_URL}/timeslots/${id}`)
        await this.fetchTimeSlots()
      } catch (error) {
        console.error('Error deleting time slot:', error)
      }
    },
    getTimeSlotsForDay(dayIndex) {
      return this.timeSlots.filter(slot => {
        const slotBarberId = slot.barberId?._id || slot.barberId
        return slot.dayOfWeek === dayIndex && slotBarberId === this.selectedBarberForSlots
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
    async addRestriction() {
      if (!this.restrictionForm.date || !this.restrictionForm.reason) return
      
      try {
        await axios.post(`${process.env.VUE_APP_API_URL}/restrictions`, this.restrictionForm)
        await this.fetchRestrictions()
        this.restrictionForm = { date: '', reason: '' }
      } catch (error) {
        console.error('Error adding restriction:', error)
      }
    },
    async removeRestriction(id) {
      try {
        await axios.delete(`${process.env.VUE_APP_API_URL}/restrictions/${id}`)
        await this.fetchRestrictions()
      } catch (error) {
        console.error('Error removing restriction:', error)
      }
    },
    async fetchRestrictions() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/restrictions`)
        this.restrictions = response.data
      } catch (error) {
        console.error('Error fetching restrictions:', error)
        this.restrictions = []
      }
    }
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
}

.calendar-header {
  background: #f3f4f6;
  padding: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
}

.calendar-day {
  background: white;
  padding: 12px;
  min-height: 80px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.calendar-day:hover {
  background: #f9fafb;
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
  font-size: 1rem;
}

.booking-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .calendar-day {
    min-height: 60px;
    padding: 8px;
  }
  
  .calendar-header {
    padding: 8px;
    font-size: 0.75rem;
  }
}
</style>