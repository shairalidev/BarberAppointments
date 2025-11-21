<template>
  <div class="admin-panel">
    <div class="container-fluid py-4">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-3">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0"><i class="fas fa-cog me-2"></i>Admin Panel</h5>
            </div>
            <div class="list-group list-group-flush">
              <button @click="activeTab = 'calendar'" :class="['list-group-item', 'list-group-item-action', activeTab === 'calendar' ? 'active' : '']">
                <i class="fas fa-calendar me-2"></i>Calendar
              </button>
              <button @click="activeTab = 'services'" :class="['list-group-item', 'list-group-item-action', activeTab === 'services' ? 'active' : '']">
                <i class="fas fa-cut me-2"></i>Services
              </button>
              <button @click="activeTab = 'timeslots'" :class="['list-group-item', 'list-group-item-action', activeTab === 'timeslots' ? 'active' : '']">
                <i class="fas fa-clock me-2"></i>Time Slots
              </button>
              <button @click="activeTab = 'barbers'" :class="['list-group-item', 'list-group-item-action', activeTab === 'barbers' ? 'active' : '']">
                <i class="fas fa-user-tie me-2"></i>Barbers
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-9">
          <!-- Calendar Tab -->
          <div v-if="activeTab === 'calendar'" class="card">
            <div class="card-header">
              <h5><i class="fas fa-calendar me-2"></i>Appointment Calendar</h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <input v-model="selectedDate" type="date" class="form-control">
                </div>
                <div class="col-md-6">
                  <select v-model="selectedBarber" class="form-select">
                    <option value="">All Barbers</option>
                    <option v-for="barber in barbers" :key="barber._id" :value="barber._id">
                      {{ barber.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Customer</th>
                      <th>Services</th>
                      <th>Barber</th>
                      <th>Status</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="appointment in filteredAppointments" :key="appointment._id">
                      <td>{{ appointment.time }}</td>
                      <td>{{ appointment.customerName }}</td>
                      <td>
                        <span v-if="appointment.services?.length">
                          {{ appointment.services.map(service => service.name).join(', ') }}
                        </span>
                        <span v-else class="text-muted">No services</span>
                      </td>
                      <td>{{ appointment.barberId?.name }}</td>
                      <td>
                        <select v-model="appointment.status" @change="updateAppointmentStatus(appointment)" class="form-select form-select-sm">
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>${{ appointment.totalPrice }}</td>
                    </tr>
                  </tbody>
                </table>
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
  </div>
</template>

<script>
import axios from 'axios'

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
      newSlot: Array(7).fill().map(() => ({ startTime: '', endTime: '' }))
    }
  },
  computed: {
    filteredAppointments() {
      return this.appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date).toISOString().split('T')[0]
        const dateMatch = appointmentDate === this.selectedDate
        const barberId = appointment.barberId?._id || appointment.barberId
        const barberMatch = !this.selectedBarber || barberId === this.selectedBarber
        return dateMatch && barberMatch
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
        this.fetchTimeSlots()
      ])
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
    }
  }
}
</script>