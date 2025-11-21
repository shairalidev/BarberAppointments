<template>
  <div class="appointments">
    <div class="container py-5">
    <h2>Appointments</h2>
    
    <!-- Appointment Form -->
    <div class="card mb-4">
      <div class="card-header">
        <h5>Book New Appointment</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="createAppointment">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Customer Name</label>
                <input v-model="form.customerName" type="text" class="form-control" required>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Phone</label>
                <input v-model="form.customerPhone" type="tel" class="form-control" required>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Barber</label>
                <select v-model="form.barberId" class="form-select" required>
                  <option value="">Select Barber</option>
                  <option v-for="barber in barbers" :key="barber._id" :value="barber._id">
                    {{ barber.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Service</label>
                <select v-model="form.serviceId" @change="updatePrice" class="form-select" required>
                  <option value="">Select Service</option>
                  <option v-for="service in services" :key="service._id" :value="service._id">
                    {{ service.name }} - ${{ service.price }}
                  </option>
                </select>
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Date</label>
                <input v-model="form.date" type="date" class="form-control" required>
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Time</label>
            <select v-model="form.time" class="form-select" required>
              <option value="">Select Time</option>
              <option v-for="time in timeSlots" :key="time" :value="time">{{ time }}</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Book Appointment</button>
        </form>
      </div>
    </div>

    <!-- Appointments List -->
    <div class="card">
      <div class="card-header">
        <h5>All Appointments</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Barber</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="appointment in appointments" :key="appointment._id">
                <td>{{ appointment.customerName }}</td>
                <td>{{ appointment.customerPhone }}</td>
                <td>{{ appointment.barberId?.name }}</td>
                <td>{{ appointment.serviceId?.name }}</td>
                <td>{{ formatDate(appointment.date) }}</td>
                <td>{{ appointment.time }}</td>
                <td>
                  <span :class="getStatusClass(appointment.status)">
                    {{ appointment.status }}
                  </span>
                </td>
                <td>
                  <button @click="deleteAppointment(appointment._id)" class="btn btn-sm btn-danger">
                    Delete
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
</template>

<script>
import axios from 'axios'

export default {
  name: 'Appointments',
  data() {
    return {
      appointments: [],
      barbers: [],
      services: [],
      form: {
        customerName: '',
        customerPhone: '',
        barberId: '',
        serviceId: '',
        date: '',
        time: '',
        totalPrice: 0
      },
      timeSlots: [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
      ]
    }
  },
  async mounted() {
    await this.fetchAppointments()
    await this.fetchBarbers()
    await this.fetchServices()
  },
  methods: {
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
    async createAppointment() {
      try {
        await axios.post(`${process.env.VUE_APP_API_URL}/appointments`, this.form)
        this.resetForm()
        await this.fetchAppointments()
        alert('Appointment booked successfully!')
      } catch (error) {
        console.error('Error creating appointment:', error)
        alert('Error booking appointment')
      }
    },
    async deleteAppointment(id) {
      if (confirm('Are you sure you want to delete this appointment?')) {
        try {
          await axios.delete(`${process.env.VUE_APP_API_URL}/appointments/${id}`)
          await this.fetchAppointments()
        } catch (error) {
          console.error('Error deleting appointment:', error)
        }
      }
    },
    resetForm() {
      this.form = {
        customerName: '',
        customerPhone: '',
        barberId: '',
        serviceId: '',
        date: '',
        time: '',
        totalPrice: 0
      }
    },
    updatePrice() {
      const selectedService = this.services.find(s => s._id === this.form.serviceId)
      this.form.totalPrice = selectedService ? selectedService.price : 0
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    getStatusClass(status) {
      const classes = {
        pending: 'badge bg-warning',
        confirmed: 'badge bg-success',
        completed: 'badge bg-info',
        cancelled: 'badge bg-danger'
      }
      return classes[status] || 'badge bg-secondary'
    }
  }
}
</script>