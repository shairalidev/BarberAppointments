<template>
  <div class="admin-panel min-vh-100">
    <!-- Admin Header -->
    <div class="admin-header shadow-sm">
      <div class="admin-header-inner">
        <!-- Brand Logo -->
        <div class="admin-brand-section">
          <img :src="isDark ? '/logo.png' : '/logo1.png'" alt="Ates Barberos" class="admin-brand-logo">
        </div>

        <!-- Action Toolbar -->
        <div class="admin-toolbar">
          <button
            @click="toggleLanguage"
            class="toolbar-btn toolbar-btn-outline"
            :title="currentLocale === 'en' ? 'Switch to German' : 'Switch to English'"
          >
            {{ currentLocale === 'en' ? 'DE' : 'EN' }}
          </button>
          <div
            @click="toggleTheme"
            :class="['theme-switch', { active: isDark }]"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <i class="fas fa-sun theme-switch-icon"></i>
            <span class="theme-switch-slider"></span>
            <i class="fas fa-moon theme-switch-icon"></i>
          </div>

          <!-- Admin Account Dropdown -->
          <div class="dropdown">
            <button class="toolbar-btn admin-avatar-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-user-shield"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-lg admin-dropdown">
              <li><h6 class="dropdown-header">{{ $t('admin.adminAccount') }}</h6></li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button @click.stop="logout" type="button" class="logout-btn">
                  <i class="fas fa-sign-out-alt"></i>
                  <span>{{ $t('admin.logout') }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="admin-nav-container">
      <nav class="admin-nav" role="tablist">
        <button
          @click="activeTab = 'calendar'"
          :class="['admin-nav-item', { active: activeTab === 'calendar' }]"
          role="tab"
        >
          <i class="fas fa-calendar-alt"></i>
          <span>{{ $t('admin.calendar') }}</span>
        </button>
        <button
          @click="activeTab = 'customers'"
          :class="['admin-nav-item', { active: activeTab === 'customers' }]"
          role="tab"
        >
          <i class="fas fa-users"></i>
          <span>{{ $t('admin.customers') }}</span>
        </button>
        <button
          @click="activeTab = 'services'"
          :class="['admin-nav-item', { active: activeTab === 'services' }]"
          role="tab"
        >
          <i class="fas fa-cut"></i>
          <span>{{ $t('admin.services') }}</span>
        </button>
        <button
          @click="activeTab = 'timeslots'"
          :class="['admin-nav-item', { active: activeTab === 'timeslots' }]"
          role="tab"
        >
          <i class="fas fa-clock"></i>
          <span>{{ $t('admin.slots') }}</span>
        </button>
        <button
          @click="activeTab = 'profile'"
          :class="['admin-nav-item', { active: activeTab === 'profile' }]"
          role="tab"
        >
          <i class="fas fa-user-cog"></i>
          <span>{{ $t('admin.profile') }}</span>
        </button>
      </nav>
    </div>

    <div class="container-fluid admin-content">

          <!-- Calendar & Booking Tab -->
          <div v-if="activeTab === 'calendar'" class="calendar-tab">
            <!-- Mobile Calendar Controls -->
            <div class="mobile-calendar-controls d-lg-none">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <!-- Calendar View Navigation -->
                <template v-if="calendarViewMode === 'calendar'">
                  <button @click="changeMonth(-1)" class="btn btn-outline-primary btn-sm">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <h6 class="mb-0 fw-bold">{{ currentMonthYear }}</h6>
                  <button @click="changeMonth(1)" class="btn btn-outline-primary btn-sm">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </template>
                <!-- Day View Navigation -->
                <template v-else>
                  <button @click="navigateDayView(-1)" class="btn btn-outline-primary btn-sm">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <h6 class="mb-0 fw-bold">{{ formatDayViewDate }}</h6>
                  <button @click="navigateDayView(1)" class="btn btn-outline-primary btn-sm">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </template>
              </div>
              <div class="d-flex gap-2 justify-content-center flex-wrap">
                <button @click="calendarViewMode === 'calendar' ? goToToday() : goToTodayDayView()" class="btn btn-primary btn-sm">{{ $t('admin.today') }}</button>
                <button @click="openBookingModal" class="btn btn-success btn-sm">
                  <i class="fas fa-plus me-1"></i>{{ $t('admin.bookAppointment') }}
                </button>
                <!-- Toggle Button for Mobile -->
                <button @click="toggleCalendarView" class="btn btn-sm" :class="calendarViewMode === 'calendar' ? 'btn-outline-secondary' : 'btn-secondary'">
                  <i :class="[calendarViewMode === 'calendar' ? 'fas fa-calendar-day' : 'fas fa-calendar-alt', 'me-1']"></i>
                  {{ calendarViewMode === 'calendar' ? $t('admin.dayView') : $t('admin.calendar') }}
                </button>
              </div>
              <!-- Mobile Off-Date Toggle - Calendar View -->
              <div v-if="calendarViewMode === 'calendar' && selectedCalendarDate" class="mobile-off-date-section mt-2">
                <div class="off-date-toggle-mobile">
                  <small class="text-muted mb-1 d-block">{{ formatSelectedDate }}</small>
                  <label class="off-date-toggle-label-mobile" for="mobileCalendarOffDateToggle">
                    <input 
                      class="off-date-toggle-input" 
                      type="checkbox" 
                      id="mobileCalendarOffDateToggle"
                      :checked="isSelectedDateRestricted"
                      @change="toggleCalendarOffDate"
                    >
                    <span class="toggle-slider-mobile" :class="{ 'active': isSelectedDateRestricted }">
                      <i v-if="isSelectedDateRestricted" class="fas fa-ban"></i>
                      <i v-else class="fas fa-calendar-check"></i>
                    </span>
                    <span class="toggle-text-mobile">
                      {{ isSelectedDateRestricted ? $t('admin.offDate') : $t('admin.markAsOffDate') }}
                    </span>
                  </label>
                </div>
              </div>
              <!-- Mobile Off-Date Toggle - Day View -->
              <div v-if="calendarViewMode === 'day'" class="mobile-off-date-section mt-2">
                <div class="off-date-toggle-mobile">
                  <label class="off-date-toggle-label-mobile" for="mobileDayViewOffDateToggle">
                    <input 
                      class="off-date-toggle-input" 
                      type="checkbox" 
                      id="mobileDayViewOffDateToggle"
                      :checked="dayViewData.isRestricted"
                      @change="toggleDayViewOffDate"
                    >
                    <span class="toggle-slider-mobile" :class="{ 'active': dayViewData.isRestricted }">
                      <i v-if="dayViewData.isRestricted" class="fas fa-ban"></i>
                      <i v-else class="fas fa-calendar-check"></i>
                    </span>
                    <span class="toggle-text-mobile">
                      {{ dayViewData.isRestricted ? $t('admin.offDate') : $t('admin.markAsOffDate') }}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div class="row g-3">
              <!-- Calendar Section -->
              <div class="col-12 col-lg-8">
                <div class="card border-0 shadow-sm calendar-card">
                  <div class="card-header py-3 d-none d-lg-block">
                    <div class="d-flex justify-content-between align-items-center">
                      <h5 class="mb-0">
                        <i :class="[calendarViewMode === 'calendar' ? 'fas fa-calendar-alt' : 'fas fa-calendar-day', 'me-2']"></i>
                        {{ calendarViewMode === 'calendar' ? $t('admin.calendar') : $t('admin.dayView') }}
                      </h5>
                      <div class="d-flex gap-2">
                        <button @click="openBookingModal" class="btn btn-sm btn-success">
                          <i class="fas fa-plus me-1"></i>{{ $t('admin.bookAppointment') }}
                        </button>
                        <!-- Toggle Button -->
                        <button @click="toggleCalendarView" class="btn btn-sm" :class="calendarViewMode === 'calendar' ? 'btn-outline-secondary' : 'btn-secondary'">
                          <i :class="[calendarViewMode === 'calendar' ? 'fas fa-calendar-day' : 'fas fa-calendar-alt', 'me-1']"></i>
                          {{ calendarViewMode === 'calendar' ? $t('admin.dayView') : $t('admin.calendar') }}
                        </button>
                        <!-- Calendar View Controls -->
                        <template v-if="calendarViewMode === 'calendar'">
                          <button @click="changeMonth(-1)" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-chevron-left"></i>
                          </button>
                          <button @click="goToToday" class="btn btn-sm btn-primary">{{ $t('admin.today') }}</button>
                          <button @click="changeMonth(1)" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-chevron-right"></i>
                          </button>
                        </template>
                        <!-- Day View Controls -->
                        <template v-else>
                          <button @click="navigateDayView(-1)" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-chevron-left"></i>
                          </button>
                          <button @click="goToTodayDayView" class="btn btn-sm btn-primary">{{ $t('admin.today') }}</button>
                          <button @click="navigateDayView(1)" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-chevron-right"></i>
                          </button>
                        </template>
                      </div>
                    </div>
                    <div v-if="calendarViewMode === 'calendar'" class="d-flex justify-content-between align-items-center mt-3">
                      <h6 class="mb-0">{{ currentMonthYear }}</h6>
                      <div v-if="selectedCalendarDate" class="off-date-toggle-wrapper">
                        <label class="off-date-toggle-label" for="calendarOffDateToggle">
                          <div class="toggle-switch-container">
                            <input 
                              class="off-date-toggle-input" 
                              type="checkbox" 
                              id="calendarOffDateToggle"
                              :checked="isSelectedDateRestricted"
                              @change="toggleCalendarOffDate"
                            >
                            <span class="toggle-slider" :class="{ 'active': isSelectedDateRestricted }">
                              <span class="toggle-icon">
                                <i v-if="isSelectedDateRestricted" class="fas fa-ban"></i>
                                <i v-else class="fas fa-calendar-check"></i>
                              </span>
                            </span>
                          </div>
                          <span class="toggle-label-text">
                            <span v-if="isSelectedDateRestricted" class="text-warning">
                              <i class="fas fa-ban me-1"></i>{{ $t('admin.offDate') }}
                            </span>
                            <span v-else class="text-muted">
                              <i class="fas fa-calendar-check me-1"></i>{{ $t('admin.markAsOffDate') }}
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                    <div v-else class="d-flex justify-content-between align-items-center mt-3">
                      <h6 class="mb-0">{{ formatDayViewDate }}</h6>
                      <div class="off-date-toggle-wrapper">
                        <label class="off-date-toggle-label" for="dayViewOffDateToggle">
                          <div class="toggle-switch-container">
                            <input 
                              class="off-date-toggle-input" 
                              type="checkbox" 
                              id="dayViewOffDateToggle"
                              :checked="dayViewData.isRestricted"
                              @change="toggleDayViewOffDate"
                            >
                            <span class="toggle-slider" :class="{ 'active': dayViewData.isRestricted }">
                              <span class="toggle-icon">
                                <i v-if="dayViewData.isRestricted" class="fas fa-ban"></i>
                                <i v-else class="fas fa-calendar-check"></i>
                              </span>
                            </span>
                          </div>
                          <span class="toggle-label-text">
                            <span v-if="dayViewData.isRestricted" class="text-warning">
                              <i class="fas fa-ban me-1"></i>{{ $t('admin.offDate') }}
                            </span>
                            <span v-else class="text-muted">
                              <i class="fas fa-calendar-check me-1"></i>{{ $t('admin.markAsOffDate') }}
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="card-body p-2 p-lg-3">
                    <!-- Calendar Grid View -->
                    <div v-if="calendarViewMode === 'calendar'" class="calendar-grid">
                      <div class="calendar-header" v-for="day in calendarDayNames" :key="day">
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
                        <span v-if="day.isOffDate" class="off-date-icon" title="Off Day"><i class="fas fa-ban"></i></span>
                        <span v-else-if="day.bookingCount" class="booking-badge">{{ day.bookingCount }}</span>
                      </div>
                    </div>
                    <!-- Day View -->
                    <div v-else class="day-view-container">
                      <div v-if="dayViewData.loading" class="text-center p-5">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </div>
                      <div v-else-if="dayViewData.isRestricted" class="text-center p-5">
                        <div class="alert alert-warning mb-0">
                          <i class="fas fa-ban fa-3x mb-3"></i>
                          <h5>{{ $t('admin.dateMarkedAsOffDate') }}</h5>
                          <p class="mb-0">{{ $t('admin.noAppointmentsOnOffDate') }}</p>
                        </div>
                      </div>
                      <div v-else class="date-time-schedule">
                        <!-- Week Navigation Row - Swipeable -->
                        <div class="week-navigation-container no-arrows">
                          <div
                            class="week-navigation-row swipeable"
                            ref="dayViewWeekSlider"
                            @mousedown="startDrag($event, 'dayView')"
                            @mousemove="onDrag($event, 'dayView')"
                            @mouseup="endDrag('dayView')"
                            @mouseleave="endDrag('dayView')"
                            @touchstart="startDrag($event, 'dayView')"
                            @touchmove="onDrag($event, 'dayView')"
                            @touchend="endDrag('dayView')"
                          >
                            <div
                              v-for="day in extendedDayViewWeekDays"
                              :key="day.date"
                              @click="navigateToDayViewDate(day.date)"
                              class="week-day-cell"
                              :class="{
                                'active': day.date === dayViewDate,
                                'today': day.isToday
                              }"
                            >
                              <div class="week-day-name">{{ day.dayName }}</div>
                              <div class="week-day-number">{{ day.dayNumber }}</div>
                            </div>
                          </div>
                          <div class="calendar-week-cell">
                            <div class="calendar-week-label">KW</div>
                            <div class="calendar-week-number">{{ dayViewCalendarWeek }}</div>
                          </div>
                        </div>
                        
                        <div class="schedule-header">
                          <div class="time-column-header">Time</div>
                          <div class="slots-column-header">
                            <div class="half-hour-slot-header">Slots</div>
                          </div>
                        </div>
                        <div class="schedule-body">
                          <div 
                            v-for="(hour, hourIndex) in timeSlots" 
                            :key="hour"
                            class="schedule-row-wrapper"
                            :class="{ 'row-pink': hourIndex % 2 === 0, 'row-green': hourIndex % 2 === 1 }"
                          >
                            <div class="schedule-row">
                              <div class="time-column">
                                <span class="time-label">{{ hour }}</span>
                              </div>
                              <div class="slots-column">
                                <div 
                                  v-for="(slot, index) in getDayViewHalfHourSlots(hour)" 
                                  :key="`${hour}-${index}`"
                                  class="half-hour-slot"
                                  :class="{ 
                                    'has-appointment': slot.appointment,
                                    'slot-first': index === 0,
                                    'slot-second': index === 1
                                  }"
                                  @click="handleSlotClick(slot, dayViewDate)"
                                >
                                  <div 
                                    v-if="slot.appointment" 
                                    class="appointment-block" 
                                    :class="getAppointmentBlockClass(slot.appointment)"
                                    @click.stop="slot.appointment.status === 'confirmed' ? openEditTimeModal(slot.appointment) : null"
                                  >
                                    <div class="appointment-content">
                                      <div class="appointment-customer">{{ slot.appointment.customerName }}</div>
                                      <div class="appointment-service">{{ getServiceNames(slot.appointment) }}</div>
                                      <div class="appointment-time" v-if="slot.showTime">{{ formatAppointmentTime(slot.appointment) }}</div>
                                    </div>
                                  </div>
                                  <div v-else class="empty-slot">
                                    <div class="empty-slot-hint">
                                      
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
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
                  <div class="card-body p-0 appointments-card-body">
                    <div v-if="selectedDayAppointments.length" class="appointments-list">
                      <div v-for="apt in selectedDayAppointments" :key="apt._id" class="appointment-card">
                        <div class="appointment-header d-flex justify-content-between align-items-start mb-1">
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
                          <div class="appointment-meta d-flex justify-content-between mb-1">
                            <span class="price">{{ formatCurrency(apt.totalPrice) }}</span>
                            <span class="duration"><i class="fas fa-hourglass-half me-1"></i>{{ apt.totalDuration }}min</span>
                          </div>
                          <div v-if="apt.customerPhone" class="contact-info mb-1">
                            <small class="text-muted"><i class="fas fa-phone me-1"></i>{{ apt.customerPhone }}</small>
                          </div>
                        </div>
                        <div class="appointment-actions d-flex gap-2 justify-content-center mt-2">
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
                    <div v-else class="empty-state text-center d-flex flex-column justify-content-center align-items-center">
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
                  <div v-for="service in services" :key="service._id" class="service-card card mb-3" :class="{ 'opacity-50': !service.active }">
                    <div class="card-body p-3">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 class="mb-0 fw-bold">
                            <span v-if="!service.active" class="badge bg-secondary me-2">{{ $t('admin.inactive') }}</span>
                            {{ service.name }}
                          </h6>
                        </div>
                        <span class="badge bg-primary">{{ formatCurrency(service.price) }}</span>
                      </div>
                      <div class="service-details mb-3">
                        <div class="d-flex justify-content-between text-muted small mb-1">
                          <span><i class="fas fa-clock me-1"></i>{{ service.duration }} {{ $t('admin.minutes') }}</span>
                        </div>
                        <p class="text-muted small mb-0">{{ service.description || $t('admin.noDescriptionAvailable') }}</p>
                      </div>
                      <div class="service-actions d-flex gap-2">
                        <button @click="toggleServiceStatus(service)" 
                          :class="['btn', 'btn-sm', 'flex-fill', service.active ? 'btn-outline-warning' : 'btn-outline-success']"
                          :title="service.active ? $t('admin.deactivateService') : $t('admin.activateService')">
                          <i :class="service.active ? 'fas fa-eye-slash me-1' : 'fas fa-eye me-1'"></i>
                          {{ service.active ? $t('admin.deactivate') : $t('admin.activate') }}
                        </button>
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
                        <tr v-for="service in services" :key="service._id" :class="{ 'table-secondary': !service.active }">
                          <td class="fw-medium">
                            <span v-if="!service.active" class="badge bg-secondary me-2">{{ $t('admin.inactive') }}</span>
                            {{ service.name }}
                          </td>
                          <td>{{ service.duration }} {{ $t('admin.minutes') }}</td>
                          <td class="fw-bold text-success">{{ formatCurrency(service.price) }}</td>
                          <td class="text-muted">{{ service.description || $t('admin.noDescription') }}</td>
                          <td class="text-center">
                            <div class="btn-group" role="group">
                              <button @click="toggleServiceStatus(service)" 
                                :class="['btn', 'btn-sm', service.active ? 'btn-outline-warning' : 'btn-outline-success']"
                                :title="service.active ? $t('admin.deactivateService') : $t('admin.activateService')">
                                <i :class="service.active ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                              </button>
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
                  <div v-for="(day, index) in translatedDaysOfWeek" :key="index" class="day-schedule-card">
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
    <div v-if="showBookingModal" class="modal fade show d-block booking-modal-overlay" style="background: rgba(0,0,0,0.5);" @click.self="closeBookingModal">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable booking-modal-dialog">
        <div class="modal-content booking-modal-content">
          <div class="modal-header bg-gradient-primary text-white">
            <h5 class="modal-title"><i class="fas fa-plus me-2"></i>{{ $t('admin.bookNewAppointment') }}</h5>
            <button @click="closeBookingModal" class="btn-close btn-close-white"></button>
          </div>
          <div class="modal-body booking-modal-body">
            <form @submit.prevent="quickBookAppointment">
              <div class="row g-3">

                <!-- Show selected date/time when opened from slot click -->
                <div v-if="bookingFromSlotClick" class="col-12">
                  <div class="alert alert-info d-flex align-items-center gap-3">
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-center gap-2 mb-2">
                        <i class="fas fa-calendar-check text-primary"></i>
                        <strong>{{ $t('admin.selectedDateTime') || 'Selected Date & Time' }}</strong>
                      </div>
                      <div class="d-flex gap-3">
                        <span><i class="fas fa-calendar me-1"></i>{{ formatBookingDate }}</span>
                        <span><i class="fas fa-clock me-1"></i>{{ formatBookingTime }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Professional Date Picker - Only show when NOT from slot click -->
                <div v-if="!bookingFromSlotClick" class="col-12">
                  <label class="form-label fw-semibold mb-3 d-flex align-items-center">
                    <i class="fas fa-calendar-alt me-2 text-primary"></i>
                    <span>{{ $t('booking.date') }}</span>
                  </label>

                  <!-- Mobile Week View - Compact horizontal strip -->
                  <div class="mobile-week-picker d-md-none">
                    <!-- Week Navigation Header -->
                    <div class="week-picker-header">
                      <button
                        type="button"
                        @click="changeBookingWeek(-1)"
                        class="week-nav-btn"
                        :disabled="isBookingWeekMin()"
                        :class="{ 'disabled': isBookingWeekMin() }"
                      >
                        <i class="fas fa-chevron-left"></i>
                      </button>
                      <div class="week-range-display">
                        <span class="week-range-text">{{ bookingWeekRange }}</span>
                      </div>
                      <button
                        type="button"
                        @click="changeBookingWeek(1)"
                        class="week-nav-btn"
                      >
                        <i class="fas fa-chevron-right"></i>
                      </button>
                    </div>

                    <!-- Horizontal Week Strip -->
                    <div class="week-strip-container">
                      <div class="week-strip">
                        <div
                          v-for="day in bookingWeekDays"
                          :key="day.date"
                          @click="selectBookingDate(day.date)"
                          :class="['week-day-cell', {
                            'today': day.isToday,
                            'selected': day.date === bookingForm.date,
                            'past': day.isPast,
                            'off-date': day.isOffDate
                          }]"
                        >
                          <span class="week-day-name">{{ day.dayName }}</span>
                          <span class="week-day-number">{{ day.dayNumber }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Selected Date Display (compact) -->
                    <div v-if="bookingForm.date" class="week-selected-date">
                      <i class="fas fa-check-circle text-success me-2"></i>
                      <span>{{ formatBookingSelectedDate }}</span>
                    </div>
                  </div>

                  <!-- Desktop Full Calendar -->
                  <div class="professional-date-picker d-none d-md-block">
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
                        <div v-for="day in calendarDayNames" :key="day" class="weekday-cell-pro">
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
                <div class="col-12 service-selector-wrapper">
                  <label class="form-label fw-semibold">
                    <i class="fas fa-cut me-2 text-primary"></i>{{ $t('admin.service') }}
                  </label>
                  <div class="service-select-container">
                    <select 
                      v-model="bookingForm.serviceId" 
                      @change="updateBookingPrice" 
                      class="form-select booking-service-select" 
                      required
                      style="font-size: 16px;"
                    >
                      <option value="">{{ $t('admin.selectService') }}</option>
                      <option v-for="service in activeServices" :key="service._id" :value="service._id">
                        {{ service.name }} - {{ formatCurrency(service.price) }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Time Slots - Only show when NOT from slot click -->
                <div v-if="!bookingFromSlotClick && (availableSlots.length || bookingForm.time)" class="col-12">
                  <label class="form-label">{{ $t('booking.availableTimes') }}</label>
                  <div v-if="bookingForm.time && !availableSlots.length" class="selected-time-preview mb-2">
                    <span class="badge bg-success">{{ bookingForm.time }}</span>
                    <small class="text-muted ms-2">{{ $t('admin.selectService') }} {{ $t('common.to') }} {{ $t('common.continue') }}</small>
                  </div>
                  <div v-if="availableSlots.length" class="time-slots-grid">
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
                  <div class="customer-search-container" style="position: relative; z-index: 1070;">
                    <div class="input-group mb-2">
                      <span class="input-group-text"><i class="fas fa-search"></i></span>
                      <input
                        v-model="bookingCustomerSearch"
                        type="text"
                        class="form-control"
                        @focus="showCustomerDropdown = true"
                        @input="showCustomerDropdown = true"
                        @touchstart="showCustomerDropdown = true"
                        @click="showCustomerDropdown = true"
                        autocomplete="off"
                        style="font-size: 16px; -webkit-appearance: none; appearance: none;"
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
                      v-if="showCustomerDropdown"
                      class="customer-dropdown"
                      @click.stop=""
                      @touchstart.stop=""
                      @mousedown.stop=""
                      style="position: absolute; z-index: 1070; transform: translateZ(0); -webkit-transform: translateZ(0); pointer-events: auto;"
                    >
                      <div v-if="bookingCustomerMatches.length > 0" class="customer-list">
                        <div
                          v-for="customer in bookingCustomerMatches.slice(0, 8)"
                          :key="customer._id"
                          class="customer-item"
                          @click.stop="selectCustomerForBooking(customer)"
                          @touchstart.stop="selectCustomerForBooking(customer)"
                          @touchend.stop="selectCustomerForBooking(customer)"
                          style="position: relative; z-index: 10; touch-action: manipulation; -webkit-tap-highlight-color: rgba(107, 114, 128, 0.2); cursor: pointer;"
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
                      <div v-else-if="bookingCustomerSearch && bookingCustomerMatches.length === 0" class="no-results">
                        <i class="fas fa-user-slash me-2"></i>{{ $t('admin.noCustomersFound') }}
                      </div>
                      <div v-else-if="!bookingCustomerSearch && customers.length === 0" class="no-results">
                        <i class="fas fa-info-circle me-2"></i>{{ $t('admin.noCustomersAvailable') || 'No customers available' }}
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
                  <label class="form-label">{{ $t('admin.email') }}</label>
                  <input v-model="bookingForm.customerEmail" type="email" class="form-control">
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
            <button @click="closeBookingModal" class="btn btn-secondary">{{ $t('common.cancel') }}</button>
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
    <div v-if="editTimeModal.show" class="modal fade show d-block edit-appointment-modal" style="background: rgba(0,0,0,0.5); z-index: 1050;" @click.self="closeEditTimeModal">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable edit-appointment-modal-dialog" style="z-index: 1051;">
        <div class="modal-content edit-appointment-modal-content" @click.stop>
          <div class="modal-header bg-gradient-primary text-white edit-appointment-modal-header" style="position: relative; z-index: 1052;">
            <h5 class="modal-title">
              <i class="fas fa-edit me-2"></i>{{ $t('admin.editAppointment') }}
            </h5>
            <button @click.stop="closeEditTimeModal" @touchstart.stop="closeEditTimeModal" class="btn-close btn-close-white" style="position: relative; z-index: 1053;"></button>
          </div>
          <div class="modal-body edit-modal-body" style="overflow-y: auto; max-height: calc(100vh - 250px);">
            <div v-if="editTimeModal.appointment" class="mb-3 current-appointment-info">
              <p class="mb-1"><strong>{{ $t('admin.customer') }}:</strong> {{ editTimeModal.appointment.customerName }}</p>
              <p class="mb-1"><strong>{{ $t('admin.currentDate') }}:</strong> {{ formatEditModalCurrentDate }}</p>
              <p class="mb-0"><strong>{{ $t('admin.currentTime') }}:</strong> {{ editTimeModal.appointment.time }}</p>
            </div>

            <!-- Week View Date Picker -->
            <div class="mb-3">
              <label class="form-label fw-semibold">
                <i class="fas fa-calendar-alt me-2"></i>{{ $t('admin.selectNewDate') }}
              </label>
              <div class="week-date-picker">
                <!-- Week Navigation -->
                <div class="week-nav-header">
                  <button
                    type="button"
                    @click.stop="changeEditWeek(-1)"
                    @touchstart.stop="changeEditWeek(-1)"
                    class="week-nav-btn"
                    :disabled="isEditWeekMin"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <div class="week-display">
                    <span class="week-label">{{ getEditWeekLabel }}</span>
                  </div>
                  <button
                    type="button"
                    @click.stop="changeEditWeek(1)"
                    @touchstart.stop="changeEditWeek(1)"
                    class="week-nav-btn"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>

                <!-- Week Days -->
                <div class="week-days-grid">
                  <div
                    v-for="day in editWeekDays"
                    :key="day.date"
                    @click.stop="selectEditDate(day)"
                    @touchstart.stop="selectEditDate(day)"
                    :class="['week-day-cell', {
                      'today': day.isToday,
                      'selected': day.date === editTimeModal.newDate,
                      'past': day.isPast,
                      'off-date': day.isOffDate
                    }]"
                  >
                    <div class="day-name">{{ day.dayName }}</div>
                    <div class="day-number">{{ day.dayNumber }}</div>
                    <div v-if="day.monthLabel" class="month-label">{{ day.monthLabel }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">{{ $t('admin.selectNewTime') }}</label>
              <div v-if="editTimeModal.availableTimes.length" class="time-slots-grid mobile-optimized" style="max-height: 200px; overflow-y: auto;">
                <button
                  v-for="slot in editTimeModal.availableTimes"
                  :key="slot"
                  type="button"
                  @click.stop="editTimeModal.newTime = slot"
                  @touchstart.stop="editTimeModal.newTime = slot"
                  :class="['btn', 'btn-sm', 'time-slot-btn', editTimeModal.newTime === slot ? 'btn-primary' : 'btn-outline-primary']"
                >
                  {{ slot }}
                </button>
              </div>
              <div v-else class="alert alert-info mb-0">
                <i class="fas fa-info-circle me-2"></i>{{ $t('admin.loadingAvailableSlots') }}
              </div>
            </div>
            <div class="mb-0">
              <label class="form-label fw-semibold">{{ $t('admin.messageOptional') }}</label>
              <textarea
                v-model="editTimeModal.message"
                class="form-control"
                rows="3"
                :placeholder="$t('admin.addNoteAboutChange')"
              ></textarea>
              <small class="text-muted">{{ $t('admin.messageWillBeSent') }}</small>
            </div>
          </div>
          <div class="modal-footer" style="position: sticky; bottom: 0; z-index: 1052; background: var(--bg-primary); border-top: 1px solid var(--border-color); flex-shrink: 0;">
            <button @click.stop.prevent="closeEditTimeModal" @touchstart.stop.prevent="closeEditTimeModal" @mousedown.stop.prevent="closeEditTimeModal" class="btn btn-secondary" style="position: relative; z-index: 1053; -webkit-appearance: none; appearance: none; touch-action: manipulation; min-height: 44px;">{{ $t('common.cancel') }}</button>
            <button @click.stop.prevent="updateAppointmentTime" @touchstart.stop.prevent="updateAppointmentTime" @mousedown.stop.prevent="updateAppointmentTime" class="btn btn-primary" :disabled="!editTimeModal.newTime || !editTimeModal.newDate" style="position: relative; z-index: 1053; -webkit-appearance: none; appearance: none; touch-action: manipulation; min-height: 44px;">
              <i class="fas fa-save me-2"></i>{{ $t('admin.updateAppointment') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Date Detail Modal -->
    <div v-if="dateDetailModal.show" class="modal fade show d-block date-detail-modal" style="background: rgba(0,0,0,0.5);" @click.self="closeDateDetailModal">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable date-detail-modal-dialog" style="max-width: 95%;">
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
                <div class="off-date-toggle-wrapper">
                  <label class="off-date-toggle-label" for="offDateToggle">
                    <div class="toggle-switch-container">
                      <input 
                        class="off-date-toggle-input" 
                        type="checkbox" 
                        id="offDateToggle"
                        :checked="dateDetailModal.isRestricted"
                        @change="toggleOffDate"
                      >
                      <span class="toggle-slider" :class="{ 'active': dateDetailModal.isRestricted }">
                        <span class="toggle-icon">
                          <i v-if="dateDetailModal.isRestricted" class="fas fa-ban"></i>
                          <i v-else class="fas fa-calendar-check"></i>
                        </span>
                      </span>
                    </div>
                    <span class="toggle-label-text">
                      <span v-if="dateDetailModal.isRestricted" class="text-warning">
                        <i class="fas fa-ban me-1"></i>{{ $t('admin.offDate') }}
                      </span>
                      <span v-else class="text-white-50">
                        <i class="fas fa-calendar-check me-1"></i>{{ $t('admin.markAsOffDate') }}
                      </span>
                    </span>
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
                <h5>{{ $t('admin.dateMarkedAsOffDate') }}</h5>
                <p class="mb-0">{{ $t('admin.noAppointmentsOnOffDate') }}</p>
              </div>
            </div>
            <div v-else class="date-time-schedule">
              <!-- Week Navigation Row - Swipeable -->
              <div class="week-navigation-container no-arrows">
                <div
                  class="week-navigation-row swipeable"
                  ref="modalWeekSlider"
                  @mousedown="startDrag($event, 'modal')"
                  @mousemove="onDrag($event, 'modal')"
                  @mouseup="endDrag('modal')"
                  @mouseleave="endDrag('modal')"
                  @touchstart="startDrag($event, 'modal')"
                  @touchmove="onDrag($event, 'modal')"
                  @touchend="endDrag('modal')"
                >
                  <div
                    v-for="day in extendedWeekDays"
                    :key="day.date"
                    @click="navigateToDate(day.date)"
                    class="week-day-cell"
                    :class="{
                      'active': day.date === dateDetailModal.dateString,
                      'today': day.isToday
                    }"
                  >
                    <div class="week-day-name">{{ day.dayName }}</div>
                    <div class="week-day-number">{{ day.dayNumber }}</div>
                  </div>
                </div>
                <div class="calendar-week-cell">
                  <div class="calendar-week-label">KW</div>
                  <div class="calendar-week-number">{{ calendarWeek }}</div>
                </div>
              </div>
              
              <div class="schedule-header">
                <div class="time-column-header">Time</div>
                <div class="slots-column-header">
                  <div class="half-hour-slot-header">00</div>
                  <div class="half-hour-slot-header">30</div>
                </div>
              </div>
              <div class="schedule-body">
                <div 
                  v-for="(hour, hourIndex) in timeSlots" 
                  :key="hour"
                  class="schedule-row"
                  :class="{ 'row-pink': hourIndex % 2 === 0, 'row-green': hourIndex % 2 === 1 }"
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
                          <div class="appointment-time" v-if="slot.showTime">{{ formatAppointmentTime(slot.appointment) }}</div>
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
      dragState: null,
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
        description: '',
        active: true
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
      bookingFromSlotClick: false, // Track if booking modal opened from time slot click
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
        message: '',
        weekOffset: 0
      },
      cancelModal: {
        show: false,
        appointment: null,
        message: ''
      },
      bookingCalendarMonth: new Date().getMonth(),
      bookingCalendarYear: new Date().getFullYear(),
      calendarViewMode: 'day', // 'calendar' or 'day' - default to day view
      dayViewDate: new Date().toISOString().split('T')[0],
      dayViewData: {
        date: null,
        dateString: '',
        appointments: [],
        isRestricted: false,
        restriction: null,
        loading: false
      }
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
      if (!this.customers || this.customers.length === 0) return []
      const term = this.bookingCustomerSearch ? this.bookingCustomerSearch.toLowerCase().trim() : ''
      if (!term) return this.customers.slice(0, 8)
      return this.customers.filter(c =>
        c.name?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.notes?.toLowerCase().includes(term)
      ).slice(0, 8)
    },
    activeServices() {
      // Filter out disabled/inactive services for booking
      return this.services.filter(service => service.active !== false)
    },
    currentMonthYear() {
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      const monthName = this.$t(`booking.monthNames.${monthKeys[this.currentMonth]}`)
      return `${monthName} ${this.currentYear}`
    },
    calendarDayNames() {
      // Calendar day names starting with Monday
      const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      return dayKeys.map(key => this.$t(`booking.dayNames.${key}`))
    },
    translatedDaysOfWeek() {
      // Full day names starting with Sunday (index 0) for timeslots section
      const dayKeysBySunday = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      return dayKeysBySunday.map(key => this.$t(`booking.dayNamesFull.${key}`))
    },
    calendarDays() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1)
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0)
      const prevLastDay = new Date(this.currentYear, this.currentMonth, 0)
      
      const days = []
      // Convert Sunday=0 to Monday-based (Monday=0, Sunday=6)
      let startDay = firstDay.getDay() - 1
      if (startDay < 0) startDay = 6
      
      // Previous month days
      for (let i = startDay - 1; i >= 0; i--) {
        const date = new Date(this.currentYear, this.currentMonth - 1, prevLastDay.getDate() - i)
        days.push(this.createDayObject(date, false))
      }
      
      // Current month days
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(this.currentYear, this.currentMonth, i)
        days.push(this.createDayObject(date, true))
      }

      // Fill trailing days to complete the last week
      const totalSlots = Math.ceil(days.length / 7) * 7
      let nextDayCount = 1
      while (days.length < totalSlots) {
        const date = new Date(this.currentYear, this.currentMonth + 1, nextDayCount)
        days.push(this.createDayObject(date, false))
        nextDayCount++
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
    isSelectedDateRestricted() {
      if (!this.selectedCalendarDate) return false
      return this.restrictions.some(restriction => {
        const restrictionDate = new Date(restriction.date).toISOString().split('T')[0]
        return restrictionDate === this.selectedCalendarDate
      })
    },
    getBookingMonthYear() {
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      return this.$t(`booking.monthNames.${monthKeys[this.bookingCalendarMonth]}`)
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
    // Week view for mobile - shows current week containing selected date or today
    bookingWeekDays() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Use selected date or today as reference
      const referenceDate = this.bookingForm.date
        ? new Date(this.bookingForm.date + 'T00:00:00')
        : new Date()

      // Find Monday of the current week
      const dayOfWeek = referenceDate.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const monday = new Date(referenceDate)
      monday.setDate(referenceDate.getDate() + mondayOffset)

      // Helper function to format date string
      const formatDateString = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      // Helper to check if date is off date
      const isOffDate = (dateStr) => {
        return this.restrictions.some(restriction => {
          const restrictionDate = new Date(restriction.date).toISOString().split('T')[0]
          return restrictionDate === dateStr
        })
      }

      const days = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday)
        date.setDate(monday.getDate() + i)
        const dateStr = formatDateString(date)
        days.push({
          date: dateStr,
          dayNumber: date.getDate(),
          dayName: this.$t(`booking.dayNames.${['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][i]}`),
          isCurrentMonth: date.getMonth() === referenceDate.getMonth(),
          isToday: this.isSameDay(date, today),
          isPast: date < today,
          isOffDate: isOffDate(dateStr),
          monthName: this.$t(`booking.monthNames.${['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][date.getMonth()]}`)
        })
      }

      return days
    },
    // Get the week range display text
    bookingWeekRange() {
      if (this.bookingWeekDays.length === 0) return ''
      const firstDay = this.bookingWeekDays[0]
      const lastDay = this.bookingWeekDays[6]
      return `${firstDay.dayNumber} ${firstDay.monthName} - ${lastDay.dayNumber} ${lastDay.monthName}`
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
    formatBookingDate() {
      if (!this.bookingForm.date) return ''
      const date = new Date(this.bookingForm.date + 'T00:00:00')
      const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      const dayName = this.$t(`booking.dayNamesFull.${dayKeys[date.getDay()]}`)
      const monthName = this.$t(`booking.monthNames.${monthKeys[date.getMonth()]}`)
      return `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`
    },
    formatBookingTime() {
      if (!this.bookingForm.time) return ''
      // Remove seconds if present (e.g., "14:00:30" -> "14:00")
      return this.bookingForm.time.split(':').slice(0, 2).join(':')
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
      const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      const dayName = this.$t(`booking.dayNamesFull.${dayKeys[date.getDay()]}`)
      const monthName = this.$t(`booking.monthNames.${monthKeys[date.getMonth()]}`)
      return `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`
    },
    timeSlots() {
      // Generate time slots from 9:00 to 17:00 (9 AM to 5 PM)
      const slots = []
      for (let hour = 9; hour <= 17; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
      }
      return slots
    },
    weekDays() {
      if (!this.dateDetailModal.dateString) return []
      
      const selectedDate = new Date(this.dateDetailModal.dateString + 'T00:00:00')
      const dayOfWeek = selectedDate.getDay()
      // Get Monday of the week (day 0 = Sunday, so we adjust)
      const monday = new Date(selectedDate)
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // If Sunday, go back 6 days, otherwise go to Monday
      monday.setDate(selectedDate.getDate() + diff)
      
      const days = []
      // Map index to translation keys (Mon=0, Tue=1, ..., Sun=6)
      const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday)
        date.setDate(monday.getDate() + i)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const today = new Date()
        const isToday = date.toDateString() === today.toDateString()
        
        days.push({
          date: dateStr,
          dayName: this.$t(`booking.dayNames.${dayKeys[i]}`).toUpperCase() + '.',
          dayNumber: date.getDate(),
          isToday: isToday
        })
      }
      
      return days
    },
    calendarWeek() {
      if (!this.dateDetailModal.dateString) return ''
      
      const date = new Date(this.dateDetailModal.dateString + 'T00:00:00')
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      const dayNum = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
    },
    // Day view computed properties
    dayViewWeekDays() {
      if (!this.dayViewDate) return []
      
      const selectedDate = new Date(this.dayViewDate + 'T00:00:00')
      const dayOfWeek = selectedDate.getDay()
      // Get Monday of the week (day 0 = Sunday, so we adjust)
      const monday = new Date(selectedDate)
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // If Sunday, go back 6 days, otherwise go to Monday
      monday.setDate(selectedDate.getDate() + diff)
      
      const days = []
      // Map index to translation keys (Mon=0, Tue=1, ..., Sun=6)
      const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday)
        date.setDate(monday.getDate() + i)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const today = new Date()
        const isToday = date.toDateString() === today.toDateString()
        
        days.push({
          date: dateStr,
          dayName: this.$t(`booking.dayNames.${dayKeys[i]}`).toUpperCase() + '.',
          dayNumber: date.getDate(),
          isToday: isToday
        })
      }
      
      return days
    },
    dayViewCalendarWeek() {
      if (!this.dayViewDate) return ''

      const date = new Date(this.dayViewDate + 'T00:00:00')
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      const dayNum = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
    },
    // Extended week days for scrollable slider (3 weeks: prev, current, next)
    extendedWeekDays() {
      if (!this.dateDetailModal.dateString) return []

      const selectedDate = new Date(this.dateDetailModal.dateString + 'T00:00:00')
      const dayOfWeek = selectedDate.getDay()
      const monday = new Date(selectedDate)
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      monday.setDate(selectedDate.getDate() + diff)

      // Start from 2 weeks before
      const startMonday = new Date(monday)
      startMonday.setDate(monday.getDate() - 14)

      const days = []
      const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

      // Generate 5 weeks of days (35 days) for smooth scrolling
      for (let i = 0; i < 35; i++) {
        const date = new Date(startMonday)
        date.setDate(startMonday.getDate() + i)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const today = new Date()
        const isToday = date.toDateString() === today.toDateString()
        const dayIndex = i % 7

        days.push({
          date: dateStr,
          dayName: this.$t(`booking.dayNames.${dayKeys[dayIndex]}`).toUpperCase() + '.',
          dayNumber: date.getDate(),
          isToday: isToday
        })
      }

      return days
    },
    extendedDayViewWeekDays() {
      if (!this.dayViewDate) return []

      const selectedDate = new Date(this.dayViewDate + 'T00:00:00')
      const dayOfWeek = selectedDate.getDay()
      const monday = new Date(selectedDate)
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      monday.setDate(selectedDate.getDate() + diff)

      // Start from 2 weeks before
      const startMonday = new Date(monday)
      startMonday.setDate(monday.getDate() - 14)

      const days = []
      const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

      // Generate 5 weeks of days (35 days) for smooth scrolling
      for (let i = 0; i < 35; i++) {
        const date = new Date(startMonday)
        date.setDate(startMonday.getDate() + i)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const today = new Date()
        const isToday = date.toDateString() === today.toDateString()
        // Calculate actual day of week (0=Sunday, 1=Monday, etc.)
        const actualDayOfWeek = date.getDay()
        // Convert to Monday-based index (0=Monday, 6=Sunday)
        const dayIndex = actualDayOfWeek === 0 ? 6 : actualDayOfWeek - 1

        days.push({
          date: dateStr,
          dayName: this.$t(`booking.dayNames.${dayKeys[dayIndex]}`).toUpperCase() + '.',
          dayNumber: date.getDate(),
          isToday: isToday
        })
      }

      return days
    },
    // Edit modal week view computed properties
    editWeekDays() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Start from today and add weekOffset weeks
      const startDate = new Date(today)
      startDate.setDate(today.getDate() + (this.editTimeModal.weekOffset * 7))

      // Find Monday of the week containing startDate
      const dayOfWeek = startDate.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const monday = new Date(startDate)
      monday.setDate(startDate.getDate() + mondayOffset)

      const days = []
      const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

      for (let i = 0; i < 7; i++) {
        const date = new Date(monday)
        date.setDate(monday.getDate() + i)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const isPast = date < today
        const isToday = date.toDateString() === today.toDateString()

        // Calculate actual day of week (0=Sunday, 1=Monday, etc.)
        const actualDayOfWeek = date.getDay()
        // Convert to Monday-based index (0=Monday, 6=Sunday)
        const dayIndex = actualDayOfWeek === 0 ? 6 : actualDayOfWeek - 1

        // Check if date is restricted
        const isOffDate = this.restrictions.some(restriction => {
          const restrictionDate = new Date(restriction.date).toISOString().split('T')[0]
          return restrictionDate === dateStr
        })

        // Show month label on first day or when month changes
        let monthLabel = ''
        if (i === 0 || date.getDate() === 1) {
          const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
          monthLabel = this.$t(`booking.monthNames.${monthKeys[date.getMonth()]}`)
        }

        days.push({
          date: dateStr,
          dayName: this.$t(`booking.dayNames.${dayKeys[dayIndex]}`),
          dayNumber: date.getDate(),
          isToday,
          isPast,
          isOffDate,
          monthLabel
        })
      }

      return days
    },
    getEditWeekLabel() {
      if (this.editTimeModal.weekOffset === 0) {
        return this.$t('admin.thisWeek') || 'This Week'
      } else if (this.editTimeModal.weekOffset === 1) {
        return this.$t('admin.nextWeek') || 'Next Week'
      } else {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() + (this.editTimeModal.weekOffset * 7))
        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)

        const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        const startMonth = this.$t(`booking.monthNames.${monthKeys[startDate.getMonth()]}`)
        const endMonth = this.$t(`booking.monthNames.${monthKeys[endDate.getMonth()]}`)

        if (startDate.getMonth() === endDate.getMonth()) {
          return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}`
        } else {
          return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}`
        }
      }
    },
    isEditWeekMin() {
      return this.editTimeModal.weekOffset === 0
    },
    formatEditModalCurrentDate() {
      if (!this.editTimeModal.appointment || !this.editTimeModal.appointment.date) return ''
      const date = new Date(this.editTimeModal.appointment.date)
      const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      const dayName = this.$t(`booking.dayNamesFull.${dayKeys[date.getDay()]}`)
      const monthName = this.$t(`booking.monthNames.${monthKeys[date.getMonth()]}`)
      return `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`
    },
    dayViewAppointments() {
      if (!this.dayViewDate) return []
      
      const dateAppointments = this.appointments.filter(apt => {
        if (!apt.date) return false
        const aptDate = typeof apt.date === 'string' ? apt.date.split('T')[0] : new Date(apt.date).toISOString().split('T')[0]
        return aptDate === this.dayViewDate && apt.status !== 'cancelled'
      })
      
      return dateAppointments.sort((a, b) => {
        if (!a.time || !b.time) return 0
        return a.time.localeCompare(b.time)
      })
    },
    dayViewFormatHeader() {
      if (!this.dayViewDate) return ''
      const date = new Date(this.dayViewDate + 'T00:00:00')
      const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      const dayName = this.$t(`booking.dayNamesFull.${dayKeys[date.getDay()]}`)
      const monthName = this.$t(`booking.monthNames.${monthKeys[date.getMonth()]}`)
      return `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`
    },
    formatDayViewDate() {
      if (!this.dayViewDate) return ''
      const date = new Date(this.dayViewDate + 'T00:00:00')
      const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      const dayName = this.$t(`booking.dayNamesFull.${dayKeys[date.getDay()]}`)
      const monthName = this.$t(`booking.monthNames.${monthKeys[date.getMonth()]}`)
      return `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`
    },
    dayViewHalfHourSlots() {
      return (hour) => {
        // Return two half-hour slots: :00 and :30
        const slots = [
          { time: `${hour}:00`, appointment: null, showTime: false },
          { time: `${hour}:30`, appointment: null, showTime: false }
        ]
        
        // Find appointments that match these time slots
        this.dayViewAppointments.forEach(apt => {
          const aptTime = apt.time || ''
          const aptHour = parseInt(aptTime.split(':')[0])
          const aptMinute = parseInt(aptTime.split(':')[1]) || 0
          
          // Check if appointment starts at :00 or :30 of this hour
          if (aptHour === parseInt(hour.split(':')[0])) {
            if (aptMinute === 0) {
              slots[0].appointment = apt
              slots[0].showTime = true
            } else if (aptMinute === 30) {
              slots[1].appointment = apt
              slots[1].showTime = true
            }
          }
        })
        
        return slots
      }
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
        // Automatically sync day view if it's currently displayed
        this.syncDayViewData()
      } catch (error) {
        console.error('Error fetching appointments:', error)
      }
    },
    // Sync day view data from current appointments without full reload
    syncDayViewData() {
      if (this.calendarViewMode === 'day' && this.dayViewDate && !this.dayViewData.loading) {
        // Filter appointments for the current day view date
        const dateAppointments = this.appointments.filter(apt => {
          if (!apt.date) return false
          const aptDate = typeof apt.date === 'string' ? apt.date.split('T')[0] : new Date(apt.date).toISOString().split('T')[0]
          return aptDate === this.dayViewDate && apt.status !== 'cancelled'
        })
        
        // Sort by time
        this.dayViewData.appointments = dateAppointments.sort((a, b) => {
          if (!a.time || !b.time) return 0
          return a.time.localeCompare(b.time)
        })
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
        // Store the appointment date for syncing views
        const appointmentDate = appointment.date.split('T')[0]
        
        await axios.put(`${process.env.VUE_APP_API_URL}/appointments/${appointment._id}`, {
          status: newStatus,
          sendEmail: true // Always send emails when status changes (confirmation, completion, cancellation)
        })
        await this.fetchAppointments()
        
        // Sync day view if viewing the appointment date
        if (this.calendarViewMode === 'day' && this.dayViewDate === appointmentDate) {
          this.syncDayViewData()
        }
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
    async toggleServiceStatus(service) {
      try {
        const newStatus = !service.active
        await axios.put(`${process.env.VUE_APP_API_URL}/services/${service._id}`, {
          ...service,
          active: newStatus
        })
        await this.fetchServices()
        this.showToast(
          newStatus 
            ? this.$t('toast.serviceActivated', { name: service.name }) || `Service "${service.name}" activated`
            : this.$t('toast.serviceDeactivated', { name: service.name }) || `Service "${service.name}" deactivated`,
          'success'
        )
      } catch (error) {
        console.error('Error toggling service status:', error)
        this.showToast('Error updating service status', 'error')
      }
    },
    async deleteService(id) {
      if (confirm('Are you sure you want to delete this service?')) {
        try {
          await axios.delete(`${process.env.VUE_APP_API_URL}/services/${id}`)
          await this.fetchServices()
          this.showToast('Service deleted successfully', 'success')
        } catch (error) {
          console.error('Error deleting service:', error)
          this.showToast('Error deleting service', 'error')
        }
      }
    },
    cancelServiceForm() {
      this.showServiceForm = false
      this.serviceForm = { name: '', duration: '', price: '', description: '', active: true }
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
        
        // Prevent booking for past dates
        const selectedDate = new Date(this.bookingForm.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        selectedDate.setHours(0, 0, 0, 0)
        
        if (selectedDate < today) {
          this.showToast(this.$t('toast.cannotBookPastDate'), 'warning')
          return
        }
        
        // Store the booked date for syncing views
        const bookedDate = this.bookingForm.date
        
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
        
        // Update selected calendar date if it matches the booked date
        if (this.selectedCalendarDate === bookedDate) {
          // Calendar grid will update automatically via computed property
          // Appointments list will update automatically via computed property
        }
        
        // If in day view and viewing the booked date, sync day view
        if (this.calendarViewMode === 'day' && this.dayViewDate === bookedDate) {
          this.syncDayViewData()
        }
        
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
      this.bookingFromSlotClick = false // Reset the slot click flag
      this.availableSlots = []
      this.bookingCustomerSearch = ''
      this.showCustomerDropdown = false
    },
    openBookingModal() {
      // Ensure customers are loaded when opening booking modal
      if (this.customers.length === 0) {
        this.fetchCustomers()
      }
      this.showBookingModal = true
    },
    closeBookingModal() {
      this.showBookingModal = false
      this.bookingFromSlotClick = false
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
        // Don't clear availableSlots or time if we're just missing serviceId
        // This allows time to be pre-selected before service selection
        if (!this.bookingForm.date || !this.primaryBarber) {
          this.availableSlots = []
        }
        return
      }
      
      // Preserve the currently selected time
      const previouslySelectedTime = this.bookingForm.time
      const isFromSlotClick = this.bookingFromSlotClick

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

        // Normalize time formats for comparison (handle both "9:00" and "09:00")
        const normalizeTime = (time) => {
          if (!time) return ''
          const parts = time.split(':')
          if (parts.length === 2) {
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
          }
          return time
        }

        const normalizedSelectedTime = normalizeTime(previouslySelectedTime)
        const normalizedAvailableSlots = this.availableSlots.map(normalizeTime)

        // If we had a previously selected time, try to match it with available slots
        if (normalizedSelectedTime) {
          if (normalizedAvailableSlots.includes(normalizedSelectedTime)) {
            // Find the exact format from available slots to match API format
            const matchingSlot = this.availableSlots.find(slot => normalizeTime(slot) === normalizedSelectedTime)
            if (matchingSlot) {
              this.bookingForm.time = matchingSlot
            } else {
              // Keep the original format if no exact match found
              this.bookingForm.time = previouslySelectedTime
            }
          } else {
            // If booking from slot click, ALWAYS keep the selected time
            // The slot was empty when clicked, so it should be available
            if (isFromSlotClick) {
              this.bookingForm.time = previouslySelectedTime
              // Also add it to available slots to prevent validation errors
              if (!this.availableSlots.includes(previouslySelectedTime)) {
                this.availableSlots.push(previouslySelectedTime)
                this.availableSlots.sort()
              }
            } else {
              // For regular booking, keep it selected so user can see what they chose
              this.bookingForm.time = previouslySelectedTime
            }
          }
        }
      } catch (error) {
        console.error('Error fetching available slots:', error)
        this.availableSlots = []
        // If booking from slot click, preserve the time even if fetch fails
        if (isFromSlotClick && previouslySelectedTime) {
          this.bookingForm.time = previouslySelectedTime
        }
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
      
      // Calculate weekOffset to show the week containing the appointment date
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const aptDate = new Date(appointmentDate + 'T00:00:00')
      const diffTime = aptDate - today
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      this.editTimeModal.weekOffset = Math.floor(diffDays / 7)
      
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
      this.editTimeModal.weekOffset = 0
      // Force update to ensure modal closes
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    },
    changeEditWeek(offset) {
      this.editTimeModal.weekOffset += offset
    },
    selectEditDate(day) {
      if (day.isPast || day.isOffDate) return
      this.editTimeModal.newDate = day.date
      this.onEditDateChange()
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
        
        // Sync day view for both old and new dates if in day view mode
        if (this.calendarViewMode === 'day') {
          if (this.dayViewDate === originalDate || this.dayViewDate === this.editTimeModal.newDate) {
            this.syncDayViewData()
          }
        }
        
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
    changeBookingWeek(direction) {
      // Navigate week by changing the reference date
      const referenceDate = this.bookingForm.date
        ? new Date(this.bookingForm.date + 'T00:00:00')
        : new Date()

      const newDate = new Date(referenceDate)
      newDate.setDate(referenceDate.getDate() + (direction * 7))

      // Don't allow going to past weeks
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const monday = new Date(newDate)
      const dayOfWeek = monday.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      monday.setDate(newDate.getDate() + mondayOffset)

      // Check if the week's Sunday is before today (entire week is past)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)

      if (direction < 0 && sunday < today) {
        return // Don't go back to a week entirely in the past
      }

      // Format the new date
      const formatDateString = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      // Update the form date to trigger week recalculation
      // Use the first non-past day of the week
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(monday)
        checkDate.setDate(monday.getDate() + i)
        if (checkDate >= today) {
          this.bookingForm.date = formatDateString(checkDate)
          this.fetchAvailableSlots()
          break
        }
      }

      // Also update the full calendar month/year to stay in sync
      this.bookingCalendarMonth = newDate.getMonth()
      this.bookingCalendarYear = newDate.getFullYear()
    },
    isBookingWeekMin() {
      // Check if current week contains today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (this.bookingWeekDays.length === 0) return true

      const firstDayStr = this.bookingWeekDays[0].date
      const lastDayStr = this.bookingWeekDays[6].date
      const firstDay = new Date(firstDayStr + 'T00:00:00')
      const lastDay = new Date(lastDayStr + 'T00:00:00')

      return today >= firstDay && today <= lastDay
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
        
        // If in day view mode, update the day view to show the selected date
        if (this.calendarViewMode === 'day') {
          this.dayViewDate = day.date
          this.loadDayViewData(day.date)
        }
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
          // Refresh appointments first to ensure we have latest data
          await this.fetchAppointments()
          
          // Filter appointments for this date
          const dateAppointments = this.appointments.filter(apt => {
            if (!apt.date) return false
            const aptDate = typeof apt.date === 'string' ? apt.date.split('T')[0] : new Date(apt.date).toISOString().split('T')[0]
            return aptDate === date && apt.status !== 'cancelled'
          })
          
          // Sort by time
          this.dateDetailModal.appointments = dateAppointments.sort((a, b) => {
            if (!a.time || !b.time) return 0
            return a.time.localeCompare(b.time)
          })
          
          console.log('Loaded appointments for date:', date, 'Count:', this.dateDetailModal.appointments.length, this.dateDetailModal.appointments)
        } else {
          this.dateDetailModal.appointments = []
        }
      } catch (error) {
        console.error('Error loading date details:', error)
        this.showToast('Error loading date details', 'error')
      } finally {
        this.dateDetailModal.loading = false
        // Scroll to active day after modal content loads
        this.$nextTick(() => {
          this.scrollToActiveDay('modal')
        })
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
        { time: `${hour}:00`, appointment: null, showTime: false },
        { time: `${hour}:30`, appointment: null, showTime: false }
      ]
      
      // Find appointments that match these time slots
      this.dateDetailModal.appointments.forEach(apt => {
        const aptTime = apt.time || ''
        const aptHour = parseInt(aptTime.split(':')[0])
        const aptMinute = parseInt(aptTime.split(':')[1]) || 0
        const duration = apt.totalDuration || 30
        
        // Check if appointment starts at :00 or :30 of this hour
        if (aptHour === parseInt(hour.split(':')[0])) {
          if (aptMinute === 0) {
            slots[0].appointment = apt
            slots[0].showTime = true
          } else if (aptMinute === 30) {
            slots[1].appointment = apt
            slots[1].showTime = true
          }
        }
      })
      
      return slots
    },
    formatAppointmentTime(appointment) {
      if (!appointment.time) return ''
      const startTime = appointment.time
      const duration = appointment.totalDuration || 30
      
      // Calculate end time
      const [hours, minutes] = startTime.split(':').map(Number)
      const totalMinutes = hours * 60 + minutes + duration
      const endHours = Math.floor(totalMinutes / 60)
      const endMinutes = totalMinutes % 60
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
      
      return `${startTime} - ${endTime}`
    },
    navigateToDate(date) {
      this.openDateDetailModal(date)
    },
    toggleCalendarView() {
      if (this.calendarViewMode === 'calendar') {
        // Switch to day view
        this.calendarViewMode = 'day'
        // Use selected calendar date if available, otherwise use today
        const dateToView = this.selectedCalendarDate || new Date().toISOString().split('T')[0]
        this.dayViewDate = dateToView
        // Load day view data
        this.loadDayViewData(dateToView)
      } else {
        // Switch back to calendar view
        this.calendarViewMode = 'calendar'
      }
    },
    async loadDayViewData(date) {
      if (!date) return
      
      this.dayViewData.loading = true
      this.dayViewDate = date
      
      try {
        // Check if date is restricted
        const restrictionCheck = await axios.get(`${process.env.VUE_APP_API_URL}/restrictions/check/${date}`)
        this.dayViewData.isRestricted = restrictionCheck.data.isRestricted
        this.dayViewData.restriction = restrictionCheck.data.restriction
        
        // Fetch appointments for this date
        if (!this.dayViewData.isRestricted) {
          // Refresh appointments first to ensure we have latest data
          await this.fetchAppointments()
          
          // Filter appointments for this date
          const dateAppointments = this.appointments.filter(apt => {
            if (!apt.date) return false
            const aptDate = typeof apt.date === 'string' ? apt.date.split('T')[0] : new Date(apt.date).toISOString().split('T')[0]
            return aptDate === date && apt.status !== 'cancelled'
          })
          
          // Sort by time
          this.dayViewData.appointments = dateAppointments.sort((a, b) => {
            if (!a.time || !b.time) return 0
            return a.time.localeCompare(b.time)
          })
        } else {
          this.dayViewData.appointments = []
        }
      } catch (error) {
        console.error('Error loading day view data:', error)
        this.showToast('Error loading day view data', 'error')
      } finally {
        this.dayViewData.loading = false
        // Scroll to active day after data loads
        this.$nextTick(() => {
          this.scrollToActiveDay('dayView')
        })
      }
    },
    navigateDayView(direction) {
      if (!this.dayViewDate) return
      
      // Parse date string safely (YYYY-MM-DD format)
      const [year, month, day] = this.dayViewDate.split('-').map(Number)
      const currentDate = new Date(year, month - 1, day)
      currentDate.setDate(currentDate.getDate() + direction)
      
      // Format back to YYYY-MM-DD
      const newYear = currentDate.getFullYear()
      const newMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
      const newDay = String(currentDate.getDate()).padStart(2, '0')
      const newDate = `${newYear}-${newMonth}-${newDay}`
      
      this.loadDayViewData(newDate)
    },
    goToTodayDayView() {
      const today = new Date().toISOString().split('T')[0]
      this.loadDayViewData(today)
    },
    navigateToDayViewDate(date) {
      this.loadDayViewData(date)
    },
    navigateWeek(direction, context) {
      const days = direction === 'next' ? 7 : -7
      if (context === 'dayView') {
        const currentDate = new Date(this.dayViewDate)
        currentDate.setDate(currentDate.getDate() + days)
        this.loadDayViewData(currentDate.toISOString().split('T')[0])
      } else if (context === 'modal') {
        const currentDate = new Date(this.dateDetailModal.dateString)
        currentDate.setDate(currentDate.getDate() + days)
        this.openDateDetailModal(currentDate.toISOString().split('T')[0])
      }
    },
    startDrag(event, context) {
      const slider = context === 'dayView' ? this.$refs.dayViewWeekSlider : this.$refs.modalWeekSlider
      if (!slider) return

      this.dragState = {
        isDragging: true,
        startX: event.type.includes('touch') ? event.touches[0].pageX : event.pageX,
        scrollLeft: slider.scrollLeft,
        context
      }
      slider.classList.add('dragging')
    },
    onDrag(event, context) {
      if (!this.dragState || !this.dragState.isDragging || this.dragState.context !== context) return

      event.preventDefault()
      const slider = context === 'dayView' ? this.$refs.dayViewWeekSlider : this.$refs.modalWeekSlider
      if (!slider) return

      const x = event.type.includes('touch') ? event.touches[0].pageX : event.pageX
      const walk = (x - this.dragState.startX) * 1.5
      slider.scrollLeft = this.dragState.scrollLeft - walk
    },
    endDrag(context) {
      if (!this.dragState || this.dragState.context !== context) return

      const slider = context === 'dayView' ? this.$refs.dayViewWeekSlider : this.$refs.modalWeekSlider
      if (slider) {
        slider.classList.remove('dragging')
      }

      this.dragState = null
    },
    scrollToActiveDay(context) {
      this.$nextTick(() => {
        const slider = context === 'dayView' ? this.$refs.dayViewWeekSlider : this.$refs.modalWeekSlider
        if (!slider) return

        const activeCell = slider.querySelector('.week-day-cell.active')
        if (activeCell) {
          const sliderRect = slider.getBoundingClientRect()
          const cellRect = activeCell.getBoundingClientRect()
          const scrollOffset = cellRect.left - sliderRect.left - (sliderRect.width / 2) + (cellRect.width / 2)
          slider.scrollBy({ left: scrollOffset, behavior: 'smooth' })
        }
      })
    },
    async toggleDayViewOffDate(event) {
      const isRestricted = event.target.checked
      const date = this.dayViewDate
      
      try {
        if (isRestricted) {
          // Mark as off date
          await axios.post(`${process.env.VUE_APP_API_URL}/restrictions`, {
            date: date,
            reason: 'Off Date'
          })
          this.dayViewData.isRestricted = true
          this.showToast('Date marked as off date', 'success')
          
          // Refresh restrictions list
          await this.fetchRestrictions()
          
          // Refresh appointments to update calendar
          await this.fetchAppointments()
          
          // Reload day view data
          await this.loadDayViewData(date)
        } else {
          // Remove off date
          await axios.delete(`${process.env.VUE_APP_API_URL}/restrictions/date/${date}`)
          this.dayViewData.isRestricted = false
          this.dayViewData.restriction = null
          this.showToast('Off date removed', 'success')
          
          // Refresh restrictions list
          await this.fetchRestrictions()
          
          // Refresh appointments to update calendar
          await this.fetchAppointments()
          
          // Reload day view data
          await this.loadDayViewData(date)
        }
      } catch (error) {
        console.error('Error toggling off date:', error)
        this.showToast(error.response?.data?.message || 'Error updating off date', 'error')
        // Revert checkbox
        event.target.checked = !isRestricted
      }
    },
    async toggleCalendarOffDate(event) {
      const isRestricted = event.target.checked
      const date = this.selectedCalendarDate
      
      if (!date) return
      
      try {
        if (isRestricted) {
          // Mark as off date
          await axios.post(`${process.env.VUE_APP_API_URL}/restrictions`, {
            date: date,
            reason: 'Off Date'
          })
          this.showToast('Date marked as off date', 'success')
        } else {
          // Remove off date
          await axios.delete(`${process.env.VUE_APP_API_URL}/restrictions/date/${date}`)
          this.showToast('Off date removed', 'success')
        }
        
        // Refresh restrictions list
        await this.fetchRestrictions()
        
        // Refresh appointments to update calendar
        await this.fetchAppointments()
      } catch (error) {
        console.error('Error toggling calendar off date:', error)
        this.showToast(error.response?.data?.message || 'Error updating off date', 'error')
        // Revert checkbox
        event.target.checked = !isRestricted
      }
    },
    getDayViewHalfHourSlots(hour) {
      // Return two half-hour slots: :00 and :30
      const slots = [
        { time: `${hour}:00`, appointment: null, showTime: false },
        { time: `${hour}:30`, appointment: null, showTime: false }
      ]
      
      // Find appointments that match these time slots
      this.dayViewData.appointments.forEach(apt => {
        const aptTime = apt.time || ''
        const aptHour = parseInt(aptTime.split(':')[0])
        const aptMinute = parseInt(aptTime.split(':')[1]) || 0
        const duration = apt.totalDuration || 30
        
        // Check if appointment starts at :00 or :30 of this hour
        if (aptHour === parseInt(hour.split(':')[0])) {
          if (aptMinute === 0) {
            slots[0].appointment = apt
            slots[0].showTime = true
          } else if (aptMinute === 30) {
            slots[1].appointment = apt
            slots[1].showTime = true
          }
        }
      })
      
      return slots
    },
    async handleSlotClick(slot, date) {
      // Only handle clicks on empty slots
      if (!slot.appointment && date && slot.time) {
        // Check if this slot conflicts with any existing appointment
        const slotTime = slot.time
        const slotHour = parseInt(slotTime.split(':')[0])
        const slotMinute = parseInt(slotTime.split(':')[1]) || 0
        const slotTimeMinutes = slotHour * 60 + slotMinute
        
        // Check if any appointment overlaps with this slot
        const hasConflict = this.dayViewData.appointments.some(apt => {
          if (!apt.time) return false
          const aptTime = apt.time
          const aptHour = parseInt(aptTime.split(':')[0])
          const aptMinute = parseInt(aptTime.split(':')[1]) || 0
          const aptTimeMinutes = aptHour * 60 + aptMinute
          const aptDuration = apt.totalDuration || 30
          const aptEndMinutes = aptTimeMinutes + aptDuration
          
          // Check if slot time falls within the appointment time range
          // Slot is blocked if it's between appointment start and end (exclusive of start, inclusive of end)
          return slotTimeMinutes >= aptTimeMinutes && slotTimeMinutes < aptEndMinutes
        })
        
        if (hasConflict) {
          this.showToast('This time slot conflicts with an existing appointment', 'warning')
          return
        }
        
        // Normalize time format - remove seconds if present (e.g., "14:00:30" -> "14:00")
        const normalizedTime = slot.time.split(':').slice(0, 2).join(':')

        // Set the booking form with the selected date and time
        this.bookingForm.date = date
        this.bookingForm.time = normalizedTime

        // Set the booking calendar to show the selected date's month
        const selectedDate = new Date(date)
        this.bookingCalendarMonth = selectedDate.getMonth()
        this.bookingCalendarYear = selectedDate.getFullYear()

        // Mark that this booking is from a slot click (hide calendar/time in modal)
        this.bookingFromSlotClick = true
        // Ensure customers are loaded before opening modal
        if (this.customers.length === 0) {
          await this.fetchCustomers()
        }
        // Open the booking modal
        this.showBookingModal = true

        // Don't fetch available slots when opening from slot click
        // The time is already selected and guaranteed to be available
        // Slots will be fetched when service is selected if needed
      }
    },
    getServiceNames(appointment) {
      if (!appointment.services) {
        return 'No service'
      }
      
      // Handle different service formats
      if (Array.isArray(appointment.services)) {
        if (appointment.services.length === 0) {
          return 'No service'
        }
        // Check if services are objects with name property or just strings/IDs
        const serviceNames = appointment.services.map(s => {
          if (typeof s === 'object' && s !== null) {
            return s.name || s.title || 'Service'
          }
          return s
        }).filter(name => name && name !== 'No service')
        
        return serviceNames.length > 0 ? serviceNames.join(', ') : 'No service'
      }
      
      // If it's a single service object
      if (typeof appointment.services === 'object' && appointment.services !== null) {
        return appointment.services.name || appointment.services.title || 'Service'
      }
      
      return appointment.services.toString()
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
        
        // Store the appointment date for syncing views
        const appointmentDate = this.responseModal.appointment.date.split('T')[0]
        
        await axios.put(`${process.env.VUE_APP_API_URL}/appointments/${this.responseModal.appointment._id}`, {
          status: this.responseModal.status,
          responseMessage: this.responseModal.message,
          sendEmail: true
        })
        
        await this.fetchAppointments()
        
        // Sync day view if viewing the appointment date
        if (this.calendarViewMode === 'day' && this.dayViewDate === appointmentDate) {
          this.syncDayViewData()
        }
        
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
        // Store the appointment date for syncing views
        const appointmentDate = this.cancelModal.appointment.date.split('T')[0]
        
        await axios.put(`${process.env.VUE_APP_API_URL}/appointments/${this.cancelModal.appointment._id}`, {
          status: 'cancelled',
          responseMessage: this.cancelModal.message || 'Appointment has been cancelled.',
          sendEmail: true
        })
        
        await this.fetchAppointments()
        
        // Sync day view if viewing the appointment date
        if (this.calendarViewMode === 'day' && this.dayViewDate === appointmentDate) {
          this.syncDayViewData()
        }
        
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
      // Ensure customers are loaded before opening modal
      if (this.customers.length === 0) {
        this.fetchCustomers()
      }
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
  /* Desktop-specific styles can be added here if needed */
  
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
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
  }
  
  .appointments-card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
  }
  
  .appointments-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    padding: 0.5rem 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  }
  
  .appointments-list::-webkit-scrollbar {
    width: 6px;
  }
  
  .appointments-list::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .appointments-list::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  .appointments-list::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
  

  
  .timeslots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
}

