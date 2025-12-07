<template>
  <div class="modal fade" id="loginModal" tabindex="-1" ref="loginModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold text-primary">
            <i class="fas fa-shield-alt me-2"></i>Admin Login
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-4">
          <form @submit.prevent="login">
            <div class="mb-3">
              <label class="form-label fw-semibold">Username</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0">
                  <i class="fas fa-user text-muted"></i>
                </span>
                <input 
                  v-model="credentials.username" 
                  type="text" 
                  class="form-control border-start-0 ps-0" 
                  placeholder="Enter username"
                  required
                >
              </div>
            </div>
            <div class="mb-4">
              <label class="form-label fw-semibold">Password</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0">
                  <i class="fas fa-lock text-muted"></i>
                </span>
                <input 
                  v-model="credentials.password" 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control border-start-0 border-end-0 ps-0" 
                  placeholder="Enter password"
                  required
                >
                <button 
                  type="button" 
                  class="btn btn-outline-secondary border-start-0"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>
            <div v-if="error" class="alert alert-danger py-2">
              <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
            </div>
            <button 
              type="submit" 
              class="btn btn-primary w-100 py-2 fw-semibold"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-sign-in-alt me-2"></i>
              {{ loading ? 'Signing In...' : 'Sign In' }}
            </button>
          </form>
          <div class="text-center mt-3">
            <small class="text-muted">
              <i class="fas fa-info-circle me-1"></i>
              Default: admin / admin
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { Modal } from 'bootstrap'

export default {
  name: 'LoginModal',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      showPassword: false,
      loading: false,
      error: '',
      modal: null
    }
  },
  mounted() {
    this.modal = new Modal(this.$refs.loginModal)
  },
  methods: {
    show() {
      this.error = ''
      this.credentials = { username: '', password: '' }
      this.modal.show()
    },
    hide() {
      this.modal.hide()
    },
    async login() {
      this.loading = true
      this.error = ''
      
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_URL}/auth/login`, this.credentials)
        
        localStorage.setItem('adminToken', response.data.token)
        localStorage.setItem('adminUser', JSON.stringify(response.data.admin))
        
        this.$emit('login-success')
        this.hide()
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.modal-content {
  border-radius: 16px;
}

.input-group-text {
  border-radius: 8px 0 0 8px;
}

.form-control {
  border-radius: 0 8px 8px 0;
}

.form-control:focus {
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
  border-color: #3b82f6;
}

.btn-primary {
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}
</style>