<template>
  <div class="modal fade" id="loginModal" tabindex="-1" ref="loginModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold text-primary">
            <i class="fas fa-shield-alt me-2"></i>{{ $t('login.adminLogin') }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-4">
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
      modal.show()
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
.modal-content {
  border-radius: 16px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

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

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(107, 114, 128, 0.3);
}

/* iOS Safari Optimizations */
@supports (-webkit-touch-callout: none) {
  /* Prevent zoom on input focus */
  .form-control {
    font-size: 16px !important;
    min-height: 44px;
    -webkit-appearance: none;
    appearance: none;
  }
  
  .btn {
    -webkit-appearance: none;
    appearance: none;
    touch-action: manipulation;
    min-height: 44px;
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.2);
  }
  
  /* Modal safe area support */
  .modal-dialog {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  /* Input group */
  .input-group-text {
    min-height: 44px;
  }
  
  /* Prevent text selection */
  .btn,
  .form-label {
    -webkit-user-select: none;
    user-select: none;
  }
}

@media (max-width: 576px) {
  /* Mobile iOS Safari fixes */
  .modal-content {
    max-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    max-height: calc(-webkit-fill-available - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  }
  
  .form-control {
    font-size: 16px !important;
    min-height: 44px;
  }
  
  .btn {
    min-height: 44px;
    touch-action: manipulation;
  }
  
  /* Prevent double-tap zoom */
  .form-control,
  .btn {
    touch-action: manipulation;
  }
}
</style>