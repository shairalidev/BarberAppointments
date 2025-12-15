<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
    <div class="container">
      <router-link class="navbar-brand fw-bold text-primary d-flex align-items-center" to="/">
        <div class="brand-icon me-2">
          <i class="fas fa-cut"></i>
        </div>
        <span class="brand-text">BarberPro</span>
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
        <ul class="navbar-nav me-auto">
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
        
        <div class="navbar-nav">
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

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.brand-text {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  .navbar-collapse {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 12px;
    box-shadow: var(--shadow-md);
  }
  
  .nav-link {
    padding: 0.75rem 1rem !important;
    margin: 0.25rem 0;
  }
  
  .navbar-nav .btn {
    width: 100%;
    margin-top: 0.5rem;
  }
  
  .nav-link.active::after {
    display: none;
  }
}

@media (max-width: 576px) {
  .brand-text {
    font-size: 1.25rem;
  }
  
  .brand-icon {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
}
</style>