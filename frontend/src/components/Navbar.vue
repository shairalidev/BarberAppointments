<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
    <div class="container">
      <router-link class="navbar-brand fw-bold text-primary d-flex align-items-center logo-container" to="/">
        <img src="/logo.png" alt="Logo" class="brand-logo" />
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
                :class="['theme-toggle', 'w-100', { active: isDark }]"
                :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              >
                <i class="fas fa-sun theme-toggle-icon sun-icon"></i>
                <i class="fas fa-moon theme-toggle-icon moon-icon"></i>
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
  padding: 8px 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.logo-container:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.brand-logo {
  height: 65px;
  width: auto;
  object-fit: contain;
  max-width: 250px;
  display: block;
}


.nav-link {
  color: var(--text-secondary) !important;
  transition: all 0.2s ease;
  border-radius: 8px;
  position: relative;
}

.nav-link:hover {
  color: var(--primary) !important;
  background-color: rgba(59, 130, 246, 0.1);
}

.nav-link.active {
  color: var(--primary) !important;
  background-color: rgba(59, 130, 246, 0.1);
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
  background-color: rgba(59, 130, 246, 0.1);
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
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Mobile Optimizations */
@media (max-width: 991px) {
  .logo-container {
    padding: 6px 12px;
  }
  
  .brand-logo {
    height: 55px;
    max-width: 220px;
  }
  
  .navbar-collapse {
    margin-top: 0.75rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 12px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  }
  
  .nav-link {
    padding: 0.75rem 1rem !important;
    margin: 0.125rem 0;
    border-radius: 8px;
    text-align: center;
  }
  
  .mobile-actions {
    border-top: 1px solid var(--border-color) !important;
  }

  .mobile-actions .btn,
  .mobile-actions .theme-toggle {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    border-radius: 8px;
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
    box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
  }
}

@media (max-width: 576px) {
  .logo-container {
    padding: 5px 10px;
  }
  
  .brand-logo {
    height: 45px;
    max-width: 180px;
  }
}
</style>