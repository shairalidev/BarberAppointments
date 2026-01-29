<template>
  <div class="modal fade responsive-modal" id="loginModal" tabindex="-1" ref="loginModal">
    <div class="modal-dialog modal-dialog-centered responsive-modal-dialog">
      <div class="modal-content border-0 shadow-lg responsive-modal-content">
        <div class="modal-header border-0 responsive-modal-header">
          <h5 class="modal-title fw-bold text-primary">
            <i class="fas fa-shield-alt me-2"></i>{{ $t('login.adminLogin') }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body responsive-modal-body">
          <form @submit.prevent="login">
            <div class="mb-3">
              <label class="form-label fw-semibold">{{ $t('login.username') }}</label>
              <div class="input-group">
                <span class="input-group-text border-end-0">
                  <i class="fas fa-user text-muted"></i>
                </span>
                <input 
                  v-model="credentials.username" 
                  type="text" 
                  class="form-control border-start-0 ps-0" 
                  :placeholder="$t('login.enterUsername')"
                  required
                  autocomplete="username"
                  inputmode="text"
                >
              </div>
            </div>
            <div class="mb-4">
              <label class="form-label fw-semibold">{{ $t('login.password') }}</label>
              <div class="input-group">
                <span class="input-group-text border-end-0">
                  <i class="fas fa-lock text-muted"></i>
                </span>
                <input 
                  v-model="credentials.password" 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control border-start-0 border-end-0 ps-0" 
                  :placeholder="$t('login.enterPassword')"
                  required
                  autocomplete="current-password"
                >
                <button 
                  type="button" 
                  class="btn btn-outline-secondary border-start-0"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
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
              {{ loading ? $t('login.signingIn') : $t('login.signIn') }}
            </button>
          </form>
          <div class="text-center mt-3">
            <small class="text-muted">
              <i class="fas fa-info-circle me-1"></i>
              {{ $t('login.defaultCredentials') }}
            </small>
          </div>
        </div>
        <div class="modal-footer responsive-modal-footer d-none">
          <!-- Footer space for mobile layout consistency -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

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
      error: ''
    }
  },
  methods: {
    show() {
      this.error = ''
      this.credentials = { username: '', password: '' }
      const modalEl = this.$refs.loginModal
      const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl)
      // Add body class to prevent scroll
      document.body.classList.add('modal-open')
      modal.show()
      // Remove body class when modal is hidden
      modalEl.addEventListener('hidden.bs.modal', () => {
        document.body.classList.remove('modal-open')
      }, { once: true })
    },
    hide() {
      const modalEl = this.$refs.loginModal
      const modal = window.bootstrap.Modal.getInstance(modalEl)
      if (modal) modal.hide()
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
/* Component-specific styles - responsive styles are in modal-responsive.css */
.input-group-text {
  border-radius: 8px 0 0 8px;
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.form-control {
  border-radius: 0 8px 8px 0;
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.form-control:focus {
  box-shadow: 0 0 0 0.2rem rgba(107, 114, 128, 0.25);
  border-color: var(--primary);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-primary {
  border-radius: 8px;
  background: var(--primary);
  border: none;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(107, 114, 128, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Input group adjustments */
.input-group {
  display: flex;
  align-items: stretch;
  width: 100%;
}

.input-group .btn {
  border-radius: 0 8px 8px 0;
  min-height: 48px;
}

@media (max-width: 575.98px) {
  .input-group .btn {
    min-height: 48px;
    padding: 0.75rem;
  }
}
</style>