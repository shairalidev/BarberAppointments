<template>
  <div id="app">
    <Navbar v-if="$route.path !== '/admin'" @show-login="showLoginModal" @logout="handleLogout" />
    <router-view :key="$route.fullPath" />
    <LoginModal ref="loginModal" @login-success="handleLoginSuccess" />
    <Toast ref="toast" />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
import LoginModal from './components/LoginModal.vue'
import Toast from './components/Toast.vue'
import { useTheme } from './composables/useTheme'

export default {
  name: 'App',
  components: {
    Navbar,
    LoginModal,
    Toast
  },
  setup() {
    // Initialize theme
    useTheme()
  },
  methods: {
    showLoginModal() {
      this.$nextTick(() => {
        if (this.$refs.loginModal) {
          this.$refs.loginModal.show()
        }
      })
    },
    handleLoginSuccess() {
      this.$router.push('/admin')
      this.$forceUpdate()
    },
    handleLogout() {
      this.$forceUpdate()
    }
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

h1, h2, h3, h4, h5, h6 {
  color: var(--text-primary) !important;
}

.text-primary {
  color: var(--primary) !important;
}

.text-secondary {
  color: var(--text-secondary) !important;
}

.bg-primary {
  background-color: var(--primary) !important;
}

.bg-secondary {
  background-color: var(--text-secondary) !important;
}

.bg-success {
  background-color: var(--success) !important;
}

.bg-danger {
  background-color: var(--danger) !important;
}

.bg-warning {
  background-color: var(--warning) !important;
}

.bg-info {
  background-color: var(--info) !important;
}

.card-header {
  background-color: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-link {
  font-weight: 500;
  color: var(--text-secondary) !important;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--primary) !important;
}

.btn-primary {
  background: var(--primary);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(107, 114, 128, 0.3);
}

.card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  transition: all 0.2s;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}
</style>