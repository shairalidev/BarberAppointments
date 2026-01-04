<template>
  <div class="admin-panel min-vh-100">
    <!-- Admin Header -->
    <div class="admin-header shadow-sm py-3 mb-4">
      <div class="container-fluid">
        <div class="row align-items-start justify-content-between">
          <div class="col">
            <h2 class="mb-0 fw-bold text-primary">
              <i class="fas fa-cut me-2"></i>{{ $t('admin.dashboard') }}
            </h2>
            <p class="text-muted mb-0 d-none d-md-block">{{ $t('admin.manageBookings') }}</p>
          </div>
          <div class="col-auto">
            <div class="d-flex align-items-center justify-content-end gap-2 gap-md-3 action-toolbar">
              <div class="d-none d-md-flex gap-2">
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
              </div>
              <div class="dropdown">
              <button class="btn btn-link text-decoration-none p-0 d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="d-flex flex-column gap-1 d-md-none me-2">
                  <button
                    @click.stop="toggleLanguage"
                    class="btn btn-outline-primary btn-sm px-2"
                    style="font-size: 0.6rem; padding: 0.2rem 0.4rem;"
                    :title="currentLocale === 'en' ? 'Switch to German' : 'Switch to English'"
                  >
                    {{ currentLocale === 'en' ? 'DE' : 'EN' }}
                  </button>
                  <button
                    @click.stop="toggleTheme"
                    :class="['theme-toggle', { active: isDark }]"
                    style="font-size: 0.7rem; padding: 0.2rem 0.4rem;"
                    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                  >
                    <i class="fas fa-sun theme-toggle-icon sun-icon"></i>
                    <i class="fas fa-moon theme-toggle-icon moon-icon"></i>
                  </button>
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
    <div class="mb-4">
      <div class="nav-tabs-wrapper">
        <ul class="nav nav-tabs border-0 mobile-nav flex-nowrap overflow-auto" role="tablist">
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
              @click="activeTab = 'customers'" 
              :class="['nav-link', 'fw-medium', activeTab === 'customers' ? 'active' : '']"
            >
              <i class="fas fa-users nav-icon"></i>
              <span class="nav-text">{{ $t('admin.customers') }}</span>
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
                <button @click="goToToday" class="btn btn-primary btn-sm">{{ $t('admin.today') }}</button>
                  <button @click="showBookingModal = true" class="btn btn-success btn-sm">
                    <i class="fas fa-plus me-1"></i>{{ $t('admin.bookAppointment') }}
                  </button>
              </div>
            </div>

            <div class="row g-3">
              <!-- Calendar Section -->
              <div class="col-12 col-lg-8">
                <div class="card border-0 shadow-sm calendar-card">
                  <div class="card-header py-3 d-none d-lg-block">
                    <div class="d-flex justify-content-between align-items-center">
                      <h5 class="mb-0"><i class="fas fa-calendar-alt me-2"></i>{{ $t('admin.calendar') }}</h5>
                      <div class="d-flex gap-2">
                        <button @click="showBookingModal = true" class="btn btn-sm btn-success">
                          <i class="fas fa-plus me-1"></i>{{ $t('admin.bookAppointment') }}
                        </button>
                        <button @click="changeMonth(-1)" class="btn btn-sm btn-outline-primary">
                          <i class="fas fa-chevron-left"></i>
                        </button>
                        <button @click="goToToday" class="btn btn-sm btn-primary">{{ $t('admin.today') }}</button>
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
                          'has-bookings': day.hasBookings,
                          'off-date': day.isOffDate
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
                    <h6 class="mb-0"><i class="fas fa-calendar-day me-2"></i><span class="d-none d-lg-inline">{{ formatSelectedDate }}</span><span class="d-lg-none">{{ formatSelectedDate }}</span></h6>
                      <small class="opacity-75">{{ selectedDayAppointments.length }} {{ $t('admin.appointments') }}</small>
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
                            <span class="price">{{ formatCurrency(apt.totalPrice) }}</span>
                            <span class="duration"><i class="fas fa-hourglass-half me-1"></i>{{ apt.totalDuration }}min</span>
                          </div>
                          <div v-if="apt.customerPhone" class="contact-info mb-2">
                            <small class="text-muted"><i class="fas fa-phone me-1"></i>{{ apt.customerPhone }}</small>
                          </div>
                        </div>
                        <div class="appointment-actions d-flex gap-2 justify-content-center">
                            <button v-if="apt.status === 'pending'" @click="openResponseModal(apt, 'confirmed')" class="btn btn-sm btn-success flex-fill">
                              <i class="fas fa-check me-1"></i>{{ $t('admin.accept') }}
                            </button>
                            <button v-if="apt.status === 'pending'" @click="openResponseModal(apt, 'cancelled')" class="btn btn-sm btn-outline-danger flex-fill">
                              <i class="fas fa-times me-1"></i>{{ $t('admin.reject') }}
                            </button>
                            <button v-if="apt.status === 'confirmed'" @click="openEditTimeModal(apt)" class="btn btn-sm btn-primary flex-fill">
                              <i class="fas fa-edit me-1"></i>{{ $t('common.edit') }}
                            </button>
                            <button v-if="apt.status === 'confirmed'" @click="openCancelModal(apt)" class="btn btn-sm btn-danger flex-fill">
                              <i class="fas fa-times me-1"></i>{{ $t('admin.reject') }}
                            </button>
                          <button v-if="apt.status === 'confirmed'" @click="setReminder(apt)" class="btn btn-sm btn-warning">
                            <i class="fas fa-bell"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else class="empty-state text-center py-4">
                      <i class="fas fa-calendar-times fa-2x text-muted mb-2"></i>
                      <p class="text-muted mb-0">{{ $t('admin.noAppointmentsScheduled') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Customers Tab -->
          <div v-if="activeTab === 'customers'" class="customers-tab">
            <div class="card border-0 shadow-sm mb-3">
              <div class="card-header py-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
                <div>
                  <h5 class="mb-0"><i class="fas fa-users me-2"></i>{{ $t('admin.customers') }}</h5>
                  <small class="text-muted">{{ filteredCustomers.length }} {{ $t('admin.customersFound') }}</small>
                </div>
                <div class="d-flex flex-column flex-sm-row gap-2 w-100 w-lg-auto">
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input v-model="customerSearch" type="search" class="form-control" :placeholder="$t('admin.searchCustomers')" />
                  </div>
                  <button @click="openNewCustomerModal" class="btn btn-primary d-flex align-items-center gap-2">
                    <i class="fas fa-user-plus"></i><span class="d-none d-sm-inline">{{ $t('admin.addCustomer') }}</span>
                  </button>
                </div>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table align-middle mb-0">
                    <thead class="bg-light">
                      <tr>
                        <th>{{ $t('admin.customer') }}</th>
                        <th>{{ $t('admin.phone') }}</th>
                        <th>{{ $t('admin.email') }}</th>
                        <th>{{ $t('admin.totalBookings') }}</th>
                        <th>{{ $t('admin.lastVisit') }}</th>
                        <th class="text-end">{{ $t('admin.actions') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="customer in filteredCustomers" :key="customer._id">
                        <td>
                          <div class="fw-bold">{{ customer.name }}</div>
                          <small class="text-muted">{{ customer.notes }}</small>
                        </td>
                        <td>{{ customer.phone }}</td>
                        <td>{{ customer.email || '-' }}</td>
                        <td><span class="badge bg-primary">{{ customer.totalBookings || 0 }}</span></td>
                        <td>{{ formatDate(customer.lastAppointmentDate) || '-' }}</td>
                        <td class="text-end">
                          <div class="d-flex justify-content-end gap-2 flex-wrap">
                            <button @click="editCustomer(customer)" class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                              <i class="fas fa-pen"></i><span class="d-none d-xl-inline">{{ $t('common.update') }}</span>
                            </button>
                            <button @click="prefillBookingFromCustomer(customer)" class="btn btn-sm btn-outline-success d-flex align-items-center gap-1">
                              <i class="fas fa-calendar-plus"></i><span class="d-none d-xl-inline">{{ $t('admin.bookAppointment') }}</span>
                            </button>
                            <button @click="confirmDeleteCustomer(customer)" class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
                              <i class="fas fa-trash"></i><span class="d-none d-xl-inline">{{ $t('common.delete') }}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="!filteredCustomers.length">
                        <td colspan="6" class="text-center py-4 text-muted">
                          <i class="fas fa-user-slash me-2"></i>{{ $t('admin.noCustomersFound') }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
                    <h5 class="mb-0"><i class="fas fa-cut me-2"></i>{{ $t('admin.servicesManagement') }}</h5>
                    <small class="text-muted">{{ services.length }} {{ $t('admin.servicesAvailable') }}</small>
                  </div>
                  <button @click="showServiceForm = true" class="btn btn-primary btn-sm">
                    <i class="fas fa-plus me-1"></i><span class="d-none d-sm-inline">{{ $t('admin.addService') }}</span>
                  </button>
                </div>
              </div>
              <div class="card-body p-2 p-lg-3">
                <!-- Service Form -->
                <div v-if="showServiceForm" class="service-form-card card mb-4">
                  <div class="card-header">
                    <h6 class="mb-0">{{ serviceForm._id ? $t('admin.editService') : $t('admin.addService') }}</h6>
                  </div>
                  <div class="card-body">
                    <form @submit.prevent="saveService">
                      <div class="row g-3">
                        <div class="col-12 col-md-6">
                          <label class="form-label fw-medium">{{ $t('admin.serviceName') }}</label>
                          <input v-model="serviceForm.name" type="text" class="form-control" required>
                        </div>
                        <div class="col-6 col-md-3">
                          <label class="form-label fw-medium">{{ $t('admin.durationMinutes') }}</label>
                          <input v-model="serviceForm.duration" type="number" class="form-control" required>
                        </div>
                        <div class="col-6 col-md-3">
                          <label class="form-label fw-medium">{{ $t('admin.price') }}</label>
                          <input v-model="serviceForm.price" type="number" step="0.01" class="form-control" required>
                        </div>
                        <div class="col-12">
                          <label class="form-label fw-medium">{{ $t('admin.description') }}</label>
                          <textarea v-model="serviceForm.description" class="form-control" rows="2" placeholder="Brief description of the service..."></textarea>
                        </div>
                      </div>
                      <div class="d-flex gap-2 mt-3">
                        <button type="submit" class="btn btn-success">
                          <i class="fas fa-save me-1"></i>{{ serviceForm._id ? $t('common.update') : $t('common.save') }} {{ $t('admin.service') }}
                        </button>
                        <button @click="cancelServiceForm" type="button" class="btn btn-outline-secondary">
                          <i class="fas fa-times me-1"></i>{{ $t('common.cancel') }}
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
                        <span class="badge bg-primary">{{ formatCurrency(service.price) }}</span>
                      </div>
                      <div class="service-details mb-3">
                        <div class="d-flex justify-content-between text-muted small mb-1">
                          <span><i class="fas fa-clock me-1"></i>{{ service.duration }} {{ $t('admin.minutes') }}</span>
                        </div>
                        <p class="text-muted small mb-0">{{ service.description || $t('admin.noDescriptionAvailable') }}</p>
                      </div>
                      <div class="service-actions d-flex gap-2">
                        <button @click="editService(service)" class="btn btn-sm btn-outline-primary flex-fill">
                          <i class="fas fa-edit me-1"></i>{{ $t('common.edit') }}
                        </button>
                        <button @click="deleteService(service._id)" class="btn btn-sm btn-outline-danger flex-fill">
                          <i class="fas fa-trash me-1"></i>{{ $t('common.delete') }}
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
                          <th>{{ $t('admin.serviceName') }}</th>
                          <th>{{ $t('admin.duration') }}</th>
                          <th>{{ $t('admin.price') }}</th>
                          <th>{{ $t('admin.description') }}</th>
                          <th class="text-center">{{ $t('admin.actions') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="service in services" :key="service._id">
                          <td class="fw-medium">{{ service.name }}</td>
                          <td>{{ service.duration }} {{ $t('admin.minutes') }}</td>
                          <td class="fw-bold text-success">{{ formatCurrency(service.price) }}</td>
                          <td class="text-muted">{{ service.description || $t('admin.noDescription') }}</td>
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
                  <h5 class="text-muted">{{ $t('admin.noServicesAvailable') }}</h5>
                  <p class="text-muted mb-3">{{ $t('admin.addFirstServicePrompt') }}</p>
                  <button @click="showServiceForm = true" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>{{ $t('admin.addFirstService') }}
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
                    <h5 class="mb-0"><i class="fas fa-clock me-2"></i>{{ $t('admin.weeklyTimeSlots') }}</h5>
                    <small class="text-muted">{{ $t('admin.manageWorkingHours') }}</small>
                  </div>
                </div>
              </div>
              <div class="card-body p-2 p-lg-3">
                <div v-if="primaryBarber" class="alert alert-info d-flex flex-column d-lg-flex-row justify-content-between align-items-start align-items-lg-center mb-4">
                  <span><i class="fas fa-info-circle me-2"></i>{{ $t('admin.managingTimeSlotsFor') }} <strong>{{ primaryBarber.name }}</strong></span>
                  <small class="text-muted mt-1 mt-lg-0">{{ $t('admin.totalSlots') }}: {{ timeSlots.length }}</small>
                </div>
                
                <div v-if="primaryBarber" class="timeslots-grid">
                  <div v-for="(day, index) in daysOfWeek" :key="index" class="day-schedule-card">
                    <div class="day-header">
                      <div class="day-info">
                        <h6 class="day-name">{{ day }}</h6>
                        <span class="slot-count">{{ getTimeSlotsForDay(index).length }} {{ $t('admin.slots') }}</span>
                      </div>
                      <div class="day-status">
                        <span :class="getTimeSlotsForDay(index).length ? 'status-active' : 'status-inactive'">
                          {{ getTimeSlotsForDay(index).length ? $t('admin.active') : $t('admin.closed') }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="add-slot-section">
                      <div class="add-slot-form">
                        <div class="time-inputs">
                          <div class="time-input-group">
                            <label class="time-label">{{ $t('admin.from') }}</label>
                            <input v-model="newSlot[index].startTime" type="time" class="time-input">
                          </div>
                          <div class="time-separator">{{ $t('admin.to') }}</div>
                          <div class="time-input-group">
                            <label class="time-label">{{ $t('admin.to') }}</label>
                            <input v-model="newSlot[index].endTime" type="time" class="time-input">
                          </div>
                        </div>
                        <button @click="addTimeSlot(index)" class="add-slot-btn">
                          <i class="fas fa-plus me-1"></i>{{ $t('admin.addSlot') }}
                        </button>
                      </div>
                    </div>
                    
                    <div class="slots-list">
                      <div v-if="getTimeSlotsForDay(index).length" class="slots-header">
                        <span class="slots-title">{{ $t('admin.workingHours') }}</span>
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
                          <p class="no-slots-text">{{ $t('admin.closedOn') }} {{ day }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-else class="text-center py-5">
                  <i class="fas fa-user-times fa-3x text-muted mb-3"></i>
                  <p class="text-muted">{{ $t('admin.noBarberFound') }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="profile-tab">
            <div class="row g-3 g-lg-4">
              <div class="col-12 col-lg-6">
                <div class="card border-0 shadow-sm">
                  <div class="card-header bg-gradient-primary text-white">
                    <h5 class="mb-0"><i class="fas fa-user-tie me-2"></i>{{ $t('admin.barberProfile') }}</h5>
                    <small class="opacity-75">{{ $t('admin.manageBusinessProfile') }}</small>
                  </div>
                  <div class="card-body p-3">
                    <form @submit.prevent="updateBarberProfile">
                      <div class="row g-2">
                        <div class="col-12 mb-2">
                          <label class="form-label fw-medium mb-1">{{ $t('admin.barberName') }}</label>
                          <input v-model="barberProfile.name" type="text" class="form-control" required>
                        </div>
                        <div class="col-12 mb-2">
                          <label class="form-label fw-medium mb-1">{{ $t('admin.email') }}</label>
                          <input v-model="barberProfile.email" type="email" class="form-control" placeholder="barber@example.com">
                          <small class="text-muted">{{ $t('admin.emailNotificationsInfo') }}</small>
                        </div>
                        <div class="col-12 mb-2">
                          <label class="form-label fw-medium mb-1">{{ $t('admin.specialties') }}</label>
                          <input v-model="barberProfile.specialties" type="text" class="form-control" placeholder="Haircut, Beard Trim, Styling">
                          <small class="text-muted">{{ $t('admin.specialtiesHelp') }}</small>
                        </div>
                        <div class="col-12 mb-2">
                          <label class="form-label fw-medium mb-1">{{ $t('admin.phone') }}</label>
                          <input v-model="barberProfile.phone" type="tel" class="form-control" placeholder="+1 (555) 123-4567">
                        </div>
                        <div class="col-12 mb-2">
                          <label class="form-label fw-medium mb-1">{{ $t('admin.bio') }}</label>
                          <textarea v-model="barberProfile.bio" class="form-control" rows="3" placeholder="Tell customers about yourself and your experience..."></textarea>
                        </div>
                      </div>
                      <div class="d-grid mt-3">
                        <button type="submit" class="btn btn-primary">
                          <i class="fas fa-save me-2"></i>{{ $t('admin.updateProfile') }}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-6">
                <div class="card border-0 shadow-sm">
                  <div class="card-header bg-gradient-success text-white">
                    <h5 class="mb-0"><i class="fas fa-user-shield me-2"></i>{{ $t('admin.adminSettings') }}</h5>
                    <small class="opacity-75">{{ $t('admin.manageAdminAccount') }}</small>
                  </div>
                  <div class="card-body p-3">
                    <form @submit.prevent="updateAdminProfile">
                      <div class="row g-2">
                        <div class="col-12 mb-2">
                          <label class="form-label fw-medium mb-1">{{ $t('admin.adminName') }}</label>
                          <input v-model="adminProfile.name" type="text" class="form-control" required>
                        </div>
                        <div class="col-12 mb-2">
                          <label class="form-label fw-medium mb-1">{{ $t('admin.email') }}</label>
                          <input v-model="adminProfile.email" type="email" class="form-control" required>
                        </div>
                        <div class="col-12">
                          <div class="password-section">
                            <h6 class="text-muted mb-2"><i class="fas fa-lock me-2"></i>{{ $t('admin.changePassword') }}</h6>
                            <div class="row g-2">
                              <div class="col-12 mb-2">
                                <label class="form-label fw-medium mb-1">{{ $t('admin.currentPassword') }}</label>
                                <div class="input-group">
                                  <input v-model="adminProfile.currentPassword" :type="showCurrentPassword ? 'text' : 'password'" class="form-control" :placeholder="$t('admin.enterCurrentPassword')">
                                  <button @click="showCurrentPassword = !showCurrentPassword" type="button" class="btn btn-outline-secondary">
                                    <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                  </button>
                                </div>
                              </div>
                              <div class="col-12 mb-2">
                                <label class="form-label fw-medium mb-1">{{ $t('admin.newPassword') }}</label>
                                <div class="input-group">
                                  <input v-model="adminProfile.newPassword" :type="showNewPassword ? 'text' : 'password'" class="form-control" :placeholder="$t('admin.enterNewPassword')">
                                  <button @click="showNewPassword = !showNewPassword" type="button" class="btn btn-outline-secondary">
                                    <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                  </button>
                                </div>
                              </div>
                              <div class="col-12 mb-2">
                                <label class="form-label fw-medium mb-1">{{ $t('admin.confirmNewPassword') }}</label>
                                <div class="input-group">
                                  <input v-model="adminProfile.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" class="form-control" :placeholder="$t('admin.confirmNewPassword')">
                                  <button @click="showConfirmPassword = !showConfirmPassword" type="button" class="btn btn-outline-secondary">
                                    <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="d-grid mt-3">
                        <button type="submit" class="btn btn-success">
                          <i class="fas fa-save me-2"></i>{{ $t('admin.updateSettings') }}
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
              {{ responseModal.status === 'confirmed' ? $t('admin.acceptBooking') : $t('admin.rejectBooking') }}
            </h5>
            <button @click="responseModal.show = false" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <p><strong>{{ $t('admin.customer') }}:</strong> {{ responseModal.appointment?.customerName }}</p>
            <p><strong>{{ $t('booking.date') }}:</strong> {{ formatDate(responseModal.appointment?.date) }} {{ $t('common.at') }} {{ responseModal.appointment?.time }}</p>
            <div class="mb-3">
              <label class="form-label">{{ $t('admin.messageToCustomer') }}</label>
              <textarea v-model="responseModal.message" class="form-control" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="responseModal.show = false" class="btn btn-secondary">{{ $t('common.cancel') }}</button>
            <button @click="respondToAppointment" :class="responseModal.status === 'confirmed' ? 'btn btn-success' : 'btn btn-danger'">
              {{ responseModal.status === 'confirmed' ? $t('admin.acceptAndNotify') : $t('admin.rejectAndNotify') }}
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
            <h5 class="modal-title"><i class="fas fa-plus me-2"></i>{{ $t('admin.bookNewAppointment') }}</h5>
            <button @click="showBookingModal = false" class="btn-close btn-close-white"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="quickBookAppointment">
              <div class="row g-3">
                <!-- Professional Date Picker -->
                <div class="col-12">
                  <label class="form-label fw-semibold mb-3 d-flex align-items-center">
                    <i class="fas fa-calendar-alt me-2 text-primary"></i>
                    <span>{{ $t('booking.date') }}</span>
                  </label>
                  <div class="professional-date-picker">
                    <!-- Month Navigation -->
                    <div class="date-picker-header-pro">
                      <button 
                        type="button"
                        @click="changeBookingMonth(-1)" 
                        class="month-nav-btn"
                        :disabled="isBookingMonthMin"
                        :class="{ 'disabled': isBookingMonthMin }"
                      >
                        <i class="fas fa-chevron-left"></i>
                      </button>
                      <div class="month-year-display">
                        <div class="month-name">{{ getBookingMonthYear }}</div>
                        <div class="year-badge">{{ bookingCalendarYear }}</div>
                      </div>
                      <button 
                        type="button"
                        @click="changeBookingMonth(1)" 
                        class="month-nav-btn"
                      >
                        <i class="fas fa-chevron-right"></i>
                      </button>
                    </div>
                    
                    <!-- Calendar Grid -->
                    <div class="calendar-container-pro">
                      <div class="weekdays-row">
                        <div v-for="day in ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']" :key="day" class="weekday-cell-pro">
                          {{ day }}
                        </div>
                      </div>
                      <div class="calendar-grid-pro">
                        <div 
                          v-for="day in bookingCalendarDays" 
                          :key="day.date"
                          @click="selectBookingDate(day.date)"
                          :class="['day-cell-pro', {
                            'other-month': !day.isCurrentMonth,
                            'today': day.isToday,
                            'selected': day.date === bookingForm.date,
                            'past': day.isPast,
                            'off-date': day.isOffDate
                          }]"
                        >
                          <span class="day-number-pro">{{ day.dayNumber }}</span>
                          <span v-if="day.isToday && !day.isSelected" class="today-indicator"></span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Selected Date Display -->
                    <div v-if="bookingForm.date" class="selected-date-pro">
                      <div class="selected-date-icon">
                        <i class="fas fa-check-circle"></i>
                      </div>
                      <div class="selected-date-info">
                        <div class="selected-date-label">Selected Date</div>
                        <div class="selected-date-value">{{ formatBookingSelectedDate }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Service Selection -->
                <div class="col-12">
                  <label class="form-label fw-semibold">
                    <i class="fas fa-cut me-2 text-primary"></i>{{ $t('admin.service') }}
                  </label>
                  <select v-model="bookingForm.serviceId" @change="updateBookingPrice" class="form-select form-select-lg" required>
                    <option value="">{{ $t('admin.selectService') }}</option>
                    <option v-for="service in services" :key="service._id" :value="service._id">
                      {{ service.name }} - {{ formatCurrency(service.price) }}
                    </option>
                  </select>
                </div>
                <div class="col-12" v-if="availableSlots.length">
                  <label class="form-label">{{ $t('booking.availableTimes') }}</label>
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
                <div class="col-12">
                  <label class="form-label d-flex align-items-center justify-content-between">
                    <span><i class="fas fa-users me-2"></i>{{ $t('admin.existingCustomers') }}</span>
                    <small class="text-muted">{{ $t('admin.selectToPrefill') }}</small>
                  </label>
                  <div class="customer-search-container">
                    <div class="input-group mb-2">
                      <span class="input-group-text"><i class="fas fa-search"></i></span>
                      <input
                        v-model="bookingCustomerSearch"
                        type="search"
                        class="form-control"
                        :placeholder="$t('admin.searchByNamePhoneEmail')"
                        @focus="showCustomerDropdown = true"
                      />
                      <button 
                        v-if="bookingCustomerSearch"
                        @click="clearCustomerSearch"
                        type="button" 
                        class="btn btn-outline-secondary"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    
                    <!-- Customer Dropdown -->
                    <div 
                      v-if="showCustomerDropdown && (bookingCustomerMatches.length || bookingCustomerSearch)"
                      class="customer-dropdown"
                    >
                      <div v-if="bookingCustomerMatches.length" class="customer-list">
                        <div
                          v-for="customer in bookingCustomerMatches.slice(0, 8)"
                          :key="customer._id"
                          class="customer-item"
                          @click="selectCustomerForBooking(customer)"
                        >
                          <div class="customer-info">
                            <div class="customer-name">
                              <i class="fas fa-user me-2 text-primary"></i>
                              <strong>{{ customer.name }}</strong>
                            </div>
                            <div class="customer-details">
                              <span class="phone"><i class="fas fa-phone me-1"></i>{{ customer.phone }}</span>
                              <span v-if="customer.email" class="email"><i class="fas fa-envelope me-1"></i>{{ customer.email }}</span>
                            </div>
                            <div v-if="customer.totalBookings" class="customer-stats">
                              <span class="badge bg-primary">{{ customer.totalBookings }} {{ $t('admin.bookings') }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else-if="bookingCustomerSearch && !bookingCustomerMatches.length" class="no-results">
                        <i class="fas fa-user-slash me-2"></i>{{ $t('admin.noCustomersFound') }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ $t('admin.customerName') }}</label>
                  <input v-model="bookingForm.customerName" type="text" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ $t('admin.phone') }}</label>
                  <input v-model="bookingForm.customerPhone" type="tel" class="form-control" required>
                </div>
                <div class="col-12">
                  <label class="form-label">{{ $t('admin.email') }} *</label>
                  <input v-model="bookingForm.customerEmail" type="email" class="form-control" required>
                </div>
                <div class="col-12" v-if="bookingForm.totalPrice">
                  <div class="alert alert-success">
                    <strong>{{ $t('admin.totalAmount') }}: {{ formatCurrency(bookingForm.totalPrice) }}</strong>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button @click="showBookingModal = false" class="btn btn-secondary">{{ $t('common.cancel') }}</button>
            <button @click="quickBookAppointment" class="btn btn-success" :disabled="!bookingForm.time">
              <i class="fas fa-check me-2"></i>{{ $t('admin.bookAppointment') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Modal -->
    <div v-if="showCustomerModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" @click.self="closeCustomerModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-gradient-primary text-white">
            <h5 class="modal-title">
              <i class="fas fa-user-edit me-2"></i>{{ customerForm._id ? $t('admin.editCustomer') : $t('admin.addCustomer') }}
            </h5>
            <button @click="closeCustomerModal" class="btn-close btn-close-white"></button>
          </div>
          <form @submit.prevent="saveCustomer">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">{{ $t('admin.customerName') }}</label>
                  <input v-model="customerForm.name" type="text" class="form-control" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ $t('admin.phone') }}</label>
                  <input v-model="customerForm.phone" type="tel" class="form-control" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ $t('admin.email') }}</label>
                  <input v-model="customerForm.email" type="email" class="form-control" />
                </div>
                <div class="col-12">
                  <label class="form-label">{{ $t('admin.notes') }}</label>
                  <textarea v-model="customerForm.notes" class="form-control" rows="2" :placeholder="$t('admin.customerNotesPlaceholder')"></textarea>
                </div>
                <div class="col-12">
                  <div class="form-check">
                    <input v-model="customerForm.marketingOptIn" class="form-check-input" type="checkbox" id="customerMarketingOptIn">
                    <label class="form-check-label" for="customerMarketingOptIn">
                      {{ $t('admin.marketingOptIn') }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" @click="closeCustomerModal" class="btn btn-outline-secondary">
                {{ $t('common.cancel') }}
              </button>
              <button type="submit" class="btn btn-success">
                <i class="fas fa-save me-1"></i>{{ customerForm._id ? $t('common.update') : $t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Customer Modal -->
    <div v-if="showDeleteCustomerModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" @click.self="closeDeleteCustomerModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title">
              <i class="fas fa-trash text-danger me-2"></i>{{ $t('admin.deleteCustomer') }}
            </h5>
            <button @click="closeDeleteCustomerModal" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">
              {{ $t('admin.deleteCustomerConfirm', { name: customerToDelete?.name || '' }) }}
            </p>
          </div>
          <div class="modal-footer border-0">
            <button @click="closeDeleteCustomerModal" class="btn btn-outline-secondary">
              {{ $t('common.cancel') }}
            </button>
            <button @click="deleteCustomer" class="btn btn-danger">
              <i class="fas fa-trash me-1"></i>{{ $t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- Cancel Appointment Modal -->
    <div v-if="cancelModal.show" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" @click.self="closeCancelModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="fas fa-times-circle me-2"></i>{{ $t('admin.reject') }} Appointment
            </h5>
            <button @click="closeCancelModal" class="btn-close btn-close-white"></button>
          </div>
          <div class="modal-body">
            <div v-if="cancelModal.appointment" class="mb-3">
              <p class="mb-1"><strong>Customer:</strong> {{ cancelModal.appointment.customerName }}</p>
              <p class="mb-1"><strong>Date & Time:</strong> {{ formatDate(cancelModal.appointment.date) }} at {{ cancelModal.appointment.time }}</p>
              <p class="mb-0"><strong>Services:</strong> {{ cancelModal.appointment.services?.map(s => s.name).join(', ') }}</p>
            </div>
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Are you sure you want to cancel this appointment? This action cannot be undone and an email will be sent to the customer.
            </div>
            <div class="mb-3">
              <label class="form-label">Cancellation Note (Optional)</label>
              <textarea 
                v-model="cancelModal.message" 
                class="form-control" 
                rows="4" 
                placeholder="Add a note explaining the cancellation reason (this will be included in the email notification to the customer)"
              ></textarea>
              <small class="text-muted">This message will be sent to the customer via email.</small>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeCancelModal" class="btn btn-secondary">{{ $t('common.cancel') }}</button>
            <button @click="confirmCancelAppointment" class="btn btn-danger">
              <i class="fas fa-times me-2"></i>{{ $t('admin.reject') }} Appointment
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Appointment Modal -->
    <div v-if="editTimeModal.show" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" @click.self="closeEditTimeModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-gradient-primary text-white">
            <h5 class="modal-title">
              <i class="fas fa-edit me-2"></i>{{ $t('admin.editAppointment') }}
            </h5>
            <button @click="closeEditTimeModal" class="btn-close btn-close-white"></button>
          </div>
          <div class="modal-body">
            <div v-if="editTimeModal.appointment" class="mb-3">
              <p class="mb-1"><strong>{{ $t('admin.customer') }}:</strong> {{ editTimeModal.appointment.customerName }}</p>
              <p class="mb-1"><strong>{{ $t('admin.currentDate') }}:</strong> {{ new Date(editTimeModal.appointment.date).toLocaleDateString() }}</p>
              <p class="mb-0"><strong>{{ $t('admin.currentTime') }}:</strong> {{ editTimeModal.appointment.time }}</p>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('admin.selectNewDate') }}</label>
              <input 
                v-model="editTimeModal.newDate" 
                type="date" 
                class="form-control"
                :min="todayDate"
                @change="onEditDateChange"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('admin.selectNewTime') }}</label>
              <div v-if="editTimeModal.availableTimes.length" class="time-slots-grid">
                <button 
                  v-for="slot in editTimeModal.availableTimes" 
                  :key="slot"
                  type="button"
                  @click="editTimeModal.newTime = slot"
                  :class="['btn', 'btn-sm', editTimeModal.newTime === slot ? 'btn-primary' : 'btn-outline-primary']"
                >
                  {{ slot }}
                </button>
              </div>
              <div v-else class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>{{ $t('admin.loadingAvailableSlots') }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('admin.messageOptional') }}</label>
              <textarea 
                v-model="editTimeModal.message" 
                class="form-control" 
                rows="3" 
                :placeholder="$t('admin.addNoteAboutChange')"
              ></textarea>
              <small class="text-muted">{{ $t('admin.messageWillBeSent') }}</small>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeEditTimeModal" class="btn btn-secondary">{{ $t('common.cancel') }}</button>
            <button @click="updateAppointmentTime" class="btn btn-primary" :disabled="!editTimeModal.newTime || !editTimeModal.newDate">
              <i class="fas fa-save me-2"></i>{{ $t('admin.updateAppointment') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Date Detail Modal -->
    <div v-if="dateDetailModal.show" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" @click.self="closeDateDetailModal">
      <div class="modal-dialog modal-xl modal-dialog-centered" style="max-width: 95%;">
        <div class="modal-content">
          <div class="modal-header bg-gradient-primary text-white">
            <div class="d-flex align-items-center justify-content-between w-100">
              <div>
                <h5 class="modal-title mb-0">
                  <i class="fas fa-calendar-day me-2"></i>{{ formatDateDetailHeader }}
                </h5>
                <small class="opacity-75">{{ dateDetailModal.appointments.length }} {{ $t('admin.appointments') }}</small>
              </div>
              <div class="d-flex align-items-center gap-3">
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="offDateToggle"
                    :checked="dateDetailModal.isRestricted"
                    @change="toggleOffDate"
                    style="width: 3rem; height: 1.5rem; cursor: pointer;"
                  >
                  <label class="form-check-label text-white fw-semibold" for="offDateToggle" style="cursor: pointer;">
                    <i class="fas fa-ban me-1"></i>{{ dateDetailModal.isRestricted ? 'Off Date' : 'Mark as Off Date' }}
                  </label>
                </div>
                <button @click="closeDateDetailModal" class="btn-close btn-close-white"></button>
              </div>
            </div>
          </div>
          <div class="modal-body p-0" style="max-height: 70vh; overflow-y: auto;">
            <div v-if="dateDetailModal.loading" class="text-center p-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="dateDetailModal.isRestricted" class="text-center p-5">
              <div class="alert alert-warning mb-0">
                <i class="fas fa-ban fa-3x mb-3"></i>
                <h5>This date is marked as an off date</h5>
                <p class="mb-0">No appointments can be booked for this date.</p>
              </div>
            </div>
            <div v-else class="date-time-schedule">
              <div class="schedule-header">
                <div class="time-column-header">Time</div>
                <div class="slots-column-header">
                  <div class="half-hour-slot-header">00</div>
                  <div class="half-hour-slot-header">30</div>
                </div>
              </div>
              <div class="schedule-body">
                <div 
                  v-for="hour in timeSlots" 
                  :key="hour"
                  class="schedule-row"
                >
                  <div class="time-column">
                    <span class="time-label">{{ hour }}</span>
                  </div>
                  <div class="slots-column">
                    <div 
                      v-for="(slot, index) in getHalfHourSlots(hour)" 
                      :key="`${hour}-${index}`"
                      class="half-hour-slot"
                      :class="{ 'has-appointment': slot.appointment }"
                    >
                      <div v-if="slot.appointment" class="appointment-block" :class="getAppointmentBlockClass(slot.appointment)">
                        <div class="appointment-content">
                          <div class="appointment-customer">{{ slot.appointment.customerName }}</div>
                          <div class="appointment-service">{{ getServiceNames(slot.appointment) }}</div>
                          <div class="appointment-time">{{ slot.appointment.time }}</div>
                        </div>
                      </div>
                      <div v-else class="empty-slot"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeDateDetailModal" class="btn btn-secondary">
              <i class="fas fa-times me-2"></i>{{ $t('common.close') }}
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
      customers: [],
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
        customerId: '',
        totalPrice: 0
      },
      todayDate: new Date().toISOString().split('T')[0],
      availableSlots: [],
      primaryBarber: null,
      showBookingModal: false,
      showCustomerModal: false,
      showDeleteCustomerModal: false,
      customerToDelete: null,
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
      toasts: [],
      toastId: 0,
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      customerSearch: '',
      customerForm: {
        _id: '',
        name: '',
        phone: '',
        email: '',
        notes: '',
        marketingOptIn: true
      },
      bookingCustomerSearch: '',
      showCustomerDropdown: false,
      dateDetailModal: {
        show: false,
        date: null,
        dateString: '',
        appointments: [],
        isRestricted: false,
        restriction: null,
        loading: false
      },
      restrictions: [],
      editTimeModal: {
        show: false,
        appointment: null,
        newDate: '',
        newTime: '',
        availableTimes: [],
        message: ''
      },
      cancelModal: {
        show: false,
        appointment: null,
        message: ''
      },
      bookingCalendarMonth: new Date().getMonth(),
      bookingCalendarYear: new Date().getFullYear()
    }
  },
  computed: {
    adminUser() {
      const user = localStorage.getItem('adminUser')
      return user ? JSON.parse(user) : null
    },
    pendingAppointments() {
      const today = new Date().toISOString().split('T')[0]
      return this.appointments.filter(appointment => {
        const aptDate = appointment.date.split('T')[0]
        return appointment.status === 'pending' && aptDate >= today
      })
    },
    filteredCustomers() {
      const term = this.customerSearch.toLowerCase()
      if (!term) return this.customers
      return this.customers.filter(c =>
        c.name?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
      )
    },
    bookingCustomerMatches() {
      const term = this.bookingCustomerSearch.toLowerCase().trim()
      if (!term) return this.customers.slice(0, 8)
      return this.customers.filter(c =>
        c.name?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.notes?.toLowerCase().includes(term)
      ).slice(0, 8)
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

      // Fill trailing days to complete the last week for proper weekday alignment
      const totalSlots = Math.ceil(days.length / 7) * 7
      const nextMonthStart = new Date(this.currentYear, this.currentMonth + 1, 1)
      while (days.length < totalSlots) {
        const date = new Date(nextMonthStart)
        date.setDate(nextMonthStart.getDate() + (days.length - (startDay + lastDay.getDate())))
        days.push(this.createDayObject(date, false))
      }

      return days
    },
    selectedDayAppointments() {
      if (!this.selectedCalendarDate) return []
      return this.appointments.filter(apt => {
        const aptDate = apt.date.split('T')[0]
        const today = new Date().toISOString().split('T')[0]
        // Only show today and future appointments
        return aptDate === this.selectedCalendarDate && aptDate >= today
      })
    },
    getBookingMonthYear() {
      const date = new Date(this.bookingCalendarYear, this.bookingCalendarMonth)
      return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
    },
    isBookingMonthMin() {
      const today = new Date()
      return this.bookingCalendarYear === today.getFullYear() && this.bookingCalendarMonth === today.getMonth()
    },
    bookingCalendarDays() {
      const firstDay = new Date(this.bookingCalendarYear, this.bookingCalendarMonth, 1)
      const lastDay = new Date(this.bookingCalendarYear, this.bookingCalendarMonth + 1, 0)
      const prevLastDay = new Date(this.bookingCalendarYear, this.bookingCalendarMonth, 0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Helper function to format date string using local date components (avoid UTC conversion)
      const formatDateString = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      
      const days = []
      const startDay = firstDay.getDay()
      const adjustedStartDay = startDay === 0 ? 6 : startDay - 1 // Monday = 0
      
      // Helper to check if date is off date
      const isOffDate = (dateStr) => {
        return this.restrictions.some(restriction => {
          const restrictionDate = new Date(restriction.date).toISOString().split('T')[0]
          return restrictionDate === dateStr
        })
      }
      
      // Previous month days
      for (let i = adjustedStartDay - 1; i >= 0; i--) {
        const date = new Date(this.bookingCalendarYear, this.bookingCalendarMonth - 1, prevLastDay.getDate() - i)
        const dateStr = formatDateString(date)
        days.push({
          date: dateStr,
          dayNumber: date.getDate(),
          isCurrentMonth: false,
          isToday: this.isSameDay(date, today),
          isPast: date < today,
          isOffDate: isOffDate(dateStr)
        })
      }
      
      // Current month days
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(this.bookingCalendarYear, this.bookingCalendarMonth, i)
        const dateStr = formatDateString(date)
        days.push({
          date: dateStr,
          dayNumber: i,
          isCurrentMonth: true,
          isToday: this.isSameDay(date, today),
          isPast: date < today,
          isOffDate: isOffDate(dateStr)
        })
      }
      
      // Next month days to fill the grid
      const totalSlots = Math.ceil(days.length / 7) * 7
      const nextMonthStart = new Date(this.bookingCalendarYear, this.bookingCalendarMonth + 1, 1)
      while (days.length < totalSlots) {
        const date = new Date(nextMonthStart)
        date.setDate(nextMonthStart.getDate() + (days.length - (adjustedStartDay + lastDay.getDate())))
        const dateStr = formatDateString(date)
        days.push({
          date: dateStr,
          dayNumber: date.getDate(),
          isCurrentMonth: false,
          isToday: this.isSameDay(date, today),
          isPast: date < today,
          isOffDate: isOffDate(dateStr)
        })
      }
      
      return days
    },
    formatBookingSelectedDate() {
      if (!this.bookingForm.date) return ''
      const date = new Date(this.bookingForm.date)
      return date.toLocaleDateString('de-DE', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    },
    formatSelectedDate() {
      if (!this.selectedCalendarDate) return ''
      return new Date(this.selectedCalendarDate).toLocaleDateString('en-US', { 
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
      })
    },
    formatDateDetailHeader() {
      if (!this.dateDetailModal.dateString) return ''
      const date = new Date(this.dateDetailModal.dateString + 'T00:00:00')
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      const dayName = dayNames[date.getDay()]
      const monthName = monthNames[date.getMonth()]
      return `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`
    },
    timeSlots() {
      // Generate time slots from 9:00 to 17:00 (9 AM to 5 PM)
      const slots = []
      for (let hour = 9; hour <= 17; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
      }
      return slots
    }
  },
  async mounted() {
    await this.fetchData()
    await this.fetchRestrictions()
    this.watchBookingFormChanges()
    this.loadAdminProfile()
    
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  watch: {
    'bookingForm.date'() {
      this.fetchAvailableSlots()
    },
    'bookingForm.serviceId'() {
      this.fetchAvailableSlots()
    },
    customerSearch() {
      this.fetchCustomers()
    }
  },
  methods: {
    async fetchData() {
      await Promise.all([
        this.fetchAppointments(),
        this.fetchBarbers(),
        this.fetchServices(),
        this.fetchTimeSlots(),
        this.fetchCustomers()
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
    resolveBackendMessage(message) {
      if (!message) return ''

      if (this.$te(message)) {
        return this.$t(message)
      }

      const namespacedKey = message.startsWith('backend.') ? message : `backend.${message}`
      if (this.$te(namespacedKey)) {
        return this.$t(namespacedKey)
      }

      return message
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
    async fetchCustomers() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/customers`, {
          params: this.customerSearch ? { q: this.customerSearch } : {}
        })
        this.customers = response.data
      } catch (error) {
        console.error('Error fetching customers:', error)
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
          status: newStatus,
          sendEmail: true // Always send emails when status changes (confirmation, completion, cancellation)
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
          this.showToast(this.$t('toast.noBarber'), 'warning')
          return
        }

        if (!this.bookingForm.serviceId || !this.bookingForm.time) {
          this.showToast(this.$t('toast.selectTimeSlot'), 'warning')
          return
        }
        
        if (!this.bookingForm.customerEmail) {
          this.showToast(this.$t('toast.emailRequired'), 'warning')
          return
        }
        
        // Prevent booking for past dates
        const selectedDate = new Date(this.bookingForm.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        selectedDate.setHours(0, 0, 0, 0)
        
        if (selectedDate < today) {
          this.showToast(this.$t('toast.cannotBookPastDate'), 'warning')
          return
        }
        
        const appointmentData = {
          customerId: this.bookingForm.customerId,
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
        this.showToast(this.$t('toast.bookingSuccess'), 'success')
      } catch (error) {
        console.error('Error booking appointment:', error)
        this.showToast(
          this.$t('toast.bookingError', { message: error.response?.data?.message || error.message }),
          'error'
        )
      }
    },
    resetBookingForm() {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      this.bookingForm = {
        date: todayStr,
        serviceId: '',
        time: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerId: '',
        totalPrice: 0
      }
      this.bookingCalendarMonth = today.getMonth()
      this.bookingCalendarYear = today.getFullYear()
      this.todayDate = todayStr
      this.availableSlots = []
      this.bookingCustomerSearch = ''
      this.showCustomerDropdown = false
    },
    updateBookingPrice() {
      const service = this.services.find(s => s._id === this.bookingForm.serviceId)
      this.bookingForm.totalPrice = service ? service.price : 0
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
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
    async openEditTimeModal(appointment) {
      this.editTimeModal.appointment = appointment
      const appointmentDate = appointment.date.split('T')[0]
      this.editTimeModal.newDate = appointmentDate
      this.editTimeModal.newTime = appointment.time
      this.editTimeModal.message = ''
      this.editTimeModal.show = true
      this.editTimeModal.availableTimes = []
      
      // Fetch available time slots for this appointment
      await this.fetchEditModalAvailableTimes()
    },
    async fetchEditModalAvailableTimes() {
      if (!this.editTimeModal.appointment || !this.editTimeModal.newDate) {
        return
      }
      
      try {
        const barberId = this.editTimeModal.appointment.barberId?._id || this.editTimeModal.appointment.barberId
        const duration = this.editTimeModal.appointment.totalDuration || 30
        
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/appointments/availability`, {
          params: {
            barberId: barberId,
            date: this.editTimeModal.newDate,
            duration: duration
          }
        })
        
        this.editTimeModal.availableTimes = response.data.availableTimes || []
        
        // If date hasn't changed, include current time if not in available times (for editing same appointment)
        const originalDate = this.editTimeModal.appointment.date.split('T')[0]
        if (this.editTimeModal.newDate === originalDate && !this.editTimeModal.availableTimes.includes(this.editTimeModal.appointment.time)) {
          this.editTimeModal.availableTimes.push(this.editTimeModal.appointment.time)
          this.editTimeModal.availableTimes.sort()
        }
        
        // Reset selected time if it's not available for the new date
        if (this.editTimeModal.availableTimes.length > 0 && !this.editTimeModal.availableTimes.includes(this.editTimeModal.newTime)) {
          this.editTimeModal.newTime = ''
        }
      } catch (error) {
        console.error('Error fetching available slots:', error)
        this.showToast('Error loading available time slots', 'error')
        this.editTimeModal.availableTimes = []
      }
    },
    async onEditDateChange() {
      // Reset time selection when date changes
      this.editTimeModal.newTime = ''
      await this.fetchEditModalAvailableTimes()
    },
    closeEditTimeModal() {
      this.editTimeModal.show = false
      this.editTimeModal.appointment = null
      this.editTimeModal.newDate = ''
      this.editTimeModal.newTime = ''
      this.editTimeModal.message = ''
      this.editTimeModal.availableTimes = []
    },
    async updateAppointmentTime() {
      if (!this.editTimeModal.appointment || !this.editTimeModal.newTime || !this.editTimeModal.newDate) {
        return
      }
      
      const originalDate = this.editTimeModal.appointment.date.split('T')[0]
      const dateChanged = this.editTimeModal.newDate !== originalDate
      const timeChanged = this.editTimeModal.newTime !== this.editTimeModal.appointment.time
      
      // Don't update if neither date nor time has changed
      if (!dateChanged && !timeChanged) {
        this.closeEditTimeModal()
        return
      }
      
      try {
        const updateData = {
          timeChangeMessage: this.editTimeModal.message,
          sendEmail: true
        }
        
        // Only include date if it changed
        if (dateChanged) {
          updateData.date = this.editTimeModal.newDate
        }
        
        // Only include time if it changed
        if (timeChanged) {
          updateData.time = this.editTimeModal.newTime
        }
        
        await axios.put(`${process.env.VUE_APP_API_URL}/appointments/${this.editTimeModal.appointment._id}`, updateData)
        
        await this.fetchAppointments()
        this.closeEditTimeModal()
        
        const changeMessage = dateChanged && timeChanged 
          ? this.$t('admin.appointmentDateAndTimeUpdated')
          : dateChanged 
            ? this.$t('admin.appointmentDateUpdated')
            : this.$t('admin.appointmentTimeUpdated')
        this.showToast(changeMessage, 'success')
      } catch (error) {
        console.error('Error updating appointment:', error)
        const errorMessage = error.response?.data?.message || 'Failed to update appointment'
        this.showToast(errorMessage, 'error')
        
        // If there are available times in the error, update the modal
        if (error.response?.data?.availableTimes) {
          this.editTimeModal.availableTimes = error.response.data.availableTimes
        }
      }
    },
    changeBookingMonth(direction) {
      this.bookingCalendarMonth += direction
      if (this.bookingCalendarMonth < 0) {
        this.bookingCalendarMonth = 11
        this.bookingCalendarYear--
      } else if (this.bookingCalendarMonth > 11) {
        this.bookingCalendarMonth = 0
        this.bookingCalendarYear++
      }
    },
    selectBookingDate(date) {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      selectedDate.setHours(0, 0, 0, 0)
      
      // Don't allow past dates
      if (selectedDate < today) {
        return
      }
      
      // Check if date is off date
      const isOffDate = this.restrictions.some(restriction => {
        const restrictionDate = new Date(restriction.date).toISOString().split('T')[0]
        return restrictionDate === date
      })
      
      if (isOffDate) {
        this.showToast('This date is not available for bookings (off date)', 'warning')
        return
      }
      
      this.bookingForm.date = date
      this.fetchAvailableSlots()
    },
    isSameDay(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate()
    },
async addTimeSlot(dayIndex) {
      if (!this.primaryBarber || !this.newSlot[dayIndex].startTime || !this.newSlot[dayIndex].endTime) {
        this.showToast(this.$t('toast.timeSlotRequired'), 'warning')
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
        this.showToast(this.$t('toast.timeSlotAdded'), 'success')
      } catch (error) {
        console.error('Error adding time slot:', error)
        this.showToast(
          this.$t('toast.timeSlotAddError', { message: error.response?.data?.message || error.message }),
          'error'
        )
      }
    },
    async deleteTimeSlot(id) {
      if (!confirm('Are you sure you want to delete this time slot?')) return
      try {
        await axios.delete(`${process.env.VUE_APP_API_URL}/timeslots/${id}`)
        await this.fetchTimeSlots()
        this.showToast(this.$t('toast.timeSlotDeleted'), 'success')
      } catch (error) {
        console.error('Error deleting time slot:', error)
        this.showToast(
          this.$t('toast.timeSlotDeleteError', { message: error.response?.data?.message || error.message }),
          'error'
        )
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
      // Create date string in local timezone to avoid UTC conversion issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      const bookings = this.appointments.filter(apt => {
        const aptDate = apt.date.split('T')[0]
        return aptDate === dateStr
      })
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dayDate = new Date(date)
      dayDate.setHours(0, 0, 0, 0)
      
      // Check if this date is restricted (off date)
      const isOffDate = this.restrictions.some(restriction => {
        const restrictionDate = new Date(restriction.date).toISOString().split('T')[0]
        return restrictionDate === dateStr
      })
      
      return {
        date: dateStr,
        dayNumber: date.getDate(),
        isCurrentMonth,
        isToday: this.isToday(date),
        isPast: dayDate < today,
        hasBookings: bookings.length > 0,
        bookingCount: bookings.length,
        isOffDate: isOffDate
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
        this.openDateDetailModal(day.date)
      }
    },
    async openDateDetailModal(date) {
      this.dateDetailModal.show = true
      this.dateDetailModal.date = date
      this.dateDetailModal.dateString = date
      this.dateDetailModal.loading = true
      
      try {
        // Check if date is restricted
        const restrictionCheck = await axios.get(`${process.env.VUE_APP_API_URL}/restrictions/check/${date}`)
        this.dateDetailModal.isRestricted = restrictionCheck.data.isRestricted
        this.dateDetailModal.restriction = restrictionCheck.data.restriction
        
        // Fetch appointments for this date
        if (!this.dateDetailModal.isRestricted) {
          const dateAppointments = this.appointments.filter(apt => {
            const aptDate = apt.date.split('T')[0]
            return aptDate === date
          })
          this.dateDetailModal.appointments = dateAppointments.sort((a, b) => {
            return a.time.localeCompare(b.time)
          })
        } else {
          this.dateDetailModal.appointments = []
        }
      } catch (error) {
        console.error('Error loading date details:', error)
        this.showToast('Error loading date details', 'error')
      } finally {
        this.dateDetailModal.loading = false
      }
    },
    closeDateDetailModal() {
      this.dateDetailModal.show = false
      this.dateDetailModal.date = null
      this.dateDetailModal.dateString = ''
      this.dateDetailModal.appointments = []
      this.dateDetailModal.isRestricted = false
      this.dateDetailModal.restriction = null
    },
    async toggleOffDate(event) {
      const isRestricted = event.target.checked
      const date = this.dateDetailModal.dateString
      
      try {
        if (isRestricted) {
          // Mark as off date
          await axios.post(`${process.env.VUE_APP_API_URL}/restrictions`, {
            date: date,
            reason: 'Off Date'
          })
          this.dateDetailModal.isRestricted = true
          this.showToast('Date marked as off date', 'success')
          
          // Refresh restrictions list
          await this.fetchRestrictions()
          
          // Refresh appointments to update calendar
          await this.fetchAppointments()
        } else {
          // Remove off date
          await axios.delete(`${process.env.VUE_APP_API_URL}/restrictions/date/${date}`)
          this.dateDetailModal.isRestricted = false
          this.dateDetailModal.restriction = null
          this.showToast('Off date removed', 'success')
          
          // Refresh restrictions list
          await this.fetchRestrictions()
          
          // Reload appointments for this date
          const dateAppointments = this.appointments.filter(apt => {
            const aptDate = apt.date.split('T')[0]
            return aptDate === date
          })
          this.dateDetailModal.appointments = dateAppointments.sort((a, b) => {
            return a.time.localeCompare(b.time)
          })
        }
      } catch (error) {
        console.error('Error toggling off date:', error)
        this.showToast(error.response?.data?.message || 'Error updating off date', 'error')
        // Revert checkbox
        event.target.checked = !isRestricted
      }
    },
    async fetchRestrictions() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/restrictions`)
        this.restrictions = response.data
      } catch (error) {
        console.error('Error fetching restrictions:', error)
      }
    },
    getHalfHourSlots(hour) {
      // Return two half-hour slots: :00 and :30
      const slots = [
        { time: `${hour}:00`, appointment: null },
        { time: `${hour}:30`, appointment: null }
      ]
      
      // Find appointments that match these time slots
      this.dateDetailModal.appointments.forEach(apt => {
        const aptTime = apt.time
        if (aptTime === `${hour}:00`) {
          slots[0].appointment = apt
        } else if (aptTime === `${hour}:30`) {
          slots[1].appointment = apt
        }
      })
      
      return slots
    },
    getServiceNames(appointment) {
      if (!appointment.services || !appointment.services.length) {
        return 'No service'
      }
      if (Array.isArray(appointment.services)) {
        return appointment.services.map(s => s.name || s).join(', ')
      }
      return appointment.services
    },
    getAppointmentBlockClass(appointment) {
      // Return different classes based on appointment status
      const status = appointment.status || 'confirmed'
      return {
        'appointment-confirmed': status === 'confirmed',
        'appointment-pending': status === 'pending',
        'appointment-completed': status === 'completed',
        'appointment-cancelled': status === 'cancelled'
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const parsed = new Date(dateStr)
      if (isNaN(parsed)) return ''
      return parsed.toLocaleDateString('en-US', { 
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
        // Skip frontend availability check when accepting pending appointments
        // The backend will handle proper conflict detection
        
        await axios.put(`${process.env.VUE_APP_API_URL}/appointments/${this.responseModal.appointment._id}`, {
          status: this.responseModal.status,
          responseMessage: this.responseModal.message,
          sendEmail: true
        })
        
        await this.fetchAppointments()
        this.responseModal.show = false
        
        const statusKey = this.responseModal.status === 'confirmed'
          ? 'toast.appointmentAccepted'
          : 'toast.appointmentRejected'
        this.showToast(this.$t(statusKey), 'success')
      } catch (error) {
        console.error('Error responding to appointment:', error)
        const errorMsg = this.resolveBackendMessage(error.response?.data?.message || error.message)
        if (error.response?.status === 409 || errorMsg.toLowerCase().includes('conflict')) {
          this.showToast(this.$t('toast.conflictWarning', { message: errorMsg }), 'warning')
        } else {
          this.showToast(this.$t('toast.appointmentUpdateError', { message: errorMsg }), 'error')
        }
      }
    },

async setReminder(appointment) {
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_URL}/appointments/${appointment._id}/reminder`)
        
        if (response.data.scheduledFor) {
          const scheduledTime = new Date(response.data.scheduledFor).toLocaleTimeString()
          this.showToast(this.$t('toast.reminderScheduled', { time: scheduledTime }), 'success')
        } else {
          this.showToast(this.$t('toast.reminderInfo', { message: response.data.message }), 'info')
        }
      } catch (error) {
        console.error('Error setting reminder:', error)
        this.showToast(
          this.$t('toast.reminderError', { message: error.response?.data?.message || error.message }),
          'error'
        )
      }
    },
    openCancelModal(appointment) {
      this.cancelModal = {
        show: true,
        appointment,
        message: ''
      }
    },
    closeCancelModal() {
      this.cancelModal.show = false
      this.cancelModal.appointment = null
      this.cancelModal.message = ''
    },
    async confirmCancelAppointment() {
      if (!this.cancelModal.appointment) {
        return
      }
      
      try {
        await axios.put(`${process.env.VUE_APP_API_URL}/appointments/${this.cancelModal.appointment._id}`, {
          status: 'cancelled',
          responseMessage: this.cancelModal.message || 'Appointment has been cancelled.',
          sendEmail: true
        })
        
        await this.fetchAppointments()
        this.closeCancelModal()
        this.showToast('Appointment cancelled successfully. Customer has been notified.', 'success')
      } catch (error) {
        console.error('Error cancelling appointment:', error)
        const errorMessage = error.response?.data?.message || 'Failed to cancel appointment'
        this.showToast(errorMessage, 'error')
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
        this.showToast(this.$t('toast.barberProfileUpdated'), 'success')
      } catch (error) {
        console.error('Error updating barber profile:', error)
        this.showToast(this.$t('toast.profileUpdateError'), 'error')
      }
    },
    async updateAdminProfile() {
      try {
        if (this.adminProfile.newPassword && this.adminProfile.newPassword !== this.adminProfile.confirmPassword) {
          this.showToast(this.$t('toast.passwordMismatch'), 'warning')
          return
        }

        if (!this.adminProfile.name.trim()) {
          this.showToast(this.$t('toast.adminNameRequired'), 'warning')
          return
        }

        if (!this.adminProfile.email.trim()) {
          this.showToast(this.$t('toast.emailRequired'), 'warning')
          return
        }
        
        const updateData = {
          name: this.adminProfile.name.trim(),
          email: this.adminProfile.email.trim()
        }
        
        if (this.adminProfile.newPassword) {
          if (!this.adminProfile.currentPassword) {
            this.showToast(this.$t('toast.currentPasswordRequired'), 'warning')
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
        
        this.showToast(this.$t('toast.settingsUpdated'), 'success')
        this.adminProfile.currentPassword = ''
        this.adminProfile.newPassword = ''
        this.adminProfile.confirmPassword = ''
        
        // Reload admin profile data
        this.loadAdminProfile()
      } catch (error) {
        console.error('Error updating admin profile:', error)
        this.showToast(
          this.$t('toast.settingsUpdateError', { message: error.response?.data?.message || error.message }),
          'error'
        )
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
    startNewCustomer() {
      this.customerForm = {
        _id: '',
        name: '',
        phone: '',
        email: '',
        notes: '',
        marketingOptIn: true
      }
    },
    openNewCustomerModal() {
      this.startNewCustomer()
      this.activeTab = 'customers'
      this.showCustomerModal = true
    },
    editCustomer(customer) {
      this.customerForm = { ...customer, marketingOptIn: customer.marketingOptIn ?? true }
      this.activeTab = 'customers'
      this.showCustomerModal = true
    },
    closeCustomerModal() {
      this.showCustomerModal = false
      this.startNewCustomer()
    },
    async saveCustomer() {
      if (!this.customerForm.name.trim() || !this.customerForm.phone.trim()) {
        this.showToast(this.$t('toast.customerRequired'), 'warning')
        return
      }
      try {
        if (this.customerForm._id) {
          await axios.put(`${process.env.VUE_APP_API_URL}/customers/${this.customerForm._id}`, this.customerForm)
          this.showToast(this.$t('toast.customerUpdated'), 'success')
        } else {
          await axios.post(`${process.env.VUE_APP_API_URL}/customers`, this.customerForm)
          this.showToast(this.$t('toast.customerCreated'), 'success')
        }
        await this.fetchCustomers()
        this.closeCustomerModal()
      } catch (error) {
        const message = error.response?.data?.message || error.message
        this.showToast(this.$t('toast.customerSaveError', { message }), 'error')
      }
    },
    confirmDeleteCustomer(customer) {
      this.customerToDelete = customer
      this.showDeleteCustomerModal = true
    },
    closeDeleteCustomerModal() {
      this.showDeleteCustomerModal = false
      this.customerToDelete = null
    },
    async deleteCustomer() {
      if (!this.customerToDelete) return
      try {
        await axios.delete(`${process.env.VUE_APP_API_URL}/customers/${this.customerToDelete._id}`)
        this.showToast(this.$t('toast.customerDeleted'), 'success')
        await this.fetchCustomers()
      } catch (error) {
        const message = error.response?.data?.message || error.message
        this.showToast(this.$t('toast.customerDeleteError', { message }), 'error')
      } finally {
        this.closeDeleteCustomerModal()
      }
    },
    prefillBookingFromCustomer(customer) {
      this.bookingForm.customerId = customer._id
      this.bookingForm.customerName = customer.name
      this.bookingForm.customerPhone = customer.phone
      this.bookingForm.customerEmail = customer.email || ''
      this.showBookingModal = true
    },
    selectCustomerForBooking(customer) {
      this.prefillBookingFromCustomer(customer)
      this.showCustomerDropdown = false
      this.bookingCustomerSearch = customer.name
    },
    clearCustomerSearch() {
      this.bookingCustomerSearch = ''
      this.showCustomerDropdown = false
      this.bookingForm.customerId = ''
      this.bookingForm.customerName = ''
      this.bookingForm.customerPhone = ''
      this.bookingForm.customerEmail = ''
    },
    handleClickOutside(event) {
      const dropdown = event.target.closest('.customer-search-container')
      if (!dropdown) {
        this.showCustomerDropdown = false
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
        success: this.$t('common.success'),
        error: this.$t('common.error'),
        warning: this.$t('common.warning'),
        info: this.$t('common.info')
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
    /*padding: 0 2rem;*/
  }
  
  .admin-content {
    /*padding: 0 2rem;*/
  }
  
  .calendar-tab .row {
    height: calc(100vh - 250px);
    min-height: 600px;
  }
  
  .calendar-card,
  .appointments-card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .calendar-card .card-body,
  .appointments-card .card-body {
    flex: 1;
    overflow: hidden;
  }
  
  .appointments-list {
    height: 100%;
    overflow-y: auto;
  }
  

  
  .timeslots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
}

.admin-header {
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary) !important;
}

.action-toolbar {
  min-width: 260px;
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
  overflow-x: auto;
}

.nav-tabs .nav-link {
  border: none;
  border-radius: 10px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  padding: 0.875rem 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  min-height: 48px;
}

.nav-tabs .nav-icon {
  font-size: 1.1rem;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.nav-tabs .nav-text {
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
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
  align-items: stretch;
  justify-content: flex-start;
  gap: 0.25rem;
  white-space: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.mobile-nav::-webkit-scrollbar {
  display: none;
}

.nav-badge {
  margin-left: auto;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

@media (max-width: 991px) {
  .action-toolbar {
    width: 100%;
  }

  .admin-header {
    padding: 0.5rem 0 !important;
  }

  .admin-header .row {
    align-items: center;
  }

  .admin-header .action-toolbar {
    justify-content: flex-end;
    min-width: auto;
  }

  .nav-tabs-wrapper {
    padding: 0.375rem;
    margin: 0 0.25rem 1rem 0.25rem;
  }

  .mobile-nav {
    gap: 0.25rem;
    justify-content: flex-start;
    flex-wrap: nowrap;
  }

  .mobile-nav .nav-item {
    flex: 0 0 auto;
    min-width: 90px;
  }

  .mobile-nav .nav-link {
    padding: 0.625rem 0.75rem;
    text-align: center;
    font-size: 0.8rem;
    min-width: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    min-height: 60px;
  }

  .mobile-nav .nav-icon {
    font-size: 1rem !important;
    margin-bottom: 0;
    width: auto;
  }

  .mobile-nav .nav-text {
    font-size: 0.7rem !important;
    line-height: 1.2;
    font-weight: 500;
  }

  .nav-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    min-width: 16px;
    height: 16px;
    font-size: 0.65rem;
  }
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

  .nav-tabs-wrapper {
    padding: 0.5rem;
    margin: 0 0.25rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .mobile-nav .nav-link {
    padding: 0.75rem 0.5rem;
    min-width: 85px;
    white-space: nowrap;
  }

  .mobile-nav .nav-text {
    font-size: 0.75rem !important;
    font-weight: 500;
  }

  .mobile-nav .nav-icon {
    font-size: 1.1rem !important;
    margin-bottom: 0.25rem;
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
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-color);
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
    min-width: 150px;
  }

  .nav-link {
    padding: 0.65rem 0.75rem;
    text-align: left;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .nav-text {
    font-size: 0.85rem;
  }

  .nav-icon {
    font-size: 1rem;
    margin-bottom: 0;
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

  .admin-header h2 {
    font-size: 1.2rem;
  }

  .admin-header p {
    font-size: 0.8rem;
  }

  .admin-avatar {
    width: 60px;
    height: 60px;
    font-size: 1rem;
  }

  .admin-info {
    font-size: 0.8rem;
  }

  .nav-tabs-wrapper {
    padding: 0.2rem;
  }

  .mobile-nav .nav-link {
    padding: 0.3rem 0.1rem;
  }

  .nav-icon {
    font-size: 0.7rem !important;
  }

  .nav-text {
    font-size: 0.55rem !important;
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

/* Customer Search Dropdown */
.customer-search-container {
  position: relative;
}

.customer-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.customer-list {
  padding: 0.5rem 0;
}

.customer-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--border-color);
}

.customer-item:last-child {
  border-bottom: none;
}

.customer-item:hover {
  background-color: var(--bg-tertiary);
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.customer-name {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--text-primary);
}

.customer-details {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.customer-stats {
  margin-top: 0.25rem;
}

.no-results {
  padding: 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .customer-dropdown {
    max-height: 250px;
  }
  
  .customer-details {
    flex-direction: column;
    gap: 0.25rem;
  }
}

.customer-pills .customer-chip {
  border-radius: 999px;
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

/* Professional Date Picker Styles */
.professional-date-picker {
  background: white;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.date-picker-header-pro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
}

.month-nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.month-nav-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.month-nav-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.month-year-display {
  text-align: center;
  flex: 1;
}

.month-name {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.year-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.25);
  padding: 4px 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.calendar-container-pro {
  padding: 1.5rem;
}

.weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.weekday-cell-pro {
  text-align: center;
  font-weight: 600;
  font-size: 0.75rem;
  color: #64748b;
  padding: 10px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calendar-grid-pro {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-cell-pro {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  background: #f8fafc;
  position: relative;
  min-height: 48px;
}

.day-cell-pro:hover:not(.past):not(.other-month):not(.selected) {
  background: #e0f2fe;
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.day-cell-pro.today:not(.selected) {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
  font-weight: 700;
}

.day-cell-pro.today:not(.selected) .day-number-pro {
  color: #1e40af;
}

.day-cell-pro.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #5a67d8;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  transform: scale(1.08);
  z-index: 2;
}

.day-cell-pro.selected .day-number-pro {
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
}

.day-cell-pro.other-month {
  opacity: 0.25;
  cursor: not-allowed;
  background: transparent;
}

.day-cell-pro.past {
  opacity: 0.35;
  cursor: not-allowed;
  background: #f1f5f9;
}

.day-cell-pro.past:hover {
  transform: none;
  background: #f1f5f9;
  box-shadow: none;
}

.day-number-pro {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.3s ease;
}

.today-indicator {
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  background: #3b82f6;
  border-radius: 50%;
}

.selected-date-pro {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-top: 2px solid #3b82f6;
  margin-top: 0;
}

.selected-date-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.selected-date-info {
  flex: 1;
}

.selected-date-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.selected-date-value {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

/* Dark mode styles for professional calendar */
.dark-theme .professional-date-picker {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.dark-theme .date-picker-header-pro {
  background: linear-gradient(135deg, #4c51bf 0%, #553c9a 100%);
}

.dark-theme .calendar-container-pro {
  background: var(--bg-secondary);
}

.dark-theme .weekday-cell-pro {
  color: var(--text-secondary);
}

.dark-theme .day-cell-pro {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

.dark-theme .day-cell-pro:hover:not(.past):not(.other-month):not(.selected) {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.dark-theme .day-cell-pro.today:not(.selected) {
  background: rgba(102, 126, 234, 0.25);
  border-color: #667eea;
}

.dark-theme .day-cell-pro.today:not(.selected) .day-number-pro {
  color: #ffffff !important;
}

.dark-theme .day-cell-pro.past {
  background: var(--bg-primary);
  opacity: 0.4;
}

.dark-theme .day-cell-pro.past .day-number-pro {
  color: rgba(255, 255, 255, 0.5) !important;
}

.dark-theme .day-number-pro {
  color: #ffffff !important;
}

.dark-theme .day-cell-pro.other-month .day-number-pro {
  color: rgba(255, 255, 255, 0.3) !important;
}

.dark-theme .selected-date-pro {
  background: rgba(102, 126, 234, 0.1);
  border-top-color: #667eea;
}

.dark-theme .selected-date-value {
  color: #ffffff !important;
}

.dark-theme .selected-date-label {
  color: rgba(255, 255, 255, 0.7) !important;
}

@media (max-width: 768px) {
  .date-picker-header-pro {
    padding: 1rem;
  }
  
  .month-name {
    font-size: 1.1rem;
  }
  
  .calendar-container-pro {
    padding: 1rem;
  }
  
  .day-cell-pro {
    min-height: 44px;
  }
  
  .day-number-pro {
    font-size: 0.85rem;
  }
  
  .weekday-cell-pro {
    font-size: 0.7rem;
    padding: 8px 0;
  }
  
  .selected-date-pro {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
  }
  
  .selected-date-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .calendar-day-cell {
    font-size: 0.8rem;
  }
  
  .weekday-header {
    font-size: 0.75rem;
    padding: 6px 2px;
  }
  
  .day-number {
    font-size: 0.85rem;
  }
  
  .date-picker-header {
    padding: 0.75rem !important;
  }
  
  .date-picker-header h6 {
    font-size: 0.9rem;
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
/* Date Detail Modal Styles */
.date-time-schedule {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.schedule-header {
  display: flex;
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  position: sticky;
  top: 0;
  z-index: 10;
}

.time-column-header {
  width: 80px;
  padding: 12px;
  font-weight: 600;
  color: #495057;
  text-align: center;
  border-right: 1px solid #dee2e6;
}

.slots-column-header {
  flex: 1;
  display: flex;
  border-right: 1px solid #dee2e6;
}

.half-hour-slot-header {
  flex: 1;
  padding: 12px;
  font-weight: 600;
  color: #495057;
  text-align: center;
  border-right: 1px solid #e9ecef;
}

.half-hour-slot-header:last-child {
  border-right: none;
}

.schedule-body {
  display: flex;
  flex-direction: column;
}

.schedule-row {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  min-height: 80px;
}

.schedule-row:hover {
  background-color: #f8f9fa;
}

.time-column {
  width: 80px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #dee2e6;
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.time-label {
  font-size: 0.95rem;
}

.slots-column {
  flex: 1;
  display: flex;
}

.half-hour-slot {
  flex: 1;
  padding: 8px;
  border-right: 1px solid #e9ecef;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.half-hour-slot:last-child {
  border-right: none;
}

.half-hour-slot.has-appointment {
  padding: 4px;
}

.empty-slot {
  width: 100%;
  height: 100%;
  background: transparent;
  border: 1px dashed #e9ecef;
  border-radius: 4px;
}

.appointment-block {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.appointment-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.appointment-confirmed {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.appointment-pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.appointment-completed {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.appointment-cancelled {
  background: #e9ecef;
  color: #6c757d;
  opacity: 0.7;
}

.appointment-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.appointment-customer {
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.2;
}

.appointment-service {
  font-size: 0.75rem;
  opacity: 0.9;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.appointment-time {
  font-size: 0.7rem;
  opacity: 0.8;
  margin-top: auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .time-column {
    width: 60px;
    padding: 8px;
  }
  
  .time-column-header {
    width: 60px;
    padding: 8px;
  }
  
  .half-hour-slot {
    padding: 4px;
    min-height: 60px;
  }
  
  .appointment-block {
    padding: 6px;
  }
  
  .appointment-customer {
    font-size: 0.8rem;
  }
  
  .appointment-service {
    font-size: 0.7rem;
  }
  
  .appointment-time {
    font-size: 0.65rem;
  }
}

/* Off date indicator in calendar */
.calendar-day.off-date {
  background-color: #fff3cd;
  border: 2px solid #ffc107;
}

.calendar-day.off-date .day-number {
  color: #856404;
  font-weight: 600;
}

.calendar-day.off-date::after {
  content: '🚫';
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 0.7rem;
}

</style>
