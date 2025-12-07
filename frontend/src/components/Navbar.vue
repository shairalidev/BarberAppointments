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
              <i class="fas fa-home me-1"></i>Home
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link px-3 fw-medium" to="/appointments" active-class="active">
              <i class="fas fa-calendar-plus me-1"></i>Book Now
            </router-link>
          </li>
        </ul>
        
        <div class="navbar-nav">
          <div v-if="!isLoggedIn" class="nav-item">
            <button @click="showLogin" class="btn btn-outline-primary btn-sm px-3">
              <i class="fas fa-shield-alt me-1"></i>Admin
            </button>
          </div>
          <div v-else class="nav-item dropdown">
            <a 
              class="nav-link dropdown-toggle d-flex align-items-center" 
              href="#" 
              id="adminDropdown" 
              role="button" 
              data-bs-toggle="dropdown"
            >
              <div class="admin-avatar me-2">
                <i class="fas fa-user-shield"></i>
              </div>
              <span class="fw-medium">{{ adminUser?.username }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
              <li>
                <router-link class="dropdown-item" to="/admin">
                  <i class="fas fa-cog me-2"></i>Admin Panel
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button @click="logout" class="dropdown-item text-danger">
                  <i class="fas fa-sign-out-alt me-2"></i>Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
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
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      if (this.$route.path === '/admin') {
        this.$router.replace('/')
      }
      this.$emit('logout')
    }
  }
}
</script>

<style scoped>
.navbar {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95) !important;
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
  color: #64748b !important;
  transition: all 0.2s ease;
  border-radius: 8px;
  position: relative;
}

.nav-link:hover {
  color: #3b82f6 !important;
  background-color: rgba(59, 130, 246, 0.1);
}

.nav-link.active {
  color: #3b82f6 !important;
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
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
}

.dropdown-item {
  padding: 8px 16px;
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.btn-outline-primary {
  border-radius: 20px;
  border: 2px solid #3b82f6;
  color: #3b82f6;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-outline-primary:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Mobile Optimizations */
@media (max-width: 991px) {
  .navbar-collapse {
    margin-top: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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