<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
    <div class="container">
      <router-link class="navbar-brand fw-bold d-flex align-items-center logo-container" to="/">
        <span class="brand-text">ATES BARBEROS</span>
      </router-link>
      
      <button 
        class="navbar-toggler border-0" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto w-100 w-lg-auto">
          <li class="nav-item">
            <router-link class="nav-link px-3 fw-medium" to="/" exact-active-class="active">
              <i class="fas fa-home me-1"></i>{{ $t('nav.home') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link px-3 fw-medium" to="/appointments" active-class="active">
              <i class="fas fa-calendar-plus me-1"></i>{{ $t('nav.bookNow') }}
            </router-link>
          </li>
        </ul>
        
        <div class="navbar-actions d-none d-lg-flex align-items-center">
          <div class="nav-item me-2">
            <button
              @click="toggleLanguage"
              class="btn btn-outline-primary btn-sm px-2"
              :title="currentLocale === 'en' ? 'Switch to German' : 'Switch to English'"
            >
              {{ currentLocale === 'en' ? 'DE' : 'EN' }}
            </button>
          </div>
          <div class="nav-item me-3">
            <button
              @click="toggleTheme"
              :class="['theme-toggle', { active: isDark }]"
              :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <i class="fas fa-sun theme-toggle-icon sun-icon"></i>
              <i class="fas fa-moon theme-toggle-icon moon-icon"></i>
            </button>
          </div>
          <div v-if="!isLoggedIn" class="nav-item">
            <button @click="showLogin" class="btn btn-outline-primary btn-sm px-3">
              <i class="fas fa-shield-alt me-1"></i>{{ $t('nav.admin') }}
            </button>
          </div>
          <div v-else class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              id="adminDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div class="admin-avatar me-2">
                <i class="fas fa-user-shield"></i>
              </div>
              <span class="fw-medium">{{ adminUser?.username }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="adminDropdown">
              <li>
                <router-link class="dropdown-item" to="/admin">
                  <i class="fas fa-cog me-2"></i>Admin Panel
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a href="#" @click.prevent="logout" class="dropdown-item text-danger">
                  <i class="fas fa-sign-out-alt me-2"></i>Logout
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="mobile-actions d-lg-none w-100 mt-3 pt-3 border-top">
          <div class="row g-2">
            <div class="col-6">
              <button
                @click="toggleLanguage"
                class="btn btn-outline-primary btn-sm w-100"
                :title="currentLocale === 'en' ? 'Switch to German' : 'Switch to English'"
              >
                <i class="fas fa-language me-1"></i>{{ currentLocale === 'en' ? 'DE' : 'EN' }}
              </button>
            </div>
            <div class="col-6">
              <button
                @click="toggleTheme"
                class="btn btn-outline-secondary theme-toggle-mobile w-100"
                :class="{ 'active': isDark }"
                :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              >
                <i class="fas fa-sun me-1" v-if="!isDark"></i>
                <i class="fas fa-moon me-1" v-else></i>
                <span class="d-none d-sm-inline">{{ isDark ? 'Dark' : 'Light' }}</span>
              </button>
            </div>
            <div class="col-12 mt-2">
              <button
                v-if="!isLoggedIn"
                @click="showLogin"
                class="btn btn-primary w-100"
              >
                <i class="fas fa-shield-alt me-2"></i>{{ $t('nav.admin') }}
              </button>
              <div v-else class="d-flex gap-2">
                <router-link class="btn btn-primary flex-fill" to="/admin">
                  <i class="fas fa-cog me-2"></i>{{ $t('nav.admin') }}
                </router-link>
                <button @click.prevent="logout" class="btn btn-outline-danger">
                  <i class="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { logout as authLogout } from '../utils/auth'
import { useTheme } from '../composables/useTheme'
import { useLanguage } from '../composables/useLanguage'

export default {
  name: 'Navbar',
  setup() {
    const { isDark, toggleTheme } = useTheme()
    const { currentLocale, toggleLanguage } = useLanguage()
    return { isDark, toggleTheme, currentLocale, toggleLanguage }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('adminToken')
    },
    adminUser() {
      const user = localStorage.getItem('adminUser')
      return user ? JSON.parse(user) : null
    }
  },
  methods: {
    showLogin() {
      this.$emit('show-login')
    },
    logout() {
      authLogout()
    }
  }
}
</script>

<style scoped>
.navbar {
  backdrop-filter: blur(10px);
  background-color: var(--bg-secondary) !important;
  border-bottom: 1px solid var(--border-color);
}

.navbar-actions {
  gap: 0.25rem;
}

.logo-container {
  padding: 4px 8px;
  background: transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.logo-container:hover {
  transform: translateY(-1px);
}

.brand-text {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--text-primary);
  white-space: nowrap;
  transition: color 0.3s ease;
}

.logo-container:hover .brand-text {
  color: var(--primary);
}


.nav-link {
  color: var(--text-secondary) !important;
  transition: all 0.2s ease;
  border-radius: 6px;
  position: relative;
  font-size: 0.8rem !important;
  padding: 0.4rem 0.6rem !important;
}

.nav-link:hover {
  color: var(--primary) !important;
  background-color: rgba(107, 114, 128, 0.1);
}

.nav-link.active {
  color: var(--primary) !important;
  background-color: rgba(107, 114, 128, 0.1);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: var(--primary);
  border-radius: 2px;
}

.admin-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
}

.dropdown-menu {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  margin-top: 8px;
  background-color: var(--bg-secondary);
}

.dropdown-item {
  padding: 8px 16px;
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background-color: rgba(107, 114, 128, 0.1);
  color: var(--primary);
}

.btn-outline-primary {
  border-radius: 20px;
  border: 2px solid var(--primary);
  color: var(--primary);
  font-weight: 600;
  transition: all 0.2s;
}

.btn-outline-primary:hover {
  background: var(--primary);
  border-color: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

/* Mobile Optimizations */
@media (max-width: 991px) {
  .logo-container {
    padding: 4px 8px;
  }
  
  .brand-text {
    font-size: 0.9rem;
    letter-spacing: 0.2px;
  }
  
  .navbar-collapse {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  }
  
  .nav-link {
    padding: 0.4rem 0.75rem !important;
    margin: 0.1rem 0;
    border-radius: 6px;
    text-align: center;
    min-height: 32px;
    font-size: 0.75rem !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .mobile-actions {
    border-top: 1px solid var(--border-color) !important;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
  }

  .mobile-actions .row {
    margin: 0;
  }

  .mobile-actions .row.g-2 {
    --bs-gutter-y: 0.25rem;
    --bs-gutter-x: 0.25rem;
  }

  .mobile-actions .btn {
    padding: 0.35rem 0.6rem;
    font-size: 0.7rem;
    border-radius: 6px;
    min-height: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    width: 100%;
  }

  .mobile-actions .btn i {
    font-size: 0.7rem;
  }

  .mobile-actions .theme-toggle-mobile {
    min-height: 30px;
    height: 30px;
    padding: 0.35rem 0.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    font-size: 0.7rem;
    font-weight: 500;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
    color: var(--text-primary);
    transition: all 0.2s ease;
  }

  .mobile-actions .theme-toggle-mobile:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary);
    color: var(--primary);
  }

  .mobile-actions .theme-toggle-mobile.active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }

  .mobile-actions .theme-toggle-mobile i {
    font-size: 0.75rem;
  }

  .mobile-actions .col-6 {
    padding: 0 0.25rem;
  }

  .mobile-actions .col-12 {
    padding: 0;
  }

  .mobile-actions .col-12 .d-flex {
    gap: 0.25rem;
  }

  .mobile-actions .col-12 .btn {
    min-height: 30px;
    height: 30px;
  }

  .mobile-actions .col-12 .btn-outline-danger {
    min-width: 36px;
    padding: 0.35rem;
  }
  
  .nav-link.active::after {
    display: none;
  }

  .navbar-toggler {
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px;
  }

  .navbar-toggler:focus {
    box-shadow: 0 0 0 0.2rem rgba(107, 114, 128, 0.25);
  }
}