/* ============================================
   ADMIN HEADER - Clean, Non-overlapping Design
   ============================================ */
.admin-header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  overflow: visible;
}

.admin-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  gap: 0.5rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;
}

.admin-brand-section {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.admin-brand-logo {
  height: 36px;
  width: auto;
  max-width: 150px;
  object-fit: contain;
  display: block;
}

.admin-brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
}

.admin-toolbar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  flex-wrap: nowrap;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.toolbar-btn:hover {
  background: var(--bg-primary);
}

.toolbar-btn:active {
  transform: scale(0.95);
}

.toolbar-btn-outline {
  background: transparent;
  border: 1.5px solid var(--primary);
  color: var(--primary);
}

.toolbar-btn-outline:hover {
  background: var(--primary);
  color: white;
}

.admin-avatar-btn {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 0.9rem;
}

.admin-avatar-btn:hover {
  opacity: 0.9;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

/* Theme Toggle Switch - GPU Optimized */
.theme-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--bg-tertiary);
  border-radius: 24px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  will-change: background-color;
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-switch:hover {
  background: var(--bg-primary);
}

.theme-switch:active {
  transform: scale(0.98);
}

.theme-switch-icon {
  font-size: 0.85rem;
  will-change: transform, opacity;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-switch-icon.fa-sun {
  color: #f59e0b;
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.theme-switch-icon.fa-moon {
  color: #6366f1;
  opacity: 0.5;
  transform: scale(0.85);
}

.theme-switch.active .theme-switch-icon.fa-sun {
  opacity: 0.5;
  transform: scale(0.85);
}

.theme-switch.active .theme-switch-icon.fa-moon {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.theme-switch-slider {
  width: 44px;
  height: 24px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 12px;
  position: relative;
  will-change: background;
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.theme-switch-slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  will-change: transform;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.theme-switch.active .theme-switch-slider {
  background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
}

.theme-switch.active .theme-switch-slider::before {
  transform: translateX(20px);
}

/* Admin Dropdown & Logout Button - GPU Optimized */
.admin-dropdown {
  min-width: 200px;
  padding: 0.5rem 0;
  border-radius: 12px;
  border: 1px solid var(--border-color, rgba(0,0,0,0.1));
  z-index: 1050;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: calc(100% - 1rem);
  margin: 0.5rem 0.5rem;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  will-change: transform, box-shadow;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
}

.logout-btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
}

.logout-btn i {
  font-size: 1rem;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.logout-btn:hover i {
  transform: translateX(-2px);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
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
  background-color: rgba(107, 114, 128, 0.05);
  border-left-color: #6b7280;
}

.list-group-item.active {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.1) 100%);
  border-left-color: #6b7280;
  color: #6b7280;
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
  background-color: rgba(107, 114, 128, 0.05);
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
  border-color: #6b7280;
  box-shadow: 0 0 0 0.2rem rgba(107, 114, 128, 0.25);
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

/* ============================================
   ADMIN NAVIGATION - Full Width Mobile Design
   ============================================ */
.admin-nav-container {
  padding: 0 0.5rem 0.75rem;
}

.admin-nav {
  display: flex;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 0.375rem;
  box-shadow: var(--shadow-sm);
  gap: 0.25rem;
  /* iOS Safari scroll fix */
  -webkit-overflow-scrolling: touch;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.admin-nav::-webkit-scrollbar {
  display: none;
}

.admin-nav-item {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.625rem 0.5rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.admin-nav-item i {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.admin-nav-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.admin-nav-item:hover {
  background: rgba(107, 114, 128, 0.1);
  color: var(--primary);
}

.admin-nav-item:active {
  transform: scale(0.97);
}

.admin-nav-item.active {
  background: var(--primary);
  color: white;
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.25);
}

.admin-nav-item.active:hover {
  background: var(--primary);
  color: white;
}

/* ============================================
   RESPONSIVE - Tablet (max-width: 991px)
   ============================================ */
@media (max-width: 991px) {
  .admin-header-inner {
    padding: 0.5rem 0.75rem;
  }

  .admin-brand-text {
    font-size: 1rem;
  }

  .toolbar-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .admin-avatar-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .admin-nav-container {
    padding: 0 0.375rem 0.5rem;
  }

  .admin-nav {
    padding: 0.25rem;
    border-radius: 10px;
  }

  .admin-nav-item {
    padding: 0.5rem 0.25rem;
    font-size: 0.65rem;
    min-height: 52px;
  }

  .admin-nav-item i {
    font-size: 1rem;
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

/* Remove unwanted button animations and shadows */
.btn:active,
.btn:focus,
.btn:focus-visible {
  animation: none !important;
  transform: none !important;
  box-shadow: none !important;
  outline: none !important;
}

/* Specifically for buttons in card-header */
.card-header .btn:active,
.card-header .btn:focus,
.card-header .btn:focus-visible {
  animation: none !important;
  transform: none !important;
  box-shadow: none !important;
  outline: none !important;
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

/* ============================================
   RESPONSIVE - Mobile (max-width: 768px)
   ============================================ */
@media (max-width: 768px) {
  .admin-header-inner {
    padding: 0.5rem 0.625rem;
    gap: 0.375rem;
    overflow: visible;
  }

  .admin-brand-section {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
  }

  .admin-brand-logo {
    height: 30px;
    max-width: 120px;
  }

  .admin-brand-text {
    font-size: 0.85rem;
    letter-spacing: 0.25px;
    max-width: 100%;
  }

  .admin-toolbar {
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .toolbar-btn {
    width: 32px;
    height: 32px;
    font-size: 0.7rem;
    border-radius: 6px;
    padding: 0;
  }

  .admin-avatar-btn {
    width: 32px;
    height: 32px;
    font-size: 0.7rem;
  }

  .admin-nav-container {
    padding: 0 0.25rem 0.5rem;
  }

  .admin-nav {
    padding: 0.2rem;
    border-radius: 8px;
    gap: 0.125rem;
  }

  .admin-nav-item {
    padding: 0.4rem 0.2rem;
    font-size: 0.6rem;
    gap: 0.2rem;
    min-height: 48px;
    border-radius: 6px;
  }

  .admin-nav-item i {
    font-size: 0.95rem;
  }
}

/* ============================================
   RESPONSIVE - Small Mobile (max-width: 380px)
   ============================================ */
@media (max-width: 380px) {
  .admin-header-inner {
    padding: 0.375rem 0.5rem;
    gap: 0.25rem;
  }

  .admin-brand-section {
    flex: 0 1 auto;
    min-width: 0;
  }

  .admin-brand-logo {
    height: 26px;
    max-width: 100px;
  }

  .admin-brand-text {
    font-size: 0.75rem;
    letter-spacing: 0;
  }

  .admin-toolbar {
    gap: 0.15rem;
  }

  .toolbar-btn {
    width: 26px;
    height: 26px;
    font-size: 0.6rem;
    border-radius: 5px;
  }

  .toolbar-btn-outline {
    border-width: 1px;
  }

  .admin-avatar-btn {
    width: 28px;
    height: 28px;
    font-size: 0.65rem;
  }

  .admin-nav-item {
    padding: 0.35rem 0.15rem;
    font-size: 0.55rem;
    min-height: 44px;
  }

  .admin-nav-item i {
    font-size: 0.9rem;
  }
}

/* ============================================
   DESKTOP Enhancements (min-width: 992px)
   ============================================ */
@media (min-width: 992px) {
  .admin-header-inner {
    padding: 0.875rem 1.5rem;
  }

  .admin-brand-text {
    font-size: 1.35rem;
  }

  .toolbar-btn {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }

  .admin-avatar-btn {
    width: 40px;
    height: 40px;
  }

  .admin-nav-container {
    padding: 0 1rem 1rem;
  }

  .admin-nav {
    padding: 0.5rem;
    border-radius: 14px;
    gap: 0.375rem;
  }

  .admin-nav-item {
    flex-direction: row;
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
    gap: 0.625rem;
    min-height: auto;
  }

  .admin-nav-item i {
    font-size: 1.1rem;
  }
}

.dropdown-header {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
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
  background: rgba(107, 114, 128, 0.1);
  border: 2px solid var(--primary);
}

.calendar-day.selected {
  background: rgba(107, 114, 128, 0.2);
  border: 2px solid var(--primary);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
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

.time-slots-grid.mobile-optimized {
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 10px;
  max-height: 250px;
  -webkit-overflow-scrolling: touch;
}

.time-slots-grid.mobile-optimized .btn.time-slot-btn {
  min-height: 44px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Week Date Picker for Edit Modal */
.week-date-picker {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--border-color);
}

.week-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
}

.week-nav-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  -webkit-appearance: none;
  appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(107, 114, 128, 0.1);
}

.week-nav-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.week-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.week-display {
  flex: 1;
  text-align: center;
}

.week-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.week-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

/* Week picker cells for Edit Appointment Modal */
.week-date-picker .week-day-cell {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  z-index: 10;
  -webkit-appearance: none;
  appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(107, 114, 128, 0.1);
  -webkit-user-select: none;
  user-select: none;
}

.week-date-picker .week-day-cell:hover:not(.past):not(.off-date) {
  background: var(--primary-color-light);
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.week-date-picker .week-day-cell.selected {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.week-date-picker .week-day-cell.today:not(.selected) {
  border-color: var(--primary-color);
  background: var(--primary-color-light);
  color: var(--text-primary);
}

.week-date-picker .week-day-cell.past {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.week-date-picker .week-day-cell.off-date {
  opacity: 0.5;
  cursor: not-allowed;
  background: repeating-linear-gradient(
    45deg,
    var(--bg-tertiary),
    var(--bg-tertiary) 10px,
    var(--bg-secondary) 10px,
    var(--bg-secondary) 20px
  );
  color: var(--text-secondary);
}

.week-date-picker .week-day-cell .day-name {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
  opacity: 0.8;
  color: inherit;
}

.week-date-picker .week-day-cell .day-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: inherit;
}

.week-date-picker .week-day-cell .month-label {
  font-size: 0.65rem;
  margin-top: 4px;
  opacity: 0.7;
  font-weight: 500;
  color: inherit;
}

.week-date-picker .week-day-cell.selected .day-name,
.week-date-picker .week-day-cell.selected .day-number,
.week-date-picker .week-day-cell.selected .month-label {
  color: white;
  opacity: 1;
}

/* Appointment Cards */
.appointments-list {
  max-height: 400px;
  overflow-y: auto;
}

.appointment-card {
  position: relative;
  padding: 0.75rem 1rem;
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
  flex: 1;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
    border-radius: 10px;
    padding: 0.75rem 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid var(--border-color);
    margin-bottom: 0.75rem !important;
    width: 100%;
    max-width: 100%;
  }
  
  .mobile-calendar-controls .d-flex.justify-content-between {
    margin-bottom: 0.75rem;
  }
  
  .mobile-calendar-controls h6 {
    font-size: 0.9rem;
    padding: 0 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% - 100px);
  }
  
  .mobile-calendar-controls .btn-sm {
    min-width: 36px;
    height: 36px;
    padding: 0.375rem 0.5rem;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .mobile-calendar-controls .btn-sm i {
    font-size: 0.75rem;
  }
  
  .mobile-calendar-controls .d-flex.gap-2 {
    gap: 0.5rem !important;
    flex-wrap: wrap;
  }
  
  .mobile-calendar-controls .d-flex.gap-2 .btn-sm {
    flex: 1;
    min-width: auto;
    font-size: 0.75rem;
    padding: 0.4rem 0.5rem;
  }
  
  .mobile-calendar-controls .d-flex.gap-2 .btn-sm i {
    margin-right: 0.25rem;
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
    position: relative;
    z-index: 10;
  }
  
  .appointment-actions .btn {
    position: relative;
    z-index: 10;
    -webkit-appearance: none;
    appearance: none;
    touch-action: manipulation;
    min-height: 44px;
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

  .admin-header {
    padding: 0.25rem 0 !important;
    margin-bottom: 0.5rem !important;
  }

  .admin-header.py-3 {
    padding-top: 0.25rem !important;
    padding-bottom: 0.25rem !important;
  }

  .admin-header.mb-4 {
    margin-bottom: 0.5rem !important;
  }

  .admin-header .container-fluid {
    padding-left: 0.375rem;
    padding-right: 0.375rem;
  }

  .admin-header h2 {
    font-size: 1rem;
  }

  .admin-brand-section {
    flex: 1;
    min-width: 0;
  }

  .admin-brand-text {
    font-size: 0.8rem !important;
    letter-spacing: 0.2px;
  }

  .admin-header p {
    font-size: 0.7rem;
  }

  .admin-avatar {
    width: 32px !important;
    height: 32px !important;
    font-size: 0.8rem !important;
    border-radius: 6px;
  }

  .action-toolbar {
    gap: 0.375rem !important;
  }

  .action-toolbar .btn-sm {
    padding: 0.2rem 0.4rem !important;
    font-size: 0.65rem !important;
  }

  .action-toolbar .theme-switch {
    padding: 4px 6px !important;
    gap: 4px !important;
  }

  .action-toolbar .theme-switch-slider {
    width: 32px !important;
    height: 18px !important;
    border-radius: 9px !important;
  }

  .action-toolbar .theme-switch-slider::before {
    width: 14px !important;
    height: 14px !important;
    top: 2px !important;
    left: 2px !important;
  }

  .action-toolbar .theme-switch.active .theme-switch-slider::before {
    transform: translateX(14px) !important;
  }

  .action-toolbar .theme-switch-icon {
    font-size: 0.7rem !important;
  }

  .action-toolbar .dropdown .d-flex.flex-column {
    gap: 0.2rem !important;
  }

  .action-toolbar .dropdown .btn-sm {
    font-size: 0.5rem !important;
    padding: 0.1rem 0.25rem !important;
  }

  .mobile-action-btn {
    font-size: 0.55rem !important;
    padding: 0.15rem 0.3rem !important;
    min-width: auto;
    line-height: 1.1;
  }

  .admin-header .col {
    padding-left: 0.125rem;
    padding-right: 0.125rem;
  }

  .admin-header .col-auto {
    padding-left: 0.125rem;
    padding-right: 0.125rem;
    flex-shrink: 0;
  }

  .admin-brand-text {
    display: none !important;
  }

  .admin-info {
    font-size: 0.75rem;
  }

  /* Navigation Tabs - Small Mobile */
  .nav-tabs-wrapper {
    padding: 0.2rem !important;
    margin: 0 0.15rem 0.35rem 0.15rem !important;
    border-radius: 6px !important;
    box-shadow: var(--shadow-sm) !important;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .nav-tabs-wrapper::-webkit-scrollbar {
    height: 0;
    display: none;
  }

  .mobile-nav {
    display: flex !important;
    flex-wrap: nowrap !important;
    gap: 0.1rem !important;
    overflow-x: auto;
  }

  .mobile-nav .nav-item {
    flex: 0 0 auto !important;
    min-width: 52px;
    max-width: 60px;
  }

  .mobile-nav .nav-link {
    padding: 0.35rem 0.25rem !important;
    min-width: 52px;
    min-height: 44px !important;
    gap: 0.15rem !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 5px !important;
  }

  .mobile-nav .nav-icon {
    font-size: 0.8rem !important;
    margin-bottom: 0;
  }

  .mobile-nav .nav-text {
    font-size: 0.55rem !important;
    line-height: 1;
    font-weight: 500;
  }

  .nav-badge {
    top: 2px;
    right: 2px;
    min-width: 10px;
    height: 10px;
    font-size: 0.5rem;
  }
  
  /* Calendar Grid Mobile Optimization */
  .calendar-grid {
    gap: 4px !important;
    padding: 6px !important;
  }
  
  .calendar-day {
    min-height: 32px;
    padding: 2px 1px;
    border-radius: 4px !important;
  }
  
  .calendar-header {
    padding: 4px 2px;
    font-size: 0.6rem;
    font-weight: 600;
  }
  
  .day-number {
    font-size: 0.65rem;
    margin-bottom: 0;
  }
  
  .booking-badge {
    width: 12px;
    height: 12px;
    font-size: 0.5rem;
    top: 2px;
    right: 2px;
  }
  
  .off-date-icon {
    font-size: 0.6rem !important;
    top: 2px;
    right: 2px;
  }
  
  /* iOS Safari Calendar Optimization */
  .calendar-grid {
    -webkit-overflow-scrolling: touch;
  }
  
  .calendar-day {
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.1);
  }
  
  .card-body {
    padding: 0.75rem;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .mobile-calendar-controls {
    padding: 0.5rem 0.375rem;
    border-radius: 8px;
    margin-bottom: 0.5rem !important;
  }
  
  .mobile-calendar-controls .d-flex.justify-content-between {
    margin-bottom: 0.5rem;
  }
  
  .mobile-calendar-controls h6 {
    font-size: 0.8rem;
    padding: 0 0.25rem;
    max-width: calc(100% - 80px);
  }
  
  .mobile-calendar-controls .btn-sm {
    min-width: 32px;
    height: 32px;
    padding: 0.25rem 0.375rem;
    font-size: 0.7rem;
  }
  
  .mobile-calendar-controls .btn-sm i {
    font-size: 0.65rem;
  }
  
  .mobile-calendar-controls .d-flex.gap-2 {
    gap: 0.375rem !important;
  }
  
  .mobile-calendar-controls .d-flex.gap-2 .btn-sm {
    font-size: 0.7rem;
    padding: 0.3rem 0.4rem;
    flex: 1 1 auto;
    min-width: 0;
  }
  
  .mobile-calendar-controls .d-flex.gap-2 .btn-sm i {
    margin-right: 0.2rem;
    font-size: 0.65rem;
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
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
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
  background: rgba(107, 114, 128, 0.95);
  color: white;
}

.toast-error {
  background: rgba(107, 114, 128, 0.95);
  color: white;
}

.toast-warning {
  background: rgba(107, 114, 128, 0.95);
  color: white;
}

.toast-info {
  background: rgba(107, 114, 128, 0.95);
  color: white;
}

/* Customer Search Dropdown */
.customer-search-container {
  position: relative;
  z-index: 1070;
  isolation: isolate;
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
  z-index: 1070;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 0.25rem;
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.customer-list {
  padding: 0.5rem 0;
}

.customer-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--border-color);
  position: relative;
  z-index: 10;
  -webkit-appearance: none;
  appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(107, 114, 128, 0.1);
  min-height: 44px;
  display: flex;
  align-items: center;
  -webkit-user-select: none;
  user-select: none;
}

.customer-item:last-child {
  border-bottom: none;
}

.customer-item:hover {
  background-color: var(--bg-tertiary);
}

.customer-item:active {
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
  background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
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
  width: 100%;
  box-sizing: border-box;
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
  border-color: #6b7280;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.15);
}

.day-cell-pro.today:not(.selected) {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #6b7280;
  font-weight: 700;
}

.day-cell-pro.today:not(.selected) .day-number-pro {
  color: #1e40af;
}

.day-cell-pro.selected {
  background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
  color: white;
  border-color: #505050;
  box-shadow: 0 8px 24px rgba(60, 60, 60, 0.4);
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
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.today-indicator {
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  background: #6b7280;
  border-radius: 50%;
}

.selected-date-pro {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-top: 2px solid #6b7280;
  margin-top: 0;
}

.selected-date-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(60, 60, 60, 0.3);
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
  color: var(--text-primary);
}

/* Dark mode styles for professional calendar */
.dark-theme .professional-date-picker {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.dark-theme .date-picker-header-pro {
  background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
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
  background: rgba(150, 150, 150, 0.2);
  border-color: #707070;
}

.dark-theme .day-cell-pro.today:not(.selected) {
  background: rgba(150, 150, 150, 0.25);
  border-color: #808080;
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
  background: rgba(150, 150, 150, 0.1);
  border-top-color: #707070;
}

.dark-theme .selected-date-value {
  color: #ffffff !important;
}

.dark-theme .selected-date-label {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* ==========================================
   Mobile Week Picker Styles
   Optimized for mobile devices and iOS Safari
   ========================================== */
.mobile-week-picker {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  /* iOS Safari optimizations */
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
}

.week-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
  color: white;
}

.week-nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  /* Prevent iOS zoom on tap */
  touch-action: manipulation;
}

.week-nav-btn:active:not(.disabled) {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(0.95);
}

.week-nav-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.week-range-display {
  text-align: center;
  flex: 1;
}

.week-range-text {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.week-strip-container {
  padding: 8px;
  background: #f8fafc;
  /* iOS Safari smooth scrolling */
  -webkit-overflow-scrolling: touch;
  overflow-x: auto;
  overflow-y: hidden;
}

.week-strip {
  display: flex;
  gap: 6px;
  justify-content: space-between;
  min-width: 100%;
}

.week-day-cell {
  flex: 1;
  min-width: 44px;
  max-width: 52px;
  padding: 8px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border: 2px solid transparent;
  /* iOS tap optimizations */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  /* Prevent text selection on tap */
  -webkit-user-select: none;
  user-select: none;
}

.week-day-cell:active:not(.past):not(.off-date) {
  transform: scale(0.95);
}

.week-day-name {
  font-size: 0.65rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.week-day-number {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary, #1a1a1a);
}

.week-day-cell.today:not(.selected) {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #6b7280;
}

.week-day-cell.today:not(.selected) .week-day-number {
  color: #1e40af;
}

.week-day-cell.selected {
  background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
  border-color: #505050;
  box-shadow: 0 4px 12px rgba(60, 60, 60, 0.3);
  transform: scale(1.05);
}

.week-day-cell.selected .week-day-name,
.week-day-cell.selected .week-day-number {
  color: white;
}

.week-day-cell.past {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f1f5f9;
}

.week-day-cell.off-date {
  opacity: 0.3;
  cursor: not-allowed;
  background: #fef2f2;
  border-color: #fecaca;
}

.week-selected-date {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-top: 1px solid #e2e8f0;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary, #1a1a1a);
}

/* Dark theme for mobile week picker */
.dark-theme .mobile-week-picker {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.dark-theme .week-picker-header {
  background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
}

.dark-theme .week-strip-container {
  background: var(--bg-primary);
}

.dark-theme .week-day-cell {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.dark-theme .week-day-name {
  color: var(--text-secondary);
}

.dark-theme .week-day-number {
  color: #ffffff;
}

.dark-theme .week-day-cell.today:not(.selected) {
  background: rgba(150, 150, 150, 0.25);
  border-color: #808080;
}

.dark-theme .week-day-cell.today:not(.selected) .week-day-number {
  color: #ffffff;
}

.dark-theme .week-day-cell.past {
  background: var(--bg-primary);
  opacity: 0.35;
}

.dark-theme .week-day-cell.off-date {
  background: rgba(255, 100, 100, 0.1);
  border-color: rgba(255, 100, 100, 0.3);
}

.dark-theme .week-selected-date {
  background: rgba(150, 150, 150, 0.1);
  border-top-color: var(--border-color);
  color: #ffffff;
}

/* Extra small screens - even more compact */
@media (max-width: 360px) {
  .week-day-cell {
    min-width: 38px;
    padding: 6px 2px;
  }

  .week-day-name {
    font-size: 0.6rem;
  }

  .week-day-number {
    font-size: 0.9rem;
  }

  .week-picker-header {
    padding: 10px 12px;
  }

  .week-nav-btn {
    width: 32px;
    height: 32px;
  }

  .week-range-text {
    font-size: 0.8rem;
  }

  .week-selected-date {
    padding: 8px 12px;
    font-size: 0.8rem;
  }
}

/* iOS Safari specific fixes */
@supports (-webkit-touch-callout: none) {
  .mobile-week-picker {
    /* Fix for iOS Safari rendering issues */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }

  .week-day-cell {
    /* Prevent iOS double-tap zoom */
    touch-action: manipulation;
  }

  .week-strip-container {
    /* Momentum scrolling for iOS */
    -webkit-overflow-scrolling: touch;
  }

  .week-nav-btn {
    /* Larger tap targets for iOS */
    min-width: 44px;
    min-height: 44px;
  }
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
  border-color: #6b7280;
  box-shadow: 0 0 0 0.2rem rgba(107, 114, 128, 0.25);
  z-index: 3;
}

.input-group .form-control:focus + .btn {
  border-color: #6b7280;
}
/* Date Detail Modal Styles */
.date-time-schedule {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Week Navigation Container */
.week-navigation-container {
  display: flex;
  align-items: center;
  background: var(--bg-secondary, #f8f9fa);
  border-bottom: 1px solid var(--border-color, #dee2e6);
  padding: 8px;
  gap: 6px;
}

/* No arrows variant - full width swipeable */
.week-navigation-container.no-arrows {
  padding: 8px;
  gap: 8px;
}

.week-navigation-container.no-arrows .week-navigation-row {
  flex: 1;
}

.week-nav-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  border: none;
  border-radius: 8px;
  background: var(--bg-tertiary, white);
  color: var(--text-secondary, #6c757d);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.week-nav-arrow:hover {
  background: var(--primary, #4a4a4a);
  color: white;
  transform: scale(1.05);
}

.week-nav-arrow:active {
  transform: scale(0.95);
}

.week-nav-arrow i {
  font-size: 0.75rem;
}

/* Week Navigation Row - Swipeable */
.week-navigation-row {
  display: flex;
  flex: 1;
  gap: 4px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: grab;
  user-select: none;
  padding: 2px;
}

.week-navigation-row.swipeable {
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.week-navigation-row::-webkit-scrollbar {
  display: none;
}

.week-navigation-row.dragging {
  cursor: grabbing;
  scroll-behavior: auto;
  scroll-snap-type: none;
}

.week-day-cell {
  flex: 0 0 auto;
  min-width: 48px;
  width: calc((100% - 28px) / 7); /* Fit 7 days in view minus KW cell */
  max-width: 60px;
  text-align: center;
  padding: 8px 4px;
  cursor: pointer;
  border-radius: 10px;
  background: var(--bg-tertiary, white);
  will-change: transform, background-color;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
              background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  scroll-snap-align: start;
  -webkit-tap-highlight-color: transparent;
  touch-action: pan-x;
}

.week-day-cell:hover {
  background: var(--bg-primary, #e9ecef);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.week-day-cell:active {
  transform: scale(0.97);
}

.week-day-cell.active {
  background: linear-gradient(135deg, #4a4a4a 0%, #2d2d2d 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(74, 74, 74, 0.3);
}

.week-day-cell.active .week-day-name,
.week-day-cell.active .week-day-number {
  color: white;
}

.week-day-cell.today:not(.active) {
  border: 2px solid #10b981;
  background: rgba(16, 185, 129, 0.08);
}

.week-day-cell.today:not(.active) .week-day-number {
  color: #10b981;
}

.week-day-name {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-secondary, #6c757d);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
}

.week-day-number {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary, #212529);
  line-height: 1.2;
}

.calendar-week-cell {
  min-width: 42px;
  text-align: center;
  padding: 6px 6px;
  background: var(--bg-tertiary, white);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-left: 2px solid var(--border-color, #dee2e6);
  margin-left: 2px;
}

.calendar-week-label {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--text-secondary, #6c757d);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1px;
}

.calendar-week-number {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary, #212529);
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
  padding: 8px;
  text-align: center;
  font-weight: 600;
  color: #495057;
}

.half-hour-slot-header-left,
.half-hour-slot-header-right {
  flex: 1;
  padding: 8px;
  text-align: center;
  position: relative;
}

.half-hour-slot-header-left::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  bottom: 20%;
  width: 1px;
  background: #e9ecef;
}

.half-hour-slot-header-right {
  border-right: none;
}

.schedule-body {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  .schedule-body {
    max-height: calc(100vh - 300px);
  }
}

@media (max-width: 576px) {
  .schedule-body {
    max-height: calc(100vh - 250px);
  }
}

.schedule-row-wrapper {
  border-bottom: 1px solid #e9ecef;
}

.schedule-row {
  display: flex;
  min-height: 50px;
}

.schedule-row.row-pink {
  background-color: transparent;
}

.schedule-row.row-green {
  background-color: transparent;
}

.schedule-row:hover {
  opacity: 0.9;
}

.time-column {
  width: 60px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #dee2e6;
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  align-self: stretch;
  font-size: 0.85rem;
}

.time-label {
  font-size: 0.8rem;
}

.slots-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.half-hour-slot {
  width: 100%;
  padding: 4px;
  min-height: 25px;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #e9ecef;
}

.half-hour-slot.slot-first {
  border-top: none;
  background-color: #ffe6e6;
}

.half-hour-slot.slot-second {
  border-bottom: none;
  background-color: #e6ffe6;
}

.half-hour-slot.slot-left {
  border-right: none;
}

.half-hour-slot.slot-right {
  border-right: none;
}

.half-hour-slot:hover:not(.has-appointment) {
  background-color: rgba(107, 114, 128, 0.05);
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.empty-slot:hover {
  background-color: rgba(16, 185, 129, 0.05);
  border-color: var(--success);
  border-style: solid;
}

.empty-slot-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  opacity: 0.6;
}

.empty-slot-hint i {
  font-size: 1rem;
  color: var(--success);
}

.empty-slot:hover .empty-slot-hint {
  opacity: 1;
  color: var(--success);
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
  background: #ff69b4;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.appointment-confirmed:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(196, 69, 105, 0.4);
  opacity: 0.9;
}

.appointment-pending {
  background: #ff69b4;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  color: white;
}

.appointment-completed {
  background: #90ee90;
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
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
  .schedule-header {
    font-size: 0.75rem;
  }
  
  .time-column {
    width: 50px;
    padding: 6px 4px;
  }
  
  .time-column-header {
    width: 50px;
    padding: 6px 4px;
    font-size: 0.7rem;
  }
  
  .time-label {
    font-size: 0.8rem;
  }
  
  .half-hour-slot {
    padding: 6px;
    min-height: 25px;
  }
  
  .half-hour-slot-header,
  .half-hour-slot-header-left,
  .half-hour-slot-header-right {
    padding: 4px;
  }
  
  .schedule-row {
    min-height: 50px;
  }
  
  .appointment-block {
    padding: 4px;
  }
  
  .appointment-customer {
    font-size: 0.7rem;
    line-height: 1.2;
  }
  
  .appointment-service {
    font-size: 0.65rem;
    line-height: 1.1;
  }
  
  .empty-slot-hint {
    font-size: 0.65rem;
  }
  
  .empty-slot-hint i {
    font-size: 0.85rem;
  }
  
  .schedule-row-wrapper {
    border-bottom: 1px solid #e9ecef;
  }
  
  .schedule-row {
    min-height: 50px;
  }
}

@media (max-width: 576px) {
  .schedule-header {
    font-size: 0.7rem;
  }
  
  .time-column {
    width: 45px;
    padding: 4px 2px;
  }
  
  .time-column-header {
    width: 45px;
    padding: 4px 2px;
    font-size: 0.65rem;
  }
  
  .time-label {
    font-size: 0.75rem;
  }
  
  .half-hour-slot {
    padding: 4px;
    min-height: 25px;
  }
  
  .half-hour-slot-header,
  .half-hour-slot-header-left,
  .half-hour-slot-header-right {
    padding: 3px;
  }
  
  .schedule-row {
    min-height: 50px;
  }
  
  .appointment-block {
    padding: 3px;
  }
  
  .appointment-customer {
    font-size: 0.65rem;
    line-height: 1.1;
  }
  
  .appointment-service {
    font-size: 0.6rem;
    line-height: 1;
  }
  
  .appointment-time {
    font-size: 0.55rem;
  }
  
  .empty-slot {
    border-width: 1px;
  }
  
  .empty-slot-hint {
    font-size: 0.6rem;
  }
  
  .empty-slot-hint i {
    font-size: 0.75rem;
  }
  
  .empty-slot-hint span {
    display: none !important;
  }
  
  .schedule-row-wrapper {
    border-bottom: 1px solid #e9ecef;
  }
  
  .schedule-row {
    min-height: 50px;
  }
  
  /* iOS Safari optimization */
  .schedule-body {
    -webkit-overflow-scrolling: touch;
  }
  
  .half-hour-slot {
    -webkit-tap-highlight-color: rgba(16, 185, 129, 0.1);
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

.off-date-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 0.6rem;
  color: #dc3545;
}

.calendar-day.off-date::after {
  content: '🚫';
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 0.7rem;
}

/* Enhanced Off Date Toggle Switch */
.off-date-toggle-wrapper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* Date Detail Modal Header Responsive */
.date-detail-modal .modal-header {
  flex-wrap: wrap;
  gap: 12px;
}

.date-detail-modal .modal-header > div {
  min-width: 0;
}

@media (max-width: 768px) {
  .date-detail-modal-dialog {
    margin: 0.5rem !important;
    max-width: calc(100% - 1rem) !important;
  }

  .date-detail-modal .modal-header {
    padding: 0.75rem !important;
    flex-direction: column;
    align-items: flex-start !important;
  }

  .date-detail-modal .modal-header > div.d-flex {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 8px !important;
    width: 100%;
  }

  .date-detail-modal .modal-header .d-flex:last-child {
    flex-direction: row !important;
    justify-content: space-between;
    width: 100%;
    align-items: center !important;
  }

  .date-detail-modal .modal-header .col-auto {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .date-detail-modal .modal-title {
    font-size: 0.95rem !important;
  }

  .date-detail-modal .modal-title small {
    font-size: 0.7rem !important;
  }

  .off-date-toggle-label {
    padding: 6px 10px !important;
    gap: 8px !important;
    font-size: 0.75rem !important;
  }

  .toggle-slider {
    width: 48px !important;
    height: 24px !important;
  }

  .toggle-slider::before {
    height: 16px !important;
    width: 16px !important;
    bottom: 2px !important;
  }

  .toggle-label-text {
    font-size: 0.75rem !important;
  }

  .date-detail-modal .modal-body {
    padding: 0 !important;
    max-height: calc(100vh - 220px) !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
  }

  .week-navigation-container {
    padding: 6px !important;
    gap: 4px !important;
  }

  .week-navigation-container.no-arrows {
    padding: 8px 6px !important;
  }

  .week-nav-arrow {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
  }

  .week-nav-arrow i {
    font-size: 0.65rem !important;
  }

  .week-navigation-row {
    gap: 3px !important;
  }

  .week-navigation-row.swipeable {
    padding: 4px 2px !important;
  }

  .week-navigation-row .week-day-cell {
    min-width: 42px !important;
    max-width: none !important;
    flex: 0 0 auto !important;
    padding: 6px 4px !important;
    border-radius: 8px !important;
  }

  .week-day-name {
    font-size: 0.55rem !important;
  }

  .week-day-number {
    font-size: 0.9rem !important;
  }

  .calendar-week-cell {
    min-width: 36px !important;
    padding: 5px 4px !important;
  }

  .calendar-week-label {
    font-size: 0.5rem !important;
  }

  .calendar-week-number {
    font-size: 0.8rem !important;
  }

  .schedule-header {
    padding: 0.5rem 0.25rem !important;
    gap: 8px !important;
  }

  .time-column-header {
    font-size: 0.7rem !important;
    width: 50px !important;
  }

  .half-hour-slot-header {
    font-size: 0.65rem !important;
    padding: 4px !important;
  }

  .schedule-row {
    min-height: 50px !important;
  }

  .time-column {
    width: 50px !important;
    font-size: 0.75rem !important;
    padding: 0 4px !important;
  }

  .time-label {
    font-size: 0.7rem !important;
  }

  .half-hour-slot {
    min-height: 25px !important;
  }

  .appointment-block {
    font-size: 0.7rem !important;
    padding: 4px 6px !important;
  }

  .appointment-customer {
    font-size: 0.75rem !important;
    font-weight: 600;
  }

  .appointment-service {
    font-size: 0.65rem !important;
  }

  .appointment-time {
    font-size: 0.6rem !important;
  }
}

@media (max-width: 576px) {
  .date-detail-modal-dialog {
    margin: 0.25rem !important;
    max-width: calc(100% - 0.5rem) !important;
  }

  .date-detail-modal .modal-title {
    font-size: 0.85rem !important;
  }

  .date-detail-modal .modal-title i {
    font-size: 0.75rem !important;
  }

  .off-date-toggle-label {
    padding: 4px 8px !important;
    gap: 6px !important;
  }

  .toggle-label-text {
    display: none !important;
  }

  .toggle-slider {
    width: 40px !important;
    height: 20px !important;
  }

  .toggle-slider::before {
    height: 14px !important;
    width: 14px !important;
    left: 2px !important;
  }

  .week-navigation-container {
    padding: 4px !important;
    gap: 3px !important;
  }

  .week-nav-arrow {
    width: 24px !important;
    height: 24px !important;
    min-width: 24px !important;
    border-radius: 6px !important;
  }

  .week-nav-arrow i {
    font-size: 0.6rem !important;
  }

  .week-navigation-row .week-day-cell {
    min-width: 34px !important;
    max-width: 42px !important;
    padding: 4px 2px !important;
    border-radius: 6px !important;
  }

  .week-day-name {
    font-size: 0.5rem !important;
  }

  .week-day-number {
    font-size: 0.8rem !important;
  }

  .calendar-week-cell {
    min-width: 32px !important;
    padding: 4px 3px !important;
    border-radius: 6px !important;
  }

  .calendar-week-label {
    font-size: 0.45rem !important;
  }

  .calendar-week-number {
    font-size: 0.7rem !important;
  }

  .time-column {
    width: 42px !important;
  }

  .time-label {
    font-size: 0.65rem !important;
  }

  .appointment-customer {
    font-size: 0.7rem !important;
  }

  .appointment-service {
    font-size: 0.6rem !important;
  }

  .appointment-time {
    font-size: 0.55rem !important;
  }
}

.off-date-toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.off-date-toggle-label:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toggle-switch-container {
  position: relative;
  display: inline-block;
}

.off-date-toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 28px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 28px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 2px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-slider.active {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
}

.toggle-slider.active::before {
  transform: translateX(28px);
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.toggle-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  color: white;
  transition: all 0.3s ease;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.toggle-slider.active .toggle-icon {
  color: white;
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.toggle-label-text {
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.toggle-label-text .text-warning {
  color: #ffc107 !important;
  text-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
}

.toggle-label-text .text-white-50 {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* Responsive adjustments for toggle */
@media (max-width: 768px) {
  .off-date-toggle-label {
    padding: 6px 10px;
    gap: 8px;
  }
  
  .toggle-slider {
    width: 48px;
    height: 24px;
  }
  
  .toggle-slider::before {
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 2px;
  }
  
  .toggle-slider.active::before {
    transform: translateX(24px);
  }
  
  .toggle-icon {
    font-size: 0.6rem;
  }
  
  .toggle-label-text {
    font-size: 0.75rem;
  }
  
  .toggle-label-text span {
    display: inline-flex;
    align-items: center;
  }
  
  .toggle-label-text .me-1 {
    margin-right: 0.25rem !important;
  }
}

@media (max-width: 576px) {
  .off-date-toggle-wrapper {
    margin-right: 8px;
  }
  
  .off-date-toggle-label {
    padding: 4px 8px;
    gap: 6px;
  }
  
  .toggle-slider {
    width: 44px;
    height: 22px;
  }
  
  .toggle-slider::before {
    height: 14px;
    width: 14px;
  }
  
  .toggle-slider.active::before {
    transform: translateX(22px);
  }
}

/* ==============================================
   MOBILE OFF-DATE TOGGLE
   ============================================== */
.mobile-off-date-section {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
}

.off-date-toggle-mobile {
  text-align: center;
}

.off-date-toggle-label-mobile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  font-size: 0.8rem;
  color: var(--text-primary);
}

.off-date-toggle-label-mobile:active {
  transform: scale(0.98);
}

.toggle-slider-mobile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--success);
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.toggle-slider-mobile.active {
  background: var(--warning);
  color: white;
}

.toggle-text-mobile {
  font-weight: 500;
  font-size: 0.75rem;
}

@media (max-width: 576px) {
  .mobile-off-date-section {
    padding: 0.35rem;
  }
  
  .off-date-toggle-label-mobile {
    padding: 0.35rem 0.5rem;
    font-size: 0.75rem;
    gap: 0.35rem;
  }
  
  .toggle-slider-mobile {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }
  
  .toggle-text-mobile {
    font-size: 0.7rem;
  }
}

/* ==============================================
   COMPREHENSIVE MOBILE MODAL OPTIMIZATION
   iPhone Safari & All Mobile Devices
   ============================================== */

/* All modals - Mobile optimized */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem !important;
    max-width: calc(100% - 1rem) !important;
  }
  
  .modal-dialog.modal-lg,
  .modal-dialog.modal-xl {
    max-width: calc(100% - 1rem) !important;
  }
  
  .modal-content {
    border-radius: 12px !important;
    max-height: calc(100vh - 1rem) !important;
    overflow: hidden;
  }
  
  .modal-header {
    padding: 0.75rem 1rem !important;
    min-height: auto !important;
  }
  
  .modal-header .modal-title {
    font-size: 0.95rem !important;
    line-height: 1.3;
  }
  
  .modal-header .modal-title i {
    font-size: 0.9rem !important;
    margin-right: 0.5rem !important;
  }
  
  .modal-body {
    padding: 0.75rem !important;
    max-height: calc(100vh - 10rem) !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
  }
  
  .modal-footer {
    padding: 0.5rem 0.75rem !important;
    gap: 0.5rem !important;
  }
  
  .modal-footer .btn {
    padding: 0.4rem 0.75rem !important;
    font-size: 0.8rem !important;
  }
  
  /* Modal form elements */
  .modal-body .form-label {
    font-size: 0.8rem !important;
    margin-bottom: 0.25rem !important;
    font-weight: 600;
  }
  
  .modal-body .form-control,
  .modal-body .form-select {
    padding: 0.5rem 0.75rem !important;
    font-size: 0.85rem !important;
    min-height: 38px !important;
  }
  
  .modal-body textarea.form-control {
    min-height: 60px !important;
  }
  
  .modal-body .row.g-3 {
    --bs-gutter-y: 0.5rem !important;
    --bs-gutter-x: 0.5rem !important;
  }
  
  .modal-body p {
    font-size: 0.85rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  .modal-body p strong {
    font-size: 0.8rem !important;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.25rem !important;
    max-width: calc(100% - 0.5rem) !important;
  }
  
  .modal-content {
    border-radius: 10px !important;
  }
  
  .modal-header {
    padding: 0.5rem 0.75rem !important;
  }
  
  .modal-header .modal-title {
    font-size: 0.85rem !important;
  }
  
  .modal-header .modal-title i {
    font-size: 0.8rem !important;
    margin-right: 0.35rem !important;
  }
  
  .modal-header .btn-close {
    padding: 0.25rem !important;
    font-size: 0.7rem !important;
  }
  
  .modal-body {
    padding: 0.5rem !important;
    max-height: calc(100vh - 8rem) !important;
  }
  
  .modal-body .form-label {
    font-size: 0.75rem !important;
    margin-bottom: 0.2rem !important;
  }
  
  .modal-body .form-control,
  .modal-body .form-select {
    padding: 0.4rem 0.5rem !important;
    font-size: 0.8rem !important;
    min-height: 34px !important;
  }
  
  .modal-body textarea.form-control {
    min-height: 50px !important;
  }
  
  .modal-body .row.g-3 {
    --bs-gutter-y: 0.35rem !important;
    --bs-gutter-x: 0.35rem !important;
  }
  
  .modal-footer {
    padding: 0.35rem 0.5rem !important;
  }
  
  .modal-footer .btn {
    padding: 0.35rem 0.5rem !important;
    font-size: 0.75rem !important;
  }
}

/* Booking Modal - Base Styles */
.booking-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  overflow: hidden;
}

.booking-modal-dialog {
  max-width: 100%;
  margin: 0.5rem;
  overflow: hidden;
}

.booking-modal-dialog.modal-lg {
  max-width: 800px;
}

.booking-modal-content {
  max-width: 100%;
  overflow: hidden;
}

.booking-modal-body {
  overflow-x: hidden;
  overflow-y: auto;
  max-width: 100%;
  padding: 1rem;
}

/* Service Selector Wrapper - Prevent overflow */
.service-selector-wrapper {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-bottom: 0.5rem !important;
}

.service-select-container {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  position: relative !important;
}

/* Booking Service Selector - Base Styles */
.booking-service-select,
select.booking-service-select {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  position: relative !important;
  display: block !important;
  font-size: 0.875rem !important;
  padding: 0.5rem 2rem 0.5rem 0.75rem !important;
  min-height: 38px !important;
  line-height: 1.4 !important;
}

.booking-service-select option {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  padding: 0.4rem 0.5rem;
  font-size: 0.875rem;
}

/* Prevent select dropdown from overflowing - Base */
select.booking-service-select {
  -webkit-appearance: none !important;
  appearance: none !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: right 0.5rem center !important;
  background-size: 0.75rem !important;
  padding-right: 2rem !important;
}

/* Booking Modal Desktop Optimization */
@media (min-width: 992px) {
  /* Booking Modal - Compact on desktop */
  .booking-modal-dialog.modal-lg {
    max-width: 650px !important;
    margin: 1.75rem auto !important;
  }
  
  .booking-modal-content {
    max-width: 100% !important;
  }
  
  .booking-modal-body {
    padding: 0.75rem 1rem !important;
    max-height: calc(100vh - 10rem) !important;
  }
  
  .booking-modal-body .row {
    margin-left: -0.5rem !important;
    margin-right: -0.5rem !important;
  }
  
  .booking-modal-body .col-12,
  .booking-modal-body .col-md-6 {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
  
  /* Service Selector Wrapper - Desktop */
  .service-selector-wrapper {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
  
  .service-select-container {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  /* Service Selector - Compact size on desktop */
  .service-selector-wrapper {
    margin-bottom: 0.75rem !important;
  }
  
  .service-selector-wrapper .form-label {
    font-size: 0.8rem !important;
    margin-bottom: 0.4rem !important;
  }
  
  .booking-service-select,
  select.booking-service-select {
    font-size: 0.85rem !important;
    padding: 0.45rem 1.8rem 0.45rem 0.7rem !important;
    min-height: 38px !important;
    max-width: 100% !important;
    width: 100% !important;
    line-height: 1.4 !important;
  }
  
  .booking-service-select option {
    font-size: 0.8rem !important;
    padding: 0.4rem 0.6rem !important;
    line-height: 1.4 !important;
  }
  
  /* Form labels - Normal size */
  .booking-modal-body .form-label {
    font-size: 0.875rem !important;
    margin-bottom: 0.4rem !important;
  }
  
  .booking-modal-body .form-label.fw-semibold {
    font-size: 0.9rem !important;
  }
  
  /* Form inputs - Normal size */
  .booking-modal-body .form-control {
    font-size: 0.875rem !important;
    padding: 0.5rem 0.75rem !important;
    min-height: 40px !important;
  }
  
  /* Calendar - Normal size */
  .professional-date-picker {
    padding: 0.75rem !important;
  }
  
  .date-picker-header-pro {
    padding: 0.75rem !important;
  }
  
  .month-name {
    font-size: 1rem !important;
  }
  
  .day-cell-pro {
    min-height: 40px !important;
  }
  
  .day-number-pro {
    font-size: 0.875rem !important;
  }
  
  /* Time slots - Normal size */
  .time-slots-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)) !important;
    gap: 0.5rem !important;
  }
  
  .time-slots-grid .btn {
    font-size: 0.8rem !important;
    padding: 0.5rem 0.75rem !important;
  }
  
  /* Customer search - Normal size */
  .customer-search-container {
    max-height: 200px !important;
  }
  
  .customer-item {
    padding: 0.5rem 0.75rem !important;
  }
  
  .customer-name {
    font-size: 0.875rem !important;
  }
  
  .customer-details {
    font-size: 0.8rem !important;
  }
}

/* Booking Modal Tablet Optimization */
@media (min-width: 769px) and (max-width: 991px) {
  .booking-modal-dialog.modal-lg {
    max-width: 600px !important;
    margin: 1rem auto !important;
  }
  
  .booking-modal-body {
    padding: 0.75rem 1rem !important;
    max-height: calc(100vh - 10rem) !important;
  }
}

/* Booking Modal Mobile Optimization */
@media (max-width: 768px) {
  /* Booking Modal - Smaller on tablet */
  .modal-dialog.modal-lg {
    max-width: calc(100% - 1rem) !important;
    margin: 0.5rem !important;
  }
  
  /* Service Selector - Compact on tablet */
  .service-selector-wrapper {
    margin-bottom: 0.5rem !important;
  }
  
  .service-selector-wrapper .form-label {
    font-size: 0.75rem !important;
    margin-bottom: 0.35rem !important;
  }
  
  .modal-body .booking-service-select,
  .modal-body .form-select-lg,
  .modal-body select.form-select-lg,
  .modal-body select.booking-service-select {
    font-size: 0.8rem !important;
    padding: 0.4rem 1.6rem 0.4rem 0.55rem !important;
    min-height: 36px !important;
    max-width: 100% !important;
    width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.35;
    white-space: nowrap;
  }
  
  /* Service selector options - optimized font */
  .modal-body .booking-service-select option,
  .modal-body .form-select-lg option {
    font-size: 0.75rem !important;
    padding: 0.35rem 0.5rem !important;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4 !important;
  }
  
  /* Form labels - smaller */
  .modal-body .form-label {
    font-size: 0.75rem !important;
    margin-bottom: 0.3rem !important;
  }
  
  .modal-body .form-label.fw-semibold {
    font-size: 0.8rem !important;
  }
  
  .modal-body .form-label i {
    font-size: 0.75rem !important;
    margin-right: 0.4rem !important;
  }
  
  /* Professional Date Picker */
  .professional-date-picker {
    border-radius: 10px !important;
    max-width: 100%;
    overflow: hidden;
  }
  
  .date-picker-header-pro {
    padding: 0.75rem !important;
  }
  
  .month-name {
    font-size: 0.9rem !important;
  }
  
  .year-badge {
    font-size: 0.65rem !important;
    padding: 0.15rem 0.4rem !important;
  }
  
  .calendar-container-pro {
    padding: 0.5rem !important;
    overflow-x: hidden;
  }
  
  .calendar-grid-pro {
    gap: 4px !important;
    max-width: 100%;
  }
  
  .weekday-cell-pro {
    font-size: 0.65rem !important;
    padding: 4px 0 !important;
  }
  
  .day-cell-pro {
    min-height: 36px !important;
    border-radius: 6px !important;
    aspect-ratio: 1 !important;
  }
  
  .day-number-pro {
    font-size: 0.75rem !important;
  }
  
  .selected-date-pro {
    padding: 0.5rem !important;
    flex-direction: row !important;
    justify-content: center;
    gap: 0.5rem !important;
  }
  
  .date-icon-pro {
    width: 32px !important;
    height: 32px !important;
    font-size: 0.9rem !important;
    border-radius: 8px !important;
  }
  
  .selected-date-label {
    font-size: 0.65rem !important;
  }
  
  .selected-date-value {
    font-size: 0.85rem !important;
  }
  
  /* Time Slots Grid */
  .time-slots-grid {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)) !important;
    gap: 0.4rem !important;
    max-height: 150px !important;
    padding: 0.25rem !important;
  }
  
  .time-slots-grid .btn {
    font-size: 0.7rem !important;
    padding: 0.4rem 0.5rem !important;
    min-width: 60px !important;
  }
  
  /* Selected Time Preview */
  .selected-time-preview {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 6px;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  
  .selected-time-preview .badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
  }
  
  .selected-time-preview small {
    font-size: 0.7rem;
  }
}

@media (max-width: 576px) {
  /* Booking Modal - Much smaller on mobile */
  .modal-dialog.modal-lg {
    max-width: calc(100% - 0.5rem) !important;
    margin: 0.25rem !important;
  }
  
  .modal-content {
    border-radius: 10px !important;
    max-width: 100%;
    overflow: hidden;
  }
  
  .modal-header {
    padding: 0.5rem 0.6rem !important;
  }
  
  .modal-header .modal-title {
    font-size: 0.8rem !important;
  }
  
  .modal-header .modal-title i {
    font-size: 0.75rem !important;
    margin-right: 0.35rem !important;
  }
  
  .modal-body {
    padding: 0.4rem !important;
    max-height: calc(100vh - 7rem) !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .modal-body .row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  
  .modal-body .col-12 {
    padding-left: 0 !important;
    padding-right: 0 !important;
    max-width: 100% !important;
    overflow: hidden !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  
  /* Service Selector Wrapper - Mobile */
  .service-selector-wrapper {
    padding-left: 0 !important;
    padding-right: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    overflow: hidden !important;
  }
  
  .service-select-container {
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  /* Service Selector Container - Prevent overflow */
  .modal-body .col-12:has(.booking-service-select),
  .modal-body .col-12:has(select.booking-service-select),
  .modal-body .service-selector-wrapper {
    padding-left: 0 !important;
    padding-right: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    overflow: hidden !important;
  }
  
  /* Service Selector - Compact on mobile */
  .service-selector-wrapper {
    margin-bottom: 0.4rem !important;
  }
  
  .service-selector-wrapper .form-label {
    font-size: 0.7rem !important;
    margin-bottom: 0.3rem !important;
  }
  
  .service-selector-wrapper .form-label i {
    font-size: 0.65rem !important;
    margin-right: 0.3rem !important;
  }
  
  .booking-modal-body .booking-service-select,
  .booking-modal-body select.booking-service-select,
  .modal-body .booking-service-select,
  .modal-body .form-select-lg,
  .modal-body select.form-select-lg,
  .modal-body select.booking-service-select,
  .modal-body .col-12 select.booking-service-select,
  .modal-body .col-12 .booking-service-select,
  .service-selector-wrapper select.booking-service-select {
    font-size: 0.75rem !important;
    padding: 0.4rem 1.6rem 0.4rem 0.5rem !important;
    min-height: 36px !important;
    max-width: 100% !important;
    width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    line-height: 1.3 !important;
    white-space: nowrap !important;
    -webkit-appearance: none !important;
    appearance: none !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 0.5rem center !important;
    background-size: 0.7rem !important;
    border-radius: 0.375rem !important;
    touch-action: manipulation !important;
  }
  
  /* Service selector options - optimized font */
  .modal-body .booking-service-select option,
  .modal-body .form-select-lg option,
  .service-selector-wrapper select.booking-service-select option {
    font-size: 0.7rem !important;
    padding: 0.35rem 0.5rem !important;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.4 !important;
  }
  
  /* Form labels - smaller */
  .modal-body .form-label {
    font-size: 0.65rem !important;
    margin-bottom: 0.2rem !important;
  }
  
  .modal-body .form-label.fw-semibold {
    font-size: 0.7rem !important;
  }
  
  .modal-body .form-label i {
    font-size: 0.65rem !important;
    margin-right: 0.3rem !important;
  }
  
  /* Ensure form elements don't overflow */
  .modal-body form,
  .modal-body .row,
  .modal-body .col-12,
  .modal-body .col-md-6 {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  
  .modal-body select,
  .modal-body input,
  .modal-body textarea {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  
  /* Customer search section - smaller */
  .modal-body .customer-search-container {
    max-height: 120px !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
  }
  
  .modal-body .input-group {
    flex-wrap: nowrap !important;
  }
  
  .modal-body .input-group-text {
    padding: 0.3rem 0.4rem !important;
    font-size: 0.65rem !important;
    min-width: 32px !important;
  }
  
  .modal-body .form-control {
    font-size: 0.7rem !important;
    padding: 0.3rem 0.4rem !important;
    min-height: 34px !important;
  }
  
  .modal-body .customer-search-container {
    position: relative !important;
    z-index: 1070 !important;
  }
  
  .modal-body .customer-dropdown {
    max-height: 200px !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    z-index: 1070 !important;
    position: absolute !important;
    transform: translateZ(0) !important;
    -webkit-transform: translateZ(0) !important;
    will-change: transform !important;
  }
  
  .modal-body .customer-item {
    padding: 0.5rem 0.6rem !important;
    min-height: 44px !important;
    position: relative !important;
    z-index: 10 !important;
    touch-action: manipulation !important;
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.2) !important;
  }
  
  .modal-body .customer-name {
    font-size: 0.7rem !important;
  }
  
  .modal-body .customer-name strong {
    font-size: 0.7rem !important;
  }
  
  .modal-body .customer-details {
    font-size: 0.6rem !important;
  }
  
  .modal-body .customer-details span {
    font-size: 0.6rem !important;
  }
  
  .modal-body .customer-details i {
    font-size: 0.55rem !important;
  }
  
  .modal-body .badge {
    font-size: 0.6rem !important;
    padding: 0.2rem 0.35rem !important;
  }
  
  /* Form inputs */
  .modal-body input.form-control,
  .modal-body input[type="text"],
  .modal-body input[type="tel"],
  .modal-body input[type="email"],
  .modal-body input[type="search"] {
    font-size: 0.7rem !important;
    padding: 0.3rem 0.4rem !important;
    min-height: 34px !important;
  }
  
  /* Alert boxes */
  .modal-body .alert {
    padding: 0.4rem 0.5rem !important;
    font-size: 0.7rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  .modal-body .alert strong {
    font-size: 0.7rem !important;
  }
  
  /* Form label small text */
  .modal-body .form-label small {
    font-size: 0.6rem !important;
  }
  
  /* Modal footer buttons */
  .modal-footer {
    padding: 0.4rem 0.5rem !important;
    flex-wrap: wrap;
    gap: 0.3rem;
  }
  
  .modal-footer {
    position: relative !important;
    z-index: 10 !important;
    background: var(--bg-primary) !important;
    border-top: 1px solid var(--border-color) !important;
  }
  
  .modal-footer .btn {
    font-size: 0.7rem !important;
    padding: 0.3rem 0.5rem !important;
    min-height: 44px !important;
    flex: 1 1 auto;
    min-width: calc(50% - 0.15rem);
    position: relative !important;
    z-index: 10 !important;
    -webkit-appearance: none !important;
    appearance: none !important;
    touch-action: manipulation !important;
  }
  
  /* Professional Date Picker */
  .professional-date-picker {
    border-radius: 8px !important;
    max-width: 100%;
    overflow: hidden;
  }
  
  .date-picker-header-pro {
    padding: 0.5rem 0.6rem !important;
  }
  
  .date-picker-header-pro button {
    width: 26px !important;
    height: 26px !important;
    font-size: 0.65rem !important;
  }
  
  .month-name {
    font-size: 0.8rem !important;
  }
  
  .year-badge {
    font-size: 0.55rem !important;
    padding: 0.1rem 0.25rem !important;
  }
  
  .calendar-container-pro {
    padding: 0.25rem !important;
    overflow-x: hidden;
  }
  
  .calendar-grid-pro {
    gap: 3px !important;
    max-width: 100%;
  }
  
  .weekday-cell-pro {
    font-size: 0.55rem !important;
    padding: 2px 0 !important;
  }
  
  .day-cell-pro {
    min-height: 36px !important;
    border-radius: 6px !important;
    margin: 0 !important;
    aspect-ratio: 1 !important;
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.1);
  }

  .day-number-pro {
    font-size: 0.85rem !important;
  }

  .booking-modal-dialog {
    margin: 0.5rem !important;
    max-width: calc(100% - 1rem) !important;
  }

  .booking-modal-body {
    max-height: calc(100vh - 180px) !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
  }
  
  .selected-date-pro {
    padding: 0.35rem !important;
    flex-direction: row !important;
    justify-content: center;
    gap: 0.4rem !important;
  }
  
  .date-icon-pro {
    width: 26px !important;
    height: 26px !important;
    font-size: 0.75rem !important;
    border-radius: 5px !important;
  }
  
  .selected-date-info {
    text-align: left !important;
  }
  
  .selected-date-label {
    font-size: 0.55rem !important;
  }
  
  .selected-date-value {
    font-size: 0.7rem !important;
  }
  
  /* Time Slots Grid - Smaller on mobile */
  .time-slots-grid {
    grid-template-columns: repeat(auto-fit, minmax(55px, 1fr)) !important;
    gap: 0.3rem !important;
    max-height: 120px !important;
    padding: 0.2rem !important;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .time-slots-grid .btn {
    font-size: 0.65rem !important;
    padding: 0.3rem 0.4rem !important;
    min-width: 55px !important;
  }

  /* Mobile Optimized Time Slots */
  .time-slots-grid.mobile-optimized {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)) !important;
    gap: 8px !important;
    max-height: 180px !important;
  }

  .time-slots-grid.mobile-optimized .btn.time-slot-btn {
    min-height: 42px !important;
    font-size: 0.8rem !important;
    padding: 0.4rem 0.5rem !important;
  }

  /* Week Date Picker Mobile */
  .week-date-picker {
    padding: 0.75rem !important;
    border-radius: 10px !important;
  }

  .week-nav-header {
    margin-bottom: 0.75rem !important;
    gap: 0.5rem !important;
  }

  .week-nav-btn {
    width: 36px !important;
    height: 36px !important;
    font-size: 0.75rem !important;
  }

  .week-label {
    font-size: 0.85rem !important;
  }

  .week-days-grid {
    gap: 6px !important;
  }

  .week-day-cell {
    min-height: 60px !important;
    padding: 8px 4px !important;
    border-radius: 8px !important;
  }

  .week-day-cell .day-name {
    font-size: 0.65rem !important;
    margin-bottom: 2px !important;
  }

  .week-day-cell .day-number {
    font-size: 1.1rem !important;
  }

  .week-day-cell .month-label {
    font-size: 0.6rem !important;
    margin-top: 2px !important;
  }

  /* Edit Modal Body */
  .edit-modal-body {
    max-height: calc(100vh - 200px) !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Edit Appointment Modal - Desktop */
  .edit-appointment-modal-content {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 2rem);
    overflow: hidden;
  }
  
  .edit-appointment-modal-header {
    flex-shrink: 0;
    position: relative;
    z-index: 1052;
  }
  
  .edit-appointment-modal .modal-footer {
    position: sticky;
    bottom: 0;
    z-index: 1052;
    flex-shrink: 0;
    background: var(--bg-primary);
  }
  
  .time-slots-grid.mobile-optimized {
    max-height: 200px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .current-appointment-info {
    background: var(--bg-secondary);
    padding: 0.75rem !important;
    border-radius: 8px;
    margin-bottom: 0.75rem !important;
  }

  .current-appointment-info p {
    font-size: 0.8rem !important;
    margin-bottom: 0.4rem !important;
  }
  
  /* Selected Time Preview - Mobile */
  .selected-time-preview {
    padding: 0.4rem !important;
    flex-wrap: wrap;
    gap: 0.3rem;
  }
  
  .selected-time-preview .badge {
    font-size: 0.7rem !important;
    padding: 0.25rem 0.5rem !important;
  }
  
  .selected-time-preview small {
    font-size: 0.65rem !important;
  }
  
  /* Prevent calendar overflow */
  .professional-date-picker {
    width: 100%;
    box-sizing: border-box;
  }
  
  .calendar-container-pro {
    width: 100%;
    box-sizing: border-box;
  }
  
  /* Modal body overflow fix */
  .modal-body {
    overflow-x: hidden;
    max-width: 100%;
  }
}

/* Edit Appointment Modal Mobile */
@media (max-width: 768px) {
  .edit-appointment-modal-dialog {
    margin: 0.5rem !important;
    max-width: calc(100% - 1rem) !important;
  }
  
  .edit-appointment-modal-content {
    max-height: calc(100vh - 1rem) !important;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  
  .edit-appointment-modal-header {
    padding: 0.75rem !important;
    flex-shrink: 0;
    position: relative;
    z-index: 1052;
  }
  
  .edit-appointment-modal-header .modal-title {
    font-size: 0.95rem !important;
  }
  
  .edit-modal-body {
    padding: 0.75rem !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
    flex: 1;
    min-height: 0;
    position: relative;
    z-index: 1;
  }
  
  .edit-appointment-modal .modal-footer {
    position: sticky !important;
    bottom: 0 !important;
    z-index: 1052 !important;
    flex-shrink: 0 !important;
    background: var(--bg-primary) !important;
  }
  
  .time-slots-grid.mobile-optimized {
    max-height: 200px !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
  }
  
  .current-appointment-info {
    padding: 0.5rem !important;
    margin-bottom: 0.75rem !important;
  }
  
  .current-appointment-info p {
    font-size: 0.75rem !important;
    margin-bottom: 0.3rem !important;
  }
  
  .week-date-picker {
    padding: 0.5rem !important;
  }
  
  .week-nav-header {
    margin-bottom: 0.5rem !important;
    gap: 0.5rem !important;
  }
  
  .week-nav-btn {
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    min-height: 32px !important;
  }
  
  .week-label {
    font-size: 0.85rem !important;
  }
  
  .week-days-grid {
    gap: 4px !important;
  }
  
  .week-date-picker .week-day-cell {
    padding: 6px 4px !important;
    min-height: 50px !important;
    border-radius: 8px !important;
  }
  
  .week-date-picker .week-day-cell .day-name {
    font-size: 0.65rem !important;
    margin-bottom: 2px !important;
  }
  
  .week-date-picker .week-day-cell .day-number {
    font-size: 1rem !important;
  }
  
  .week-date-picker .week-day-cell .month-label {
    font-size: 0.55rem !important;
    margin-top: 2px !important;
  }
  
  .time-slots-grid.mobile-optimized {
    max-height: 150px !important;
    gap: 6px !important;
  }
  
  .time-slots-grid.mobile-optimized .btn.time-slot-btn {
    font-size: 0.8rem !important;
    padding: 0.4rem 0.5rem !important;
    min-height: 40px !important;
  }
  
  .edit-modal-body .form-label {
    font-size: 0.85rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  .edit-modal-body textarea {
    font-size: 0.85rem !important;
    padding: 0.5rem !important;
    rows: 2 !important;
  }
  
  .edit-modal-body .form-control {
    font-size: 0.85rem !important;
  }
  
  .edit-appointment-modal .modal-footer {
    padding: 0.5rem 0.75rem !important;
    flex-shrink: 0;
    position: sticky !important;
    bottom: 0 !important;
    z-index: 1052 !important;
    background: var(--bg-primary) !important;
  }
  
  .edit-appointment-modal .modal-footer .btn {
    font-size: 0.85rem !important;
    padding: 0.5rem 1rem !important;
    position: relative;
    z-index: 1053;
  }
  
  .available-slots-container {
    max-height: 120px !important;
    overflow-y: auto !important;
  }
  
  .available-slots-container .btn {
    padding: 0.35rem 0.5rem !important;
    font-size: 0.75rem !important;
    min-width: 50px !important;
  }
}

@media (max-width: 576px) {
  .edit-appointment-modal-dialog {
    margin: 0.25rem !important;
    max-width: calc(100% - 0.5rem) !important;
  }
  
  .edit-appointment-modal-content {
    max-height: calc(100vh - 0.5rem) !important;
  }
  
  .edit-appointment-modal-header {
    padding: 0.5rem !important;
  }
  
  .edit-appointment-modal-header .modal-title {
    font-size: 0.85rem !important;
  }
  
  .edit-modal-body {
    padding: 0.5rem !important;
  }
  
  .current-appointment-info {
    padding: 0.4rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  .current-appointment-info p {
    font-size: 0.7rem !important;
    margin-bottom: 0.25rem !important;
  }
  
  .week-date-picker {
    padding: 0.4rem !important;
  }
  
  .week-nav-header {
    margin-bottom: 0.4rem !important;
    gap: 0.4rem !important;
  }
  
  .week-nav-btn {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    min-height: 28px !important;
  }
  
  .week-label {
    font-size: 0.75rem !important;
  }
  
  .week-days-grid {
    gap: 3px !important;
  }
  
  .week-date-picker .week-day-cell {
    padding: 4px 2px !important;
    min-height: 45px !important;
    border-radius: 6px !important;
  }
  
  .week-date-picker .week-day-cell .day-name {
    font-size: 0.6rem !important;
    margin-bottom: 1px !important;
  }
  
  .week-date-picker .week-day-cell .day-number {
    font-size: 0.9rem !important;
  }
  
  .week-date-picker .week-day-cell .month-label {
    font-size: 0.5rem !important;
    margin-top: 1px !important;
  }
  
  .time-slots-grid.mobile-optimized {
    max-height: 120px !important;
    gap: 4px !important;
  }
  
  .time-slots-grid.mobile-optimized .btn.time-slot-btn {
    font-size: 0.75rem !important;
    padding: 0.3rem 0.4rem !important;
    min-height: 36px !important;
  }
  
  .edit-modal-body .form-label {
    font-size: 0.8rem !important;
    margin-bottom: 0.4rem !important;
  }
  
  .edit-modal-body textarea {
    font-size: 0.8rem !important;
    padding: 0.4rem !important;
    rows: 2 !important;
  }
  
  .edit-appointment-modal .modal-footer {
    padding: 0.4rem 0.5rem !important;
  }
  
  .edit-appointment-modal .modal-footer .btn {
    font-size: 0.8rem !important;
    padding: 0.4rem 0.75rem !important;
  }
  
  .available-slots-container {
    max-height: 100px !important;
  }
  
  .available-slots-container .btn {
    padding: 0.25rem 0.4rem !important;
    font-size: 0.7rem !important;
    min-width: 45px !important;
  }
}

/* Date Detail Modal Mobile */
@media (max-width: 768px) {
  .date-detail-modal .modal-dialog {
    max-width: calc(100% - 0.5rem) !important;
    margin: 0.25rem !important;
  }
  
  .date-detail-modal .modal-body {
    max-height: calc(100vh - 8rem) !important;
    padding: 0.5rem !important;
  }
  
  .date-detail-modal .modal-header {
    padding: 0.5rem 0.75rem !important;
  }
  
  .date-detail-modal .modal-header .modal-title {
    font-size: 0.85rem !important;
  }
  
  .date-detail-modal .off-date-toggle-wrapper {
    width: 100%;
    margin-top: 0.5rem;
  }
  
  .date-detail-modal .off-date-toggle-label {
    width: 100%;
    justify-content: center;
  }
}

/* Calendar view off-date toggle - Mobile */
@media (max-width: 768px) {
  .mobile-calendar-controls .d-flex.justify-content-between.align-items-center.mt-3 {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.5rem !important;
  }
  
  .mobile-calendar-controls .off-date-toggle-wrapper {
    width: 100%;
    margin-top: 0.25rem;
  }
  
  .mobile-calendar-controls .off-date-toggle-label {
    width: 100%;
    justify-content: center;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
  }
}

@media (max-width: 576px) {
  .mobile-calendar-controls .off-date-toggle-label {
    padding: 0.4rem 0.6rem !important;
  }
  
  .toggle-label-text {
    font-size: 0.7rem !important;
  }
}

/* Customer Modal Mobile */
@media (max-width: 768px) {
  .customer-dropdown {
    max-height: 150px !important;
  }
  
  .customer-item {
    padding: 0.5rem !important;
  }
  
  .customer-name {
    font-size: 0.85rem !important;
  }
  
  .customer-details {
    font-size: 0.75rem !important;
  }
}

/* Response Modal Mobile */
@media (max-width: 576px) {
  .response-modal .modal-body textarea {
    min-height: 50px !important;
  }
}

/* Cancel Modal Mobile */
@media (max-width: 576px) {
  .cancel-modal .modal-body textarea {
    min-height: 50px !important;
  }
}

/* Admin Card Body Optimization */
@media (max-width: 768px) {
  .admin-content .card-body {
    padding: 0.75rem !important;
  }
  
  .admin-content h5.mb-3 {
    font-size: 0.95rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  .admin-content h6 {
    font-size: 0.85rem !important;
  }
  
  .admin-content .table th,
  .admin-content .table td {
    padding: 0.4rem 0.5rem !important;
    font-size: 0.8rem !important;
  }
}

@media (max-width: 576px) {
  .admin-content .card-body {
    padding: 0.5rem !important;
  }
  
  .admin-content h5.mb-3 {
    font-size: 0.85rem !important;
    margin-bottom: 0.35rem !important;
  }
  
  .admin-content h6 {
    font-size: 0.75rem !important;
  }
  
  .admin-content .table th,
  .admin-content .table td {
    padding: 0.3rem 0.35rem !important;
    font-size: 0.7rem !important;
  }
  
  .admin-content .badge {
    font-size: 0.6rem !important;
    padding: 0.2rem 0.35rem !important;
  }
}

/* iOS Safari specific fixes */
@supports (-webkit-touch-callout: none) {
  .modal-body {
    -webkit-overflow-scrolling: touch;
  }
  
  .modal-content {
    transform: translate3d(0, 0, 0);
    -webkit-transform: translate3d(0, 0, 0);
  }
  
  @media (max-width: 576px) {
    .modal-dialog {
      padding-bottom: env(safe-area-inset-bottom);
    }
    
    .form-control, .form-select {
      font-size: 16px !important; /* Prevents iOS zoom on input focus */
    }
  }
}

/* Time slot selection in modals */
@media (max-width: 576px) {
  .time-slot-grid,
  .d-flex.flex-wrap.gap-2 {
    gap: 0.25rem !important;
  }
  
  .time-slot-grid .btn,
  .d-flex.flex-wrap.gap-2 .btn-outline-primary {
    padding: 0.3rem 0.4rem !important;
    font-size: 0.7rem !important;
    min-width: 48px !important;
  }
}

/* ==============================================
   COMPREHENSIVE iOS SAFARI OPTIMIZATION
   ============================================== */
@supports (-webkit-touch-callout: none) {
  /* iOS Safari specific fixes */
  .admin-panel {
    -webkit-overflow-scrolling: touch;
  }
  
  .schedule-body,
  .appointments-list,
  .modal-body {
    -webkit-overflow-scrolling: touch;
  }
  
  .calendar-grid,
  .mobile-nav {
    -webkit-overflow-scrolling: touch;
  }
  
  /* Prevent iOS zoom on input focus */
  @media (max-width: 576px) {
    .form-control,
    .form-select,
    input[type="text"],
    input[type="email"],
    input[type="tel"],
    textarea {
      font-size: 16px !important;
    }
  }
  
  /* Touch-friendly tap highlights */
  .calendar-day,
  .half-hour-slot,
  .btn,
  .nav-link {
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.1);
  }
  
  /* Smooth scrolling */
  .admin-content,
  .card-body,
  .modal-body {
    -webkit-overflow-scrolling: touch;
    overflow-y: auto;
  }
  
  /* Fix for iOS Safari viewport units */
  @media (max-width: 576px) {
    .modal-content {
      max-height: -webkit-fill-available;
    }
  }
  
  /* Prevent text selection on touch */
  .calendar-day,
  .half-hour-slot,
  .nav-link {
    -webkit-user-select: none;
    user-select: none;
  }
  
  /* Week picker touch-friendly */
  .week-day-cell {
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.1);
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }

  .week-nav-btn {
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.1);
    -webkit-appearance: none;
  }

  /* Edit modal scrolling */
  .edit-modal-body {
    -webkit-overflow-scrolling: touch;
    overflow-y: auto;
  }

  .week-date-picker {
    -webkit-touch-callout: none;
  }

  /* Fix for iOS Safari button rendering */
  .btn {
    -webkit-appearance: none;
    appearance: none;
  }
  
  /* Fix for iOS Safari input rendering */
  input,
  select,
  textarea {
    -webkit-appearance: none;
    appearance: none;
    border-radius: var(--border-radius-sm);
  }

  /* All modals scrolling */
  .modal-dialog-scrollable .modal-body {
    -webkit-overflow-scrolling: touch;
  }

  /* Date detail modal schedule */
  .schedule-body {
    -webkit-overflow-scrolling: touch;
  }

  /* Professional date picker */
  .calendar-grid-pro {
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.1);
  }

  .day-cell-pro {
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.1);
    -webkit-user-select: none;
    user-select: none;
  }

  .month-nav-btn {
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.1);
    -webkit-appearance: none;
  }
}

/* ==============================================
   COMPREHENSIVE MOBILE MODAL OPTIMIZATIONS
   For all modals to work perfectly on mobile
   ============================================== */
@media (max-width: 768px) {
  /* All modals general improvements */
  .modal-dialog {
    margin: 0.5rem;
  }

  .modal-content {
    border-radius: 16px;
    max-height: calc(100vh - 1rem);
  }

  .modal-dialog-scrollable .modal-body {
    max-height: calc(100vh - 200px);
  }

  .modal-header {
    padding: 1rem;
    border-bottom: 2px solid var(--border-color);
  }

  .modal-title {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }

  .modal-footer .btn {
    flex: 1;
    min-height: 44px;
    font-size: 0.95rem;
    position: relative;
    z-index: 10;
    -webkit-appearance: none;
    appearance: none;
    touch-action: manipulation;
  }

  /* Form elements in modals */
  .modal-body .form-label {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .modal-body .form-control,
  .modal-body .form-select {
    min-height: 44px;
    font-size: 1rem;
    padding: 0.75rem;
    border-radius: 8px;
  }

  .modal-body textarea.form-control {
    min-height: 80px;
  }

  .modal-body .btn {
    min-height: 44px;
    padding: 0.625rem 1rem;
    font-size: 0.95rem;
    border-radius: 8px;
  }

  .modal-body .btn-sm {
    min-height: 36px;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  /* Response and Cancel modals */
  .modal-body .alert {
    padding: 1rem;
    border-radius: 10px;
    font-size: 0.95rem;
  }

  /* Customer and Service forms */
  .modal-body .row {
    margin: 0 -0.5rem;
  }

  .modal-body .row > [class*="col-"] {
    padding: 0 0.5rem;
  }

  /* Improve touch targets for all interactive elements */
  .modal-body input[type="checkbox"],
  .modal-body input[type="radio"] {
    min-width: 20px;
    min-height: 20px;
  }

  /* Customer dropdown in booking modal */
  .customer-dropdown {
    max-height: 300px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .customer-item {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin: 0.25rem;
  }

  .customer-item:active {
    background: var(--primary-color-light);
  }

  /* Service selection */
  .service-select-container .form-select {
    background-size: 18px;
    padding-right: 2rem;
    font-size: 0.8rem !important;
    min-height: 36px !important;
  }
  
  .service-select-container .form-select option {
    font-size: 0.75rem !important;
    padding: 0.4rem 0.5rem !important;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.25rem;
  }

  .modal-content {
    border-radius: 12px;
  }

  .modal-header {
    padding: 0.75rem;
  }

  .modal-title {
    font-size: 1rem;
  }

  .modal-title i {
    font-size: 0.9rem;
  }

  .modal-body {
    padding: 0.75rem;
  }

  .modal-footer {
    padding: 0.5rem 0.75rem;
    position: relative;
    z-index: 10;
    background: var(--bg-primary);
    border-top: 1px solid var(--border-color);
  }

  .modal-footer .btn {
    font-size: 0.9rem;
    position: relative;
    z-index: 10;
    -webkit-appearance: none;
    appearance: none;
    touch-action: manipulation;
    min-height: 44px;
  }

  .modal-body .form-label {
    font-size: 0.85rem;
  }

  .modal-body small,
  .modal-body .text-muted {
    font-size: 0.75rem;
  }
}

/* iOS Safari specific modal fixes */
@supports (-webkit-touch-callout: none) {
  @media (max-width: 768px) {
    .modal-content {
      max-height: -webkit-fill-available;
    }

    .modal-dialog-scrollable .modal-body {
      max-height: calc(100vh - 200px);
      max-height: -webkit-fill-available;
    }

    /* Prevent zoom on input focus */
    .modal-body input,
    .modal-body select,
    .modal-body textarea {
      font-size: 16px !important;
    }

    /* Smooth momentum scrolling */
    .modal-body,
    .customer-dropdown,
    .time-slots-grid,
    .schedule-body {
      -webkit-overflow-scrolling: touch;
    }
    
    /* Customer dropdown iOS Safari fixes */
    .customer-search-container {
      position: relative !important;
      z-index: 1070 !important;
      isolation: isolate !important;
    }
    
    .customer-dropdown {
      z-index: 1070 !important;
      position: absolute !important;
      transform: translateZ(0) !important;
      -webkit-transform: translateZ(0) !important;
      will-change: transform !important;
      -webkit-overflow-scrolling: touch !important;
      pointer-events: auto !important;
      -webkit-touch-callout: none !important;
    }
    
    .customer-item {
      min-height: 44px !important;
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: rgba(107, 114, 128, 0.2) !important;
      position: relative !important;
      z-index: 10 !important;
      -webkit-user-select: none !important;
      user-select: none !important;
      pointer-events: auto !important;
      cursor: pointer !important;
    }
    
    /* Ensure modal doesn't block dropdown */
    .booking-modal-body {
      overflow: visible !important;
      position: relative !important;
    }
    
    .booking-modal-body .customer-search-container {
      overflow: visible !important;
      position: relative !important;
    }
    
    /* Force dropdown to be above modal content */
    .booking-modal-content {
      overflow: visible !important;
    }
    
    .booking-modal-body .row {
      overflow: visible !important;
    }
    
    .booking-modal-body .col-12 {
      overflow: visible !important;
    }

    /* Fix button tap delay */
    .modal-body .btn,
    .modal-footer .btn,
    .day-cell-pro,
    .week-day-cell,
    .time-slot-btn {
      touch-action: manipulation;
    }
    
    /* Service selector iOS Safari optimization */
    .service-selector-wrapper {
      margin-bottom: 0.5rem !important;
    }
    
    .service-selector-wrapper .form-label {
      font-size: 0.7rem !important;
      margin-bottom: 0.3rem !important;
    }
    
    .booking-service-select,
    select.booking-service-select {
      font-size: 16px !important; /* Prevent zoom on iOS */
      padding: 0.4rem 1.6rem 0.4rem 0.5rem !important;
      min-height: 36px !important;
      touch-action: manipulation !important;
      -webkit-appearance: none !important;
      appearance: none !important;
    }
    
    .booking-service-select option {
      font-size: 0.75rem !important;
      padding: 0.35rem 0.5rem !important;
    }

    /* Booking modal specific iOS Safari fixes */
    .booking-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      height: 100%;
      height: -webkit-fill-available;
    }

    .booking-modal-dialog {
      max-height: calc(100% - 1rem);
      max-height: calc(-webkit-fill-available - 1rem);
      margin: 0.5rem;
    }

    .booking-modal-content {
      max-height: calc(100vh - 1rem);
      max-height: calc(-webkit-fill-available - 1rem);
      display: flex;
      flex-direction: column;
    }

    .booking-modal-body {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      max-height: calc(100vh - 150px);
      max-height: calc(-webkit-fill-available - 150px);
    }

    /* Week picker iOS fixes */
    .mobile-week-picker {
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }

    .week-strip-container {
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }

    .week-day-cell {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }

    .week-nav-btn {
      -webkit-tap-highlight-color: transparent;
      min-width: 44px;
      min-height: 44px;
    }
  }
}

/* ==========================================
   COMPREHENSIVE MOBILE OPTIMIZATION
   ========================================== */

/* Extra Small Screens (320px - 380px) */
@media (max-width: 380px) {
  /* Container and Content */
  .admin-content {
    padding: 0.25rem !important;
  }

  .container-fluid {
    padding-left: 0.375rem !important;
    padding-right: 0.375rem !important;
  }

  /* Cards */
  .card {
    border-radius: 10px !important;
  }

  .card-header {
    padding: 0.5rem 0.75rem !important;
  }

  .card-header h5 {
    font-size: 0.9rem !important;
  }

  .card-header small {
    font-size: 0.7rem !important;
  }

  .card-body {
    padding: 0.5rem !important;
  }

  /* Buttons - Ensure minimum touch targets */
  .btn {
    min-height: 40px;
    padding: 0.4rem 0.6rem !important;
    font-size: 0.75rem !important;
  }

  .btn-sm {
    min-height: 36px;
    padding: 0.3rem 0.5rem !important;
    font-size: 0.7rem !important;
  }

  .btn i {
    font-size: 0.75rem !important;
  }

  /* Form Controls */
  .form-control,
  .form-select {
    padding: 0.5rem 0.75rem !important;
    font-size: 16px !important; /* Prevents iOS zoom */
    border-radius: 8px !important;
  }

  .form-label {
    font-size: 0.75rem !important;
    margin-bottom: 0.25rem !important;
  }

  /* Input Groups */
  .input-group {
    flex-wrap: nowrap !important;
  }

  .input-group-text {
    padding: 0.4rem 0.6rem !important;
    font-size: 0.75rem !important;
  }

  /* Tables */
  .table {
    font-size: 0.7rem !important;
  }

  .table th,
  .table td {
    padding: 0.4rem 0.3rem !important;
  }

  /* Badges */
  .badge {
    padding: 0.2rem 0.4rem !important;
    font-size: 0.6rem !important;
  }

  /* Alerts */
  .alert {
    padding: 0.5rem 0.75rem !important;
    font-size: 0.75rem !important;
    border-radius: 8px !important;
  }

  /* Service Cards */
  .service-card {
    margin-bottom: 0.5rem !important;
  }

  .service-card .card-body {
    padding: 0.75rem !important;
  }

  .service-card h6 {
    font-size: 0.85rem !important;
  }

  .service-actions .btn {
    font-size: 0.65rem !important;
    padding: 0.3rem 0.4rem !important;
  }

  /* Timeslots */
  .day-schedule-card {
    border-radius: 10px !important;
    margin-bottom: 0.75rem !important;
  }

  .day-header {
    padding: 0.6rem 0.75rem !important;
  }

  .day-name {
    font-size: 0.9rem !important;
  }

  .slot-count {
    font-size: 0.65rem !important;
  }

  .status-active,
  .status-inactive {
    padding: 0.15rem 0.5rem !important;
    font-size: 0.6rem !important;
  }

  .add-slot-section {
    padding: 0.6rem !important;
  }

  .time-input {
    padding: 0.4rem !important;
    font-size: 0.85rem !important;
  }

  .time-label {
    font-size: 0.65rem !important;
  }

  .add-slot-btn {
    padding: 0.5rem 0.75rem !important;
    font-size: 0.75rem !important;
  }

  .slot-item {
    padding: 0.5rem 0.6rem !important;
  }

  .time-range {
    font-size: 0.8rem !important;
  }

  .delete-slot-btn {
    width: 28px !important;
    height: 28px !important;
    font-size: 0.65rem !important;
  }

  /* Appointments */
  .appointments-card .card-header {
    padding: 0.5rem 0.75rem !important;
  }

  .appointments-card .card-header h6 {
    font-size: 0.8rem !important;
  }

  .appointment-card {
    padding: 0.6rem !important;
    margin: 0.25rem !important;
    border-radius: 10px !important;
  }

  .appointment-time-mobile {
    font-size: 0.8rem !important;
  }

  .appointment-details h6 {
    font-size: 0.8rem !important;
  }

  .appointment-details p {
    font-size: 0.7rem !important;
  }

  .appointment-meta {
    font-size: 0.7rem !important;
  }

  .appointment-actions {
    position: relative !important;
    z-index: 10 !important;
  }
  
  .appointment-actions .btn {
    font-size: 0.65rem !important;
    padding: 0.3rem 0.4rem !important;
    position: relative !important;
    z-index: 10 !important;
    -webkit-appearance: none !important;
    appearance: none !important;
    touch-action: manipulation !important;
    min-height: 44px !important;
  }

  /* Customer Tab */
  .customers-tab .input-group {
    margin-bottom: 0.5rem;
  }

  /* Profile Tab */
  .profile-tab .card-header {
    padding: 0.6rem 0.75rem !important;
  }

  .profile-tab .card-header h5 {
    font-size: 0.9rem !important;
  }

  .profile-tab .form-control {
    font-size: 16px !important;
  }

  /* Modals */
  .modal-dialog {
    margin: 0.25rem !important;
    max-width: calc(100% - 0.5rem) !important;
  }

  .modal-header {
    padding: 0.6rem 0.75rem !important;
  }

  .modal-title {
    font-size: 0.9rem !important;
  }

  .modal-body {
    padding: 0.75rem !important;
  }

  .modal-footer {
    padding: 0.5rem 0.75rem !important;
    gap: 0.5rem !important;
  }

  .modal-footer .btn {
    flex: 1;
  }

  /* Booking Modal Specific */
  .booking-modal-body .form-label {
    font-size: 0.75rem !important;
  }

  .booking-modal-body .customer-search-container {
    position: relative !important;
    z-index: 1070 !important;
    margin-bottom: 0.5rem;
    isolation: isolate !important;
  }

  .booking-modal-body .customer-dropdown {
    max-height: 200px !important;
    z-index: 1070 !important;
    position: absolute !important;
    transform: translateZ(0) !important;
    -webkit-transform: translateZ(0) !important;
    will-change: transform !important;
    -webkit-overflow-scrolling: touch !important;
    pointer-events: auto !important;
    -webkit-touch-callout: none !important;
  }

  .booking-modal-body .customer-item {
    padding: 0.5rem !important;
    min-height: 44px !important;
    touch-action: manipulation !important;
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.2) !important;
    position: relative !important;
    z-index: 10 !important;
    pointer-events: auto !important;
    cursor: pointer !important;
    -webkit-user-select: none !important;
    user-select: none !important;
  }
  
  /* Ensure modal body doesn't block dropdown */
  .booking-modal-body {
    overflow: visible !important;
    position: relative !important;
  }

  .booking-modal-body .customer-name {
    font-size: 0.8rem !important;
  }

  .booking-modal-body .customer-details {
    font-size: 0.65rem !important;
  }

  /* Time Slots Grid */
  .time-slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr)) !important;
    gap: 0.25rem !important;
    max-height: 100px !important;
  }

  .time-slots-grid .btn {
    font-size: 0.6rem !important;
    padding: 0.25rem 0.3rem !important;
    min-width: 50px !important;
  }

  /* Week Picker */
  .mobile-week-picker {
    border-radius: 10px !important;
  }

  .week-picker-header {
    padding: 8px 12px !important;
  }

  .week-range-text {
    font-size: 0.75rem !important;
  }

  .week-nav-btn {
    width: 32px !important;
    height: 32px !important;
  }

  .week-day-cell {
    min-width: 36px !important;
    padding: 6px 2px !important;
  }

  .week-day-name {
    font-size: 0.55rem !important;
  }

  .week-day-number {
    font-size: 0.85rem !important;
  }

  .week-selected-date {
    padding: 8px 10px !important;
    font-size: 0.75rem !important;
  }

  /* Date Detail Modal */
  .date-detail-modal .modal-header {
    padding: 0.5rem 0.75rem !important;
  }

  .date-detail-modal .modal-title {
    font-size: 0.85rem !important;
  }

  .week-navigation-row .week-day-cell {
    min-width: 38px !important;
    padding: 6px 4px !important;
  }

  .calendar-week-cell {
    min-width: 32px !important;
    padding: 4px !important;
  }

  .schedule-header {
    font-size: 0.65rem !important;
  }

  .time-column {
    width: 42px !important;
    padding: 4px 2px !important;
  }

  .time-label {
    font-size: 0.7rem !important;
  }

  .half-hour-slot {
    min-height: 25px !important;
    padding: 4px !important;
  }

  .appointment-customer {
    font-size: 0.6rem !important;
  }

  .appointment-service {
    font-size: 0.55rem !important;
  }

  /* Off Date Toggle */
  .off-date-toggle-label-mobile {
    font-size: 0.7rem !important;
    padding: 0.3rem 0.5rem !important;
  }

  .toggle-slider-mobile {
    width: 36px !important;
    height: 20px !important;
  }

  /* Empty States */
  .empty-state i {
    font-size: 1.5rem !important;
  }

  .empty-state p {
    font-size: 0.75rem !important;
  }

  /* Dropdowns */
  .dropdown-menu {
    min-width: 160px !important;
    font-size: 0.8rem !important;
  }

  .dropdown-item {
    padding: 0.5rem 0.75rem !important;
  }
}

/* Small Mobile (380px - 576px) */
@media (min-width: 381px) and (max-width: 576px) {
  .admin-content {
    padding: 0.5rem !important;
  }

  .card-header {
    padding: 0.75rem !important;
  }

  .card-body {
    padding: 0.75rem !important;
  }

  /* Buttons */
  .btn {
    min-height: 42px;
  }

  .btn-sm {
    min-height: 38px;
  }

  /* Form Controls */
  .form-control,
  .form-select {
    font-size: 16px !important; /* Prevents iOS zoom */
  }

  /* Service Cards */
  .service-card .card-body {
    padding: 0.875rem !important;
  }

  .service-actions .btn {
    font-size: 0.7rem !important;
    padding: 0.35rem 0.5rem !important;
  }

  /* Appointments */
  .appointment-card {
    padding: 0.75rem !important;
  }

  .appointment-actions {
    position: relative !important;
    z-index: 10 !important;
  }
  
  .appointment-actions .btn {
    font-size: 0.7rem !important;
    padding: 0.35rem 0.5rem !important;
    position: relative !important;
    z-index: 10 !important;
    -webkit-appearance: none !important;
    appearance: none !important;
    touch-action: manipulation !important;
    min-height: 44px !important;
  }

  /* Modals */
  .modal-dialog {
    margin: 0.5rem !important;
  }

  .modal-body {
    padding: 1rem !important;
  }

  /* Time Slots Grid */
  .time-slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(55px, 1fr)) !important;
    max-height: 120px !important;
  }

  .time-slots-grid .btn {
    font-size: 0.65rem !important;
    padding: 0.3rem 0.4rem !important;
  }

  /* Week Picker */
  .week-day-cell {
    min-width: 40px !important;
    padding: 7px 3px !important;
  }

  .week-day-name {
    font-size: 0.6rem !important;
  }

  .week-day-number {
    font-size: 0.9rem !important;
  }
}

/* Touch Optimization for all mobile */
@media (max-width: 768px) {
  /* Ensure all interactive elements have proper touch targets */
  button,
  .btn,
  a,
  input[type="checkbox"],
  input[type="radio"],
  .form-check-input {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  /* Ensure proper touch feedback */
  .btn:active,
  button:active {
    transform: scale(0.97);
  }

  /* Prevent text selection on interactive elements */
  .btn,
  .admin-nav-item,
  .week-day-cell,
  .day-cell-pro,
  .calendar-day {
    -webkit-user-select: none;
    user-select: none;
  }

  /* Smooth scrolling containers */
  .modal-body,
  .appointments-list,
  .customer-dropdown,
  .time-slots-grid,
  .week-strip-container,
  .admin-nav {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }

  /* Hide scrollbars on mobile but keep functionality */
  .admin-nav::-webkit-scrollbar,
  .week-strip::-webkit-scrollbar,
  .time-slots-grid::-webkit-scrollbar {
    display: none;
  }

  .admin-nav,
  .week-strip,
  .time-slots-grid {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  /* Fix sticky header overlap issues */
  .admin-header {
    z-index: 1000;
  }

  /* Ensure modals appear above everything */
  .modal {
    z-index: 1050 !important;
  }

  .modal-backdrop {
    z-index: 1040 !important;
  }
}

/* Landscape mode optimization for mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .modal-body {
    max-height: calc(100vh - 100px) !important;
  }

  .booking-modal-body {
    max-height: calc(100vh - 120px) !important;
  }

  .mobile-week-picker {
    max-height: 150px;
    overflow-y: auto;
  }

  .week-strip-container {
    padding: 4px !important;
  }

  .week-day-cell {
    padding: 4px 2px !important;
  }
}

</style>
