<template>
  <div id="app">
    <Navbar @show-login="showLoginModal" @logout="handleLogout" />
    <router-view :key="$route.fullPath" />
    <LoginModal ref="loginModal" @login-success="handleLoginSuccess" />
    <Toast ref="toast" />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
import LoginModal from './components/LoginModal.vue'
import Toast from './components/Toast.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    LoginModal,
    Toast
  },
  methods: {
    showLoginModal() {
      this.$refs.loginModal.show()
    },
    handleLoginSuccess() {
      this.$router.replace('/admin')
    },
    handleLogout() {
      // Force reactivity update
      this.$forceUpdate()
    }
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f8fafc;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-link {
  font-weight: 500;
  color: #64748b !important;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #3b82f6 !important;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>