@media (max-width: 576px) {
  .logo-container {
    padding: 3px 6px;
  }
  
  .brand-text {
    font-size: 0.8rem;
    letter-spacing: 0.1px;
  }
}

@media (max-width: 400px) {
  .brand-text {
    font-size: 0.75rem;
  }
}

/* iOS Safari Optimizations */
@supports (-webkit-touch-callout: none) {
  .navbar {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .nav-link,
  .btn {
    -webkit-appearance: none;
    appearance: none;
    touch-action: manipulation;
    min-height: 44px;
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.2);
  }
  
  .navbar-toggler {
    -webkit-appearance: none;
    appearance: none;
    touch-action: manipulation;
    min-height: 44px;
    min-width: 44px;
  }
  
  .dropdown-menu {
    -webkit-overflow-scrolling: touch;
  }
  
  .dropdown-item {
    min-height: 44px;
    touch-action: manipulation;
  }
  
  /* Prevent text selection */
  .nav-link,
  .btn,
  .brand-text {
    -webkit-user-select: none;
    user-select: none;
  }
}

@media (max-width: 768px) {
  /* Mobile iOS Safari fixes */
  .navbar {
    padding-top: max(0.5rem, env(safe-area-inset-top));
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }
  
  .mobile-actions .btn {
    min-height: 44px;
    touch-action: manipulation;
    -webkit-appearance: none;
    appearance: none;
  }
  
  /* Prevent double-tap zoom */
  .nav-link,
  .btn,
  .navbar-toggler {
    touch-action: manipulation;
  }
}
</style>