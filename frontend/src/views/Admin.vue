<template>
  <div class="admin-panel min-vh-100">
    <!-- Admin Header -->
    <div class="admin-header shadow-sm py-3 mb-4">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col">
            <h2 class="mb-0 fw-bold text-primary">
              <i class="fas fa-cut me-2"></i>{{ $t('admin.dashboard') }}
            </h2>
            <p class="text-muted mb-0">{{ $t('admin.manageBookings') }}</p>
          </div>
          <div class="col-auto">
            <div class="d-flex align-items-center gap-3">
              <button 
                @click="toggleLanguage" 
                class="btn btn-outline-primary btn-sm px-2"
                :title="currentLocale === 'en' ? 'Switch to German' : 'Switch to English'"
              >
                {{ currentLocale === 'en' ? 'DE' : 'EN' }}
              </button>
              <button 
                @click="toggleTheme" 
                :class="['theme-toggle', { active: isDark }]"
                :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              >
                <i class="fas fa-sun theme-toggle-icon sun-icon"></i>
                <i class="fas fa-moon theme-toggle-icon moon-icon"></i>
              </button>
              <div class="dropdown">
              <button class="btn btn-link text-decoration-none p-0 d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="admin-info me-3 text-start">
                  <small class="text-muted">{{ $t('admin.welcomeBack') }}</small>
                  <div class="fw-semibold text-dark">{{ adminUser?.username }}</div>
                </div>
                <div class="admin-avatar">
                  <i class="fas fa-user-shield"></i>
                </div>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg">
                <li><h6 class="dropdown-header">{{ $t('admin.adminAccount') }}</h6></li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button @click="logout" class="dropdown-item text-danger d-flex align-items-center">
                    <i class="fas fa-sign-out-alt me-2"></i>{{ $t('admin.logout') }}
                  </button>
                </li>
              </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="container-fluid mb-4">
      <div class="nav-tabs-wrapper">
        <ul class="nav nav-tabs border-0 mobile-nav">
          <li class="nav-item">
            <button 
              @click="activeTab = 'calendar'" 
              :class="['nav-link', 'fw-medium', activeTab === 'calendar' ? 'active' : '']"
            >
              <i class="fas fa-calendar-alt nav-icon"></i>
              <span class="nav-text">{{ $t('admin.calendar') }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button 
              @click="activeTab = 'requests'" 
              :class="['nav-link', 'fw-medium', 'position-relative', activeTab === 'requests' ? 'active' : '']"
            >
              <i class="fas fa-inbox nav-icon"></i>
              <span class="nav-text">{{ $t('admin.requests') }}</span>
              <span v-if="pendingAppointments.length" class="nav-badge">{{ pendingAppointments.length }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button 
              @click="activeTab = 'services'" 
              :class="['nav-link', 'fw-medium', activeTab === 'services' ? 'active' : '']"
            >
              <i class="fas fa-cut nav-icon"></i>
              <span class="nav-text">{{ $t('admin.services') }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button 
              @click="activeTab = 'timeslots'" 
              :class="['nav-link', 'fw-medium', activeTab === 'timeslots' ? 'active' : '']"
            >
              <i class="fas fa-clock nav-icon"></i>
              <span class="nav-text">{{ $t('admin.slots') }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button 
              @click="activeTab = 'profile'" 
              :class="['nav-link', 'fw-medium', activeTab === 'profile' ? 'active' : '']"
            >
              <i class="fas fa-user-cog nav-icon"></i>
              <span class="nav-text">{{ $t('admin.profile') }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="container-fluid admin-content">

          <!-- Calendar & Booking Tab -->
          <div v-if="activeTab === 'calendar'" class="calendar-tab">
            <!-- Mobile Calendar Controls -->
            <div class="mobile-calendar-controls d-lg-none mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <button @click="changeMonth(-1)" class="btn btn-outline-primary btn-sm">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <h6 class="mb-0 fw-bold">{{ currentMonthYear }}</h6>
                <button @click="changeMonth(1)" class="btn btn-outline-primary btn-sm">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
              <div class="d-flex gap-2 justify-content-center">
                <button @click="goToToday" class="btn btn-primary btn-sm">Today</button>
                <button @click="showBookingModal = true" class="btn btn-success btn-sm">
                  <i class="fas fa-plus me-1"></i>Book
                </button>
              </div>
            </div>

            <div class="row g-3">
              <!-- Calendar Section -->
              <div class="col-12 col-lg-8">
                <div class="card border-0 shadow-sm calendar-card">
                  <div class="card-header py-3 d-none d-lg-block">
                    <div class="d-flex justify-content-between align-items-center">
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
                  <div class="card-body p-2 p-lg-3">
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
              <div class="col-12 col-lg-4">
                <div v-if="selectedCalendarDate" class="card border-0 shadow-sm appointments-card">
                  <div class="card-header bg-gradient-primary text-white">
                    <h6 class="mb-0 d-none d-lg-block"><i class="fas fa-calendar-day me-2"></i>{{ formatSelectedDate }}</h6>
                    <h6 class="mb-0 d-lg-none"><i class="fas fa-calendar-day me-2"></i>Selected Day</h6>
                    <small class="opacity-75">{{ selectedDayAppointments.length }} appointment(s)</small>
                  </div>
                  <div class="card-body p-0">
                    <div v-if="selectedDayAppointments.length" class="appointments-list">
                      <div v-for="apt in selectedDayAppointments" :key="apt._id" class="appointment-card">
                        <div class="appointment-header d-flex justify-content-between align-items-start mb-2">
                          <div class="appointment-time-mobile">
                            <i class="fas fa-clock text-primary me-1"></i>
                            <span class="fw-bold">{{ apt.time }}</span>
                          </div>
                          <span :class="getStatusBadgeClass(apt.status)">{{ apt.status }}</span>
                        </div>
                        <div class="appointment-details">
                          <h6 class="customer-name mb-1">
                            <i class="fas fa-user me-2 text-muted"></i>{{ apt.customerName }}
                          </h6>
                          <p class="services mb-1">
                            <i class="fas fa-cut me-2 text-muted"></i>{{ apt.services?.map(s => s.name).join(', ') }}
                          </p>
                          <div class="appointment-meta d-flex justify-content-between mb-2">
                            <span class="price"><i class="fas fa-dollar-sign me-1"></i>${{ apt.totalPrice }}</span>
                            <span class="duration"><i class="fas fa-hourglass-half me-1"></i>{{ apt.totalDuration }}min</span>
                          </div>
                          <div v-if="apt.customerPhone" class="contact-info mb-2">
                            <small class="text-muted"><i class="fas fa-phone me-1"></i>{{ apt.customerPhone }}</small>
                          </div>
                        </div>
                        <div class="appointment-actions d-flex gap-2 justify-content-center">
                          <button v-if="apt.status === 'pending'" @click="openResponseModal(apt, 'confirmed')" class="btn btn-sm btn-success flex-fill">
                            <i class="fas fa-check me-1"></i>Accept
                          </button>
                          <button v-if="apt.status === 'pending'" @click="openResponseModal(apt, 'cancelled')" class="btn btn-sm btn-outline-danger flex-fill">
                            <i class="fas fa-times me-1"></i>Reject
                          </button>
                          <button v-if="apt.status === 'confirmed'" @click="confirmAction(apt, 'completed')" class="btn btn-sm btn-primary flex-fill">
                            <i class="fas fa-flag-checkered me-1"></i>Complete
                          </button>
                          <button v-if="apt.status === 'confirmed'" @click="setReminder(apt)" class="btn btn-sm btn-warning">
                            <i class="fas fa-bell"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else class="empty-state text-center py-4">
                      <i class="fas fa-calendar-times fa-2x text-muted mb-2"></i>
                      <p class="text-muted mb-0">No appointments scheduled</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Booking Requests Tab -->
          <div v-if="activeTab === 'requests'" class="requests-tab">
            <div class="card border-0 shadow-sm">
              <div class="card-header py-3">
                <h5 class="mb-0"><i class="fas fa-inbox me-2"></i>Booking Requests</h5>
                <small class="text-muted">{{ pendingAppointments.length }} pending request(s)</small>
              </div>
              <div class="card-body p-2 p-lg-3">
                <div v-if="pendingAppointments.length" class="requests-list">
                  <div v-for="apt in pendingAppointments" :key="apt._id" class="request-card card mb-3">
                    <div class="card-body p-3">
                      <div class="row g-3">
                        <div class="col-12 col-lg-8">
                          <div class="request-header d-flex justify-content-between align-items-start mb-2">
                            <h6 class="mb-0 fw-bold">{{ apt.customerName }}</h6>
                            <span class="badge bg-warning text-dark d-lg-none">Pending</span>
                          </div>
                          <div class="request-details">
                            <div class="detail-item mb-1">
                              <i class="fas fa-calendar me-2 text-primary"></i>
                              <span class="fw-medium">{{ formatDate(apt.date) }} at {{ apt.time }}</span>
                            </div>
                            <div class="detail-item mb-1">
                              <i class="fas fa-cut me-2 text-success"></i>
                              <span>{{ apt.services?.map(s => s.name).join(', ') }}</span>
                            </div>
                            <div class="detail-item mb-1">
                              <i class="fas fa-user-tie me-2 text-info"></i>
                              <span>{{ apt.barberId?.name }}</span>
                            </div>
                            <div class="detail-item mb-1">
                              <i class="fas fa-phone me-2 text-secondary"></i>
                              <span>{{ apt.customerPhone }}</span>
                            </div>
                            <div v-if="apt.customerEmail" class="detail-item mb-1">
                              <i class="fas fa-envelope me-2 text-secondary"></i>
                              <span>{{ apt.customerEmail }}</span>
                            </div>
                            <div v-if="apt.notes" class="detail-item">
                              <i class="fas fa-note-sticky me-2 text-muted"></i>
                              <span class="text-muted">{{ apt.notes }}</span>
                            </div>
                          </div>
                        </div>
                        <div class="col-12 col-lg-4">
                          <div class="request-actions text-center text-lg-end">
                            <div class="price-display mb-3">
                              <h4 class="text-primary mb-0">${{ apt.totalPrice }}</h4>
                              <small class="text-muted">Total Amount</small>
                            </div>
                            <div class="action-buttons d-grid gap-2">
                              <button @click="openResponseModal(apt, 'confirmed')" class="btn btn-success">
                                <i class="fas fa-check me-2"></i>Accept Request
                              </button>
                              <button @click="openResponseModal(apt, 'cancelled')" class="btn btn-outline-danger">
                                <i class="fas fa-times me-2"></i>Reject Request
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state text-center py-5">
                  <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No Pending Requests</h5>
                  <p class="text-muted mb-0">All booking requests have been processed</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Services Tab -->
          <div v-if="activeTab === 'services'" class="services-tab">
            <div class="card border-0 shadow-sm">
              <div class="card-header py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="mb-0"><i class="fas fa-cut me-2"></i>Services Management</h5>
                    <small class="text-muted">{{ services.length }} service(s) available</small>
                  </div>
                  <button @click="showServiceForm = true" class="btn btn-primary btn-sm">
                    <i class="fas fa-plus me-1"></i><span class="d-none d-sm-inline">Add Service</span>
                  </button>
                </div>
              </div>
              <div class="card-body p-2 p-lg-3">
                <!-- Service Form -->
                <div v-if="showServiceForm" class="service-form-card card mb-4">
                  <div class="card-header">
                    <h6 class="mb-0">{{ serviceForm._id ? 'Edit Service' : 'Add New Service' }}</h6>
                  </div>
                  <div class="card-body">
                    <form @submit.prevent="saveService">
                      <div class="row g-3">
                        <div class="col-12 col-md-6">
                          <label class="form-label fw-medium">Service Name</label>
                          <input v-model="serviceForm.name" type="text" class="form-control" required>
                        </div>
                        <div class="col-6 col-md-3">
                          <label class="form-label fw-medium">Duration (min)</label>
                          <input v-model="serviceForm.duration" type="number" class="form-control" required>
                        </div>
                        <div class="col-6 col-md-3">
                          <label class="form-label fw-medium">Price ($)</label>
                          <input v-model="serviceForm.price" type="number" step="0.01" class="form-control" required>
                        </div>
                        <div class="col-12">
                          <label class="form-label fw-medium">Description</label>
                          <textarea v-model="serviceForm.description" class="form-control" rows="2" placeholder="Brief description of the service..."></textarea>
                        </div>
                      </div>
                      <div class="d-flex gap-2 mt-3">
                        <button type="submit" class="btn btn-success">
                          <i class="fas fa-save me-1"></i>{{ serviceForm._id ? 'Update' : 'Save' }} Service
                        </button>
                        <button @click="cancelServiceForm" type="button" class="btn btn-outline-secondary">
                          <i class="fas fa-times me-1"></i>Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <!-- Services List - Mobile Cards -->
                <div class="d-lg-none">
                  <div v-for="service in services" :key="service._id" class="service-card card mb-3">
                    <div class="card-body p-3">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="mb-0 fw-bold">{{ service.name }}</h6>
                        <span class="badge bg-primary">${{ service.price }}</span>
                      </div>
                      <div class="service-details mb-3">
                        <div class="d-flex justify-content-between text-muted small mb-1">
                          <span><i class="fas fa-clock me-1"></i>{{ service.duration }} minutes</span>
                        </div>
                        <p class="text-muted small mb-0">{{ service.description || 'No description available' }}</p>
                      </div>
                      <div class="service-actions d-flex gap-2">
                        <button @click="editService(service)" class="btn btn-sm btn-outline-primary flex-fill">
                          <i class="fas fa-edit me-1"></i>Edit
                        </button>
                        <button @click="deleteService(service._id)" class="btn btn-sm btn-outline-danger flex-fill">
                          <i class="fas fa-trash me-1"></i>Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Services List - Desktop Table -->
                <div class="d-none d-lg-block">
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead class="table-light">
                        <tr>
                          <th>Service Name</th>
                          <th>Duration</th>
                          <th>Price</th>
                          <th>Description</th>
                          <th class="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="service in services" :key="service._id">
                          <td class="fw-medium">{{ service.name }}</td>
                          <td>{{ service.duration }} min</td>
                          <td class="fw-bold text-success">${{ service.price }}</td>
                          <td class="text-muted">{{ service.description || 'No description' }}</td>
                          <td class="text-center">
                            <div class="btn-group" role="group">
                              <button @click="editService(service)" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-edit"></i>
                              </button>
                              <button @click="deleteService(service._id)" class="btn btn-sm btn-outline-danger">
                                <i class="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div v-if="!services.length" class="empty-state text-center py-5">
                  <i class="fas fa-cut fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No Services Available</h5>
                  <p class="text-muted mb-3">Start by adding your first service</p>
                  <button @click="showServiceForm = true" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>Add Your First Service
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Time Slots Tab -->
          <div v-if="activeTab === 'timeslots'" class="timeslots-tab">
            <div class="card border-0 shadow-sm">
              <div class="card-header py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="mb-0"><i class="fas fa-clock me-2"></i>Weekly Time Slots</h5>
                    <small class="text-muted">Manage your working hours for each day</small>
                  </div>
                  <div v-if="primaryBarber" class="d-none d-lg-block">
                    <span class="badge bg-info">{{ timeSlots.length }} total slots</span>
                  </div>
                </div>
              </div>
              <div class="card-body p-2 p-lg-3">
                <div v-if="primaryBarber" class="alert alert-info d-flex flex-column d-lg-flex-row justify-content-between align-items-start align-items-lg-center mb-4">
                  <span><i class="fas fa-info-circle me-2"></i>Managing time slots for: <strong>{{ primaryBarber.name }}</strong></span>
                  <small class="text-muted mt-1 mt-lg-0">Total slots: {{ timeSlots.length }}</small>
                </div>
                
                <div v-if="primaryBarber" class="timeslots-grid">
                  <div v-for="(day, index) in daysOfWeek" :key="index" class="day-schedule-card">
                    <div class="day-header">
                      <div class="day-info">
                        <h6 class="day-name">{{ day }}</h6>
                        <span class="slot-count">{{ getTimeSlotsForDay(index).length }} slots</span>
                      </div>
                      <div class="day-status">
                        <span :class="getTimeSlotsForDay(index).length ? 'status-active' : 'status-inactive'">
                          {{ getTimeSlotsForDay(index).length ? 'Active' : 'Closed' }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="add-slot-section">
                      <div class="add-slot-form">
                        <div class="time-inputs">
                          <div class="time-input-group">
                            <label class="time-label">From</label>
                            <input v-model="newSlot[index].startTime" type="time" class="time-input">
                          </div>
                          <div class="time-separator">to</div>
                          <div class="time-input-group">
                            <label class="time-label">To</label>
                            <input v-model="newSlot[index].endTime" type="time" class="time-input">
                          </div>
                        </div>
                        <button @click="addTimeSlot(index)" class="add-slot-btn">
                          <i class="fas fa-plus me-1"></i>Add Slot
                        </button>
                      </div>
                    </div>
                    
                    <div class="slots-list">
                      <div v-if="getTimeSlotsForDay(index).length" class="slots-header">
                        <span class="slots-title">Working Hours</span>
                      </div>
                      <div class="slots-container">
                        <div v-for="slot in getTimeSlotsForDay(index)" :key="slot._id" class="slot-item">
                          <div class="slot-time">
                            <i class="fas fa-clock slot-icon"></i>
                            <span class="time-range">{{ slot.startTime }} - {{ slot.endTime }}</span>
                          </div>
                          <button @click="deleteTimeSlot(slot._id)" class="delete-slot-btn">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                        <div v-if="!getTimeSlotsForDay(index).length" class="no-slots">
                          <i class="fas fa-moon text-muted mb-2"></i>
                          <p class="no-slots-text">Closed on {{ day }}</p>
                        </div>
                      </div>
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

          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="profile-tab">
            <div class="row g-3 g-lg-4">
              <div class="col-12 col-lg-6">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-header bg-gradient-primary text-white">
                    <h5 class="mb-0"><i class="fas fa-user-tie me-2"></i>Barber Profile</h5>
                    <small class="opacity-75">Manage your business profile</small>
                  </div>
                  <div class="card-body p-3">
                    <form @submit.prevent="updateBarberProfile">
                      <div class="row g-3">
                        <div class="col-12">
                          <label class="form-label fw-medium">Barber Name</label>
                          <input v-model="barberProfile.name" type="text" class="form-control" required>
                        </div>
                        <div class="col-12">
                          <label class="form-label fw-medium">Email</label>
                          <input v-model="barberProfile.email" type="email" class="form-control" placeholder="barber@example.com">
                          <small class="text-muted">This email will receive booking notifications</small>
                        </div>
                        <div class="col-12">
                          <label class="form-label fw-medium">Specialties</label>
                          <input v-model="barberProfile.specialties" type="text" class="form-control" placeholder="Haircut, Beard Trim, Styling">
                          <small class="text-muted">Separate multiple specialties with commas</small>
                        </div>
                        <div class="col-12">
                          <label class="form-label fw-medium">Phone</label>
                          <input v-model="barberProfile.phone" type="tel" class="form-control" placeholder="+1 (555) 123-4567">
                        </div>
                        <div class="col-12">
                          <label class="form-label fw-medium">Bio</label>
                          <textarea v-model="barberProfile.bio" class="form-control" rows="3" placeholder="Tell customers about yourself and your experience..."></textarea>
                        </div>
                      </div>
                      <div class="d-grid mt-4">
                        <button type="submit" class="btn btn-primary">
                          <i class="fas fa-save me-2"></i>Update Profile
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-6">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-header bg-gradient-success text-white">
                    <h5 class="mb-0"><i class="fas fa-user-shield me-2"></i>Admin Settings</h5>
                    <small class="opacity-75">Manage your admin account</small>
                  </div>
                  <div class="card-body p-3">
                    <form @submit.prevent="updateAdminProfile">
                      <div class="row g-3">
                        <div class="col-12">
                          <label class="form-label fw-medium">Admin Name</label>
                          <input v-model="adminProfile.name" type="text" class="form-control" required>
                        </div>
                        <div class="col-12">
                          <label class="form-label fw-medium">Email</label>
                          <input v-model="adminProfile.email" type="email" class="form-control" required>
                        </div>
                        <div class="col-12">
                          <div class="password-section">
                            <h6 class="text-muted mb-3"><i class="fas fa-lock me-2"></i>Change Password</h6>
                            <div class="row g-3">
                              <div class="col-12">
                                <label class="form-label fw-medium">Current Password</label>
                                <div class="input-group">
                                  <input v-model="adminProfile.currentPassword" :type="showCurrentPassword ? 'text' : 'password'" class="form-control" placeholder="Enter current password">
                                  <button @click="showCurrentPassword = !showCurrentPassword" type="button" class="btn btn-outline-secondary">
                                    <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                  </button>
                                </div>
                              </div>
                              <div class="col-12">
                                <label class="form-label fw-medium">New Password</label>
                                <div class="input-group">
                                  <input v-model="adminProfile.newPassword" :type="showNewPassword ? 'text' : 'password'" class="form-control" placeholder="Enter new password">
                                  <button @click="showNewPassword = !showNewPassword" type="button" class="btn btn-outline-secondary">
                                    <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                  </button>
                                </div>
                              </div>
                              <div class="col-12">
                                <label class="form-label fw-medium">Confirm New Password</label>
                                <div class="input-group">
                                  <input v-model="adminProfile.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" class="form-control" placeholder="Confirm new password">
                                  <button @click="showConfirmPassword = !showConfirmPassword" type="button" class="btn btn-outline-secondary">
                                    <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="d-grid mt-4">
                        <button type="submit" class="btn btn-success">
                          <i class="fas fa-save me-2"></i>Update Settings
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

    </div>

    <!-- Professional Toast Notifications -->
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;">
      <div v-for="(toast, index) in toasts" :key="toast.id" 
           :class="['toast', 'show', `toast-${toast.type}`]" 
           role="alert">
        <div class="toast-header">
          <i :class="getToastIcon(toast.type)" class="me-2"></i>
          <strong class="me-auto">{{ getToastTitle(toast.type) }}</strong>
          <button @click="removeToast(index)" type="button" class="btn-close" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
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

    <!-- Confirmation Modal -->
    <div v-if="confirmModal.show" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" @click.self="confirmModal.show = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content confirmation-modal">
          <div class="modal-header border-0 pb-0">
            <div class="confirmation-icon">
              <i :class="confirmModal.action === 'confirmed' ? 'fas fa-check-circle text-success' : 'fas fa-flag-checkered text-primary'"></i>
            </div>
            <button @click="confirmModal.show = false" class="btn-close"></button>
          </div>
          <div class="modal-body text-center">
            <h5 class="mb-3">{{ confirmModal.action === 'confirmed' ? 'Approve Appointment?' : 'Mark as Complete?' }}</h5>
            <p class="text-muted mb-4">{{ confirmModal.message }}</p>
            <div class="appointment-preview">
              <div class="preview-item">
                <i class="fas fa-user me-2"></i>{{ confirmModal.appointment?.customerName }}
              </div>
              <div class="preview-item">
                <i class="fas fa-calendar me-2"></i>{{ formatDate(confirmModal.appointment?.date) }} at {{ confirmModal.appointment?.time }}
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button @click="confirmModal.show = false" class="btn btn-light">Cancel</button>
            <button @click="executeAction" :class="confirmModal.action === 'confirmed' ? 'btn btn-success' : 'btn btn-primary'">
              <i :class="confirmModal.action === 'confirmed' ? 'fas fa-check me-2' : 'fas fa-flag-checkered me-2'"></i>
              {{ confirmModal.action === 'confirmed' ? 'Approve' : 'Complete' }}
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
import { useTheme } from '../composables/useTheme'
import { useLanguage } from '../composables/useLanguage'

// Add axios interceptor for authentication
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default {
  name: 'Admin',
  setup() {
    const { isDark, toggleTheme } = useTheme()
    const { currentLocale, toggleLanguage } = useLanguage()
    return { isDark, toggleTheme, currentLocale, toggleLanguage }
  },
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
      showBookingModal: false,
barberProfile: {
        name: '',
        email: '',
        specialties: '',
        phone: '',
        bio: ''
      },
adminProfile: {
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      confirmModal: {
        show: false,
        appointment: null,
        action: '',
        message: ''
      },
      toasts: [],
      toastId: 0,
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false
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
      
      // Limit to 35 days (5 rows × 7 days)
      return days.slice(0, 35)
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
    this.loadAdminProfile()
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
        this.loadAdminProfile()
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
          this.showToast('No barber available', 'warning')
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
        this.showToast('Appointment booked successfully!', 'success')
      } catch (error) {
        console.error('Error booking appointment:', error)
        this.showToast('Error booking appointment: ' + (error.response?.data?.message || error.message), 'error')
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
        this.showToast('Please fill in both start and end times', 'warning')
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
        this.showToast('Time slot added successfully!', 'success')
      } catch (error) {
        console.error('Error adding time slot:', error)
        this.showToast('Error adding time slot: ' + (error.response?.data?.message || error.message), 'error')
      }
    },
    async deleteTimeSlot(id) {
      if (!confirm('Are you sure you want to delete this time slot?')) return
      try {
        await axios.delete(`${process.env.VUE_APP_API_URL}/timeslots/${id}`)
        await this.fetchTimeSlots()
        this.showToast('Time slot deleted successfully!', 'success')
      } catch (error) {
        console.error('Error deleting time slot:', error)
        this.showToast('Error deleting time slot: ' + (error.response?.data?.message || error.message), 'error')
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
        // Check for conflicts when accepting
        if (this.responseModal.status === 'confirmed') {
          const conflictCheck = await axios.get(`${process.env.VUE_APP_API_URL}/appointments/availability`, {
            params: {
              barberId: this.responseModal.appointment.barberId._id || this.responseModal.appointment.barberId,
              date: this.responseModal.appointment.date,
              duration: this.responseModal.appointment.totalDuration
            }
          })
          
          if (!conflictCheck.data.availableTimes.includes(this.responseModal.appointment.time)) {
            this.showToast('⚠️ Time slot conflict detected! This slot is no longer available.', 'warning')
            await this.fetchAppointments()
            this.responseModal.show = false
            return
          }
        }
        
        await axios.put(`${process.env.VUE_APP_API_URL}/appointments/${this.responseModal.appointment._id}`, {
          status: this.responseModal.status,
          responseMessage: this.responseModal.message,
          sendEmail: true
        })
        
        await this.fetchAppointments()
        this.responseModal.show = false
        
        const statusText = this.responseModal.status === 'confirmed' ? 'accepted' : 'rejected'
        const icon = this.responseModal.status === 'confirmed' ? '✅' : '❌'
        this.showToast(`${icon} Appointment ${statusText} successfully! Customer has been notified.`, 'success')
      } catch (error) {
        console.error('Error responding to appointment:', error)
        const errorMsg = error.response?.data?.message || error.message
        if (errorMsg.includes('conflict')) {
          this.showToast('⚠️ ' + errorMsg, 'warning')
        } else {
          this.showToast('❌ Error updating appointment: ' + errorMsg, 'error')
        }
      }
    },

async setReminder(appointment) {
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_URL}/appointments/${appointment._id}/reminder`)
        
        if (response.data.scheduledFor) {
          const scheduledTime = new Date(response.data.scheduledFor).toLocaleTimeString()
          this.showToast(`🔔 Reminder scheduled for ${scheduledTime} (10 min before appointment)`, 'success')
        } else {
          this.showToast(`⏰ ${response.data.message}`, 'info')
        }
      } catch (error) {
        console.error('Error setting reminder:', error)
        this.showToast('❌ Failed to set reminder: ' + (error.response?.data?.message || error.message), 'error')
      }
    },
    confirmAction(appointment, action) {
      this.confirmModal = {
        show: true,
        appointment,
        action,
        message: action === 'confirmed' 
          ? 'This will approve the appointment and notify the customer.'
          : 'This will mark the appointment as completed.'
      }
    },
    async executeAction() {
      try {
        await this.updateAppointmentStatus(this.confirmModal.appointment, this.confirmModal.action)
        this.confirmModal.show = false
      } catch (error) {
        console.error('Error executing action:', error)
      }
    },
    async updateBarberProfile() {
      try {
        if (!this.primaryBarber) return
const updateData = {
          name: this.barberProfile.name,
          email: this.barberProfile.email,
          specialties: this.barberProfile.specialties.split(',').map(s => s.trim()).filter(s => s),
          phone: this.barberProfile.phone,
          bio: this.barberProfile.bio
        }
        await axios.put(`${process.env.VUE_APP_API_URL}/barbers/${this.primaryBarber._id}`, updateData)
        await this.fetchBarbers()
        this.showToast('Barber profile updated successfully!', 'success')
      } catch (error) {
        console.error('Error updating barber profile:', error)
        this.showToast('Error updating profile', 'error')
      }
    },
    async updateAdminProfile() {
      try {
        if (this.adminProfile.newPassword && this.adminProfile.newPassword !== this.adminProfile.confirmPassword) {
          this.showToast('New passwords do not match', 'warning')
          return
        }
        
        if (!this.adminProfile.name.trim()) {
          this.showToast('Admin name is required', 'warning')
          return
        }
        
        if (!this.adminProfile.email.trim()) {
          this.showToast('Email is required', 'warning')
          return
        }
        
        const updateData = {
          name: this.adminProfile.name.trim(),
          email: this.adminProfile.email.trim()
        }
        
        if (this.adminProfile.newPassword) {
          if (!this.adminProfile.currentPassword) {
            this.showToast('Current password is required to change password', 'warning')
            return
          }
          updateData.currentPassword = this.adminProfile.currentPassword
          updateData.newPassword = this.adminProfile.newPassword
        }
        
        const response = await axios.put(`${process.env.VUE_APP_API_URL}/auth/profile`, updateData)
        
        // Update localStorage with new admin data
        if (response.data.admin) {
          localStorage.setItem('adminUser', JSON.stringify(response.data.admin))
        }
        
        this.showToast('Admin settings updated successfully!', 'success')
        this.adminProfile.currentPassword = ''
        this.adminProfile.newPassword = ''
        this.adminProfile.confirmPassword = ''
        
        // Reload admin profile data
        this.loadAdminProfile()
      } catch (error) {
        console.error('Error updating admin profile:', error)
        this.showToast('Error updating settings: ' + (error.response?.data?.message || error.message), 'error')
      }
    },
    loadAdminProfile() {
      if (this.adminUser) {
        this.adminProfile.name = this.adminUser.name || this.adminUser.username || ''
        this.adminProfile.email = this.adminUser.email || ''
      }
      if (this.primaryBarber) {
        this.barberProfile.name = this.primaryBarber.name || ''
        this.barberProfile.email = this.primaryBarber.email || ''
        this.barberProfile.phone = this.primaryBarber.phone || ''
        this.barberProfile.bio = this.primaryBarber.bio || ''
        this.barberProfile.specialties = Array.isArray(this.primaryBarber.specialties) 
          ? this.primaryBarber.specialties.join(', ') 
          : this.primaryBarber.specialties || ''
      }
    },
    showToast(message, type = 'info') {
      const toast = {
        id: ++this.toastId,
        message,
        type
      }
      this.toasts.push(toast)
      setTimeout(() => {
        this.removeToast(this.toasts.findIndex(t => t.id === toast.id))
      }, 4000)
    },
    removeToast(index) {
      if (index > -1) {
        this.toasts.splice(index, 1)
      }
    },
    getToastIcon(type) {
      const icons = {
        success: 'fas fa-check-circle text-success',
        error: 'fas fa-exclamation-circle text-danger',
        warning: 'fas fa-exclamation-triangle text-warning',
        info: 'fas fa-info-circle text-info'
      }
      return icons[type] || icons.info
    },
    getToastTitle(type) {
      const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information'
      }
      return titles[type] || titles.info
    }
  }
}
</script>

<style scoped>
.admin-panel {
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
  padding: 0 1rem;
  color: var(--text-primary);
}

.admin-content {
  padding: 0 1rem;
}

/* Desktop Optimizations */
@media (min-width: 992px) {
  .admin-panel {
    padding: 0 2rem;
  }
  
  .admin-content {
    padding: 0 2rem;
  }
  
  .calendar-container,
  .timeslots-container,
  .profile-container {
    height: calc(100vh - 200px);
    min-height: 600px;
  }
  
  .calendar-card,
  .appointments-card,
  .profile-card,
  .admin-settings-card {
    height: 100%;
  }
  
  .calendar-body {
    height: calc(100% - 80px);
    overflow: hidden;
  }
  
  .appointments-body {
    height: calc(100% - 80px);
    overflow-y: auto;
  }
  
  .profile-body,
  .admin-settings-body {
    height: calc(100% - 80px);
    overflow-y: auto;
  }
  
  .timeslots-body {
    height: calc(100% - 80px);
    overflow-y: auto;
  }
  
  .timeslots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    height: 100%;
  }
}

.admin-header {
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary) !important;
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
  color: white !important;
}

.bg-gradient-primary h1, .bg-gradient-primary h2, .bg-gradient-primary h3,
.bg-gradient-primary h4, .bg-gradient-primary h5, .bg-gradient-primary h6,
.bg-gradient-primary small, .bg-gradient-primary .small {
  color: white !important;
}

.bg-gradient-success {
  color: white !important;
}

.bg-gradient-success h1, .bg-gradient-success h2, .bg-gradient-success h3,
.bg-gradient-success h4, .bg-gradient-success h5, .bg-gradient-success h6,
.bg-gradient-success small, .bg-gradient-success .small {
  color: white !important;
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
  margin-bottom: 1.5rem;
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
  margin: 0.25rem;
}

.btn:hover {
  transform: translateY(-1px);
}

.form-control, .form-select {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
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
  background-color: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-color) !important;
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
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  padding: 0.5rem;
}

.nav-tabs .nav-link {
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  padding: 0.75rem 1rem;
}

.nav-tabs .nav-link:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--primary);
}

.nav-tabs .nav-link.active {
  background: var(--primary) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.nav-tabs .nav-link.active .nav-text,
.nav-tabs .nav-link.active .nav-icon {
  color: white !important;
}

/* Mobile Navigation */
.mobile-nav {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.nav-icon {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.nav-text {
  display: block;
  font-size: 0.8rem;
}

.nav-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

/* Professional Animations */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.card {
  animation: slideInUp 0.6s ease-out;
}

.appointment-card {
  animation: fadeInScale 0.4s ease-out;
}

.btn:active {
  animation: pulse 0.2s ease-in-out;
}

/* Confirmation Modal */
.confirmation-modal {
  border-radius: 20px;
  border: none;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: fadeInScale 0.3s ease-out;
}

.confirmation-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
}

.appointment-preview {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
}

.preview-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.preview-item:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .mobile-nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-item {
    flex: 1;
    min-width: 80px;
    max-width: 100px;
  }
  
  .nav-link {
    padding: 0.75rem 0.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .nav-text {
    font-size: 0.7rem;
  }
  
  .nav-icon {
    font-size: 1rem;
    margin-bottom: 0.2rem;
  }
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
  gap: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
}

.calendar-header {
  background: var(--bg-tertiary);
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.calendar-day {
  background: var(--bg-secondary);
  padding: 8px;
  min-height: 70px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  color: var(--text-primary);
  border-radius: 8px;
}

.calendar-day:hover {
  background: var(--bg-tertiary);
  transform: scale(1.02);
}

.calendar-day.other-month {
  background: var(--bg-tertiary);
  color: var(--text-muted);
  opacity: 0.6;
}

.calendar-day.today {
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid var(--primary);
}

.calendar-day.selected {
  background: rgba(59, 130, 246, 0.2);
  border: 2px solid var(--primary);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.calendar-day.has-bookings {
  background: rgba(16, 185, 129, 0.2);
  color: var(--text-primary);
}

.calendar-day.has-bookings.selected {
  background: rgba(16, 185, 129, 0.3);
  border: 2px solid var(--success);
  color: var(--text-primary);
}

.dark-theme .calendar-day.has-bookings {
  background: rgba(16, 185, 129, 0.3);
  color: white;
}

.dark-theme .calendar-day.has-bookings.selected {
  background: rgba(16, 185, 129, 0.4);
  color: white;
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
  position: relative;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
  color: var(--text-primary);
}

.appointment-card:hover {
  background-color: var(--bg-tertiary);
}

.appointment-card:last-child {
  border-bottom: none;
}

.appointment-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.appointment-time {
  min-width: 80px;
  text-align: center;
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

.appointment-status-corner {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.appointment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.appointment-actions-left {
  display: flex;
  gap: 0.5rem;
}

.appointment-actions-right {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .admin-panel {
    padding: 0 0.5rem;
  }
  
  .admin-content {
    padding: 0 0.5rem;
  }
  
  /* Mobile Calendar */
  .mobile-calendar-controls {
    background: white;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .calendar-day {
    min-height: 45px;
    padding: 4px 2px;
  }
  
  .calendar-header {
    padding: 8px 4px;
    font-size: 0.75rem;
  }
  
  .day-number {
    font-size: 0.8rem;
  }
  
  .booking-badge {
    width: 16px;
    height: 16px;
    font-size: 0.6rem;
    top: 2px;
    right: 2px;
  }
  
  /* Mobile Appointments */
  .appointment-card {
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    margin: 0.5rem;
    padding: 1rem;
  }
  
  .appointment-header {
    border-bottom: 1px solid #f3f4f6;
    padding-bottom: 0.5rem;
  }
  
  .appointment-time-mobile {
    font-size: 0.9rem;
  }
  
  .appointment-actions {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid #f3f4f6;
  }
  
  /* Mobile Requests */
  .request-card {
    border-radius: 12px;
    margin-bottom: 1rem;
  }
  
  .request-header {
    margin-bottom: 1rem;
  }
  
  .detail-item {
    font-size: 0.9rem;
    padding: 0.25rem 0;
  }
  
  .price-display {
    text-align: center;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
  }
  
  /* Mobile Services */
  .service-card {
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }
  
  .service-form-card {
    border-radius: 12px;
  }
  
  /* Mobile Time Slots */
  .timeslots-grid {
    display: block;
  }
  
  .day-schedule-card {
    margin-bottom: 1rem;
  }
  
  .time-inputs {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .time-separator {
    text-align: center;
    padding: 0.5rem 0;
    font-weight: 600;
  }
  
  /* Mobile Profile */
  .profile-tab .row {
    margin: 0;
  }
  
  .password-section {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
  }
  
  /* Mobile Navigation */
  .mobile-nav {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .mobile-nav::-webkit-scrollbar {
    display: none;
  }
  
  .nav-item {
    flex: 0 0 auto;
    min-width: 70px;
  }
  
  .nav-link {
    padding: 0.75rem 0.5rem;
    text-align: center;
    white-space: nowrap;
  }
  
  .nav-text {
    font-size: 0.7rem;
  }
  
  .nav-icon {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }
  
  /* Mobile Cards */
  .card {
    border-radius: 12px;
    margin-bottom: 1rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  /* Mobile Buttons */
  .btn {
    margin: 0.125rem;
    font-size: 0.875rem;
  }
  
  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }
  
  /* Mobile Forms */
  .form-control {
    padding: 0.75rem;
    font-size: 1rem;
  }
  
  .form-label {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 576px) {
  .admin-panel {
    padding: 0 0.25rem;
  }
  
  .admin-content {
    padding: 0 0.25rem;
  }
  
  .calendar-day {
    min-height: 35px;
    padding: 2px 1px;
  }
  
  .calendar-header {
    padding: 6px 2px;
    font-size: 0.65rem;
  }
  
  .day-number {
    font-size: 0.7rem;
  }
  
  .booking-badge {
    width: 14px;
    height: 14px;
    font-size: 0.55rem;
  }
  
  .card-body {
    padding: 0.75rem;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .mobile-calendar-controls {
    padding: 0.75rem;
  }
  
  .appointment-card {
    margin: 0.25rem;
    padding: 0.75rem;
  }
  
  .nav-link {
    padding: 0.5rem 0.25rem;
  }
  
  .nav-text {
    font-size: 0.65rem;
  }
  
  .nav-icon {
    font-size: 0.9rem;
  }
}

/* Professional Time Slots Design */
.day-schedule-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

/* Desktop Time Slots Grid */
@media (min-width: 992px) {
  .timeslots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
}

@media (min-width: 1200px) {
  .timeslots-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1400px) {
  .timeslots-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.day-schedule-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.day-header {
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-primary) 100%);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.day-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.slot-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.status-active {
  background: #dcfce7;
  color: #166534;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-inactive {
  background: #fef2f2;
  color: #991b1b;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.add-slot-section {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.add-slot-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.time-inputs {
  display: flex;
  align-items: end;
  gap: 0.75rem;
}

.time-input-group {
  flex: 1;
}

.time-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.time-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.time-separator {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
  padding-bottom: 0.5rem;
}

.add-slot-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-slot-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.slots-list {
  padding: 1rem;
}

.slots-header {
  margin-bottom: 0.75rem;
}

.slots-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.slots-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.slot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.slot-item:hover {
  background: var(--bg-primary);
  border-color: var(--border-color);
}

.slot-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.slot-icon {
  color: var(--primary);
  font-size: 0.9rem;
}

.time-range {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.delete-slot-btn {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
}

.delete-slot-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  transform: scale(1.05);
}

.no-slots {
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;
}

.no-slots-text {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .time-inputs {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .time-separator {
    text-align: center;
    padding: 0;
  }
  
  .day-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

/* Professional Toast Notifications */
.toast {
  min-width: 300px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  margin-bottom: 0.75rem;
  animation: slideInRight 0.3s ease-out;
}

.toast-success {
  background: rgba(59, 130, 246, 0.95);
  color: white;
}

.toast-error {
  background: rgba(59, 130, 246, 0.95);
  color: white;
}

.toast-warning {
  background: rgba(59, 130, 246, 0.95);
  color: white;
}

.toast-info {
  background: rgba(59, 130, 246, 0.95);
  color: white;
}

.toast-header {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: inherit;
  padding: 0.75rem 1rem;
}

.toast-body {
  padding: 0.75rem 1rem;
  font-weight: 500;
}

.toast .btn-close {
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

.toast .btn-close:hover {
  opacity: 1;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 576px) {
  .toast {
    min-width: 280px;
    margin: 0 0.5rem 0.75rem 0.5rem;
  }
  
  .toast-container {
    left: 0;
    right: 0;
    top: auto;
    bottom: 1rem;
  }
}

/* Password Input Groups */
.input-group {
  display: flex;
  width: 100%;
}

.input-group .form-control {
  flex: 1;
  margin-bottom: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-group .btn {
  border-color: #d1d5db;
  color: #6b7280;
  margin: 0;
  padding: 0.75rem 0.75rem;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 0;
  flex-shrink: 0;
  width: auto;
}

.input-group .btn:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.input-group .form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
  z-index: 3;
}

.input-group .form-control:focus + .btn {
  border-color: #3b82f6;
}
</style>