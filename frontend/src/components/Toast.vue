<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1055;">
    <div 
      v-for="toast in toasts" 
      :key="toast.id"
      class="toast show"
      role="alert"
    >
      <div class="toast-header">
        <i :class="getIconClass(toast.type)" class="me-2"></i>
        <strong class="me-auto">{{ getTitle(toast.type) }}</strong>
        <button 
          type="button" 
          class="btn-close" 
          @click="removeToast(toast.id)"
        ></button>
      </div>
      <div class="toast-body">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Toast',
  data() {
    return {
      toasts: []
    }
  },
  methods: {
    show(message, type = 'info', duration = 5000) {
      const id = Date.now()
      this.toasts.push({ id, message, type })
      
      setTimeout(() => {
        this.removeToast(id)
      }, duration)
    },
    removeToast(id) {
      this.toasts = this.toasts.filter(toast => toast.id !== id)
    },
    getIconClass(type) {
      const icons = {
        success: 'fas fa-check-circle text-success',
        error: 'fas fa-exclamation-circle text-danger',
        warning: 'fas fa-exclamation-triangle text-warning',
        info: 'fas fa-info-circle text-info'
      }
      return icons[type] || icons.info
    },
    getTitle(type) {
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
.toast {
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  border: none;
  margin-bottom: 12px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.toast-header {
  border-bottom: 1px solid var(--border-color);
  border-radius: 12px 12px 0 0;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.toast-body {
  border-radius: 0 0 12px 12px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

/* iOS Safari Optimizations */
@supports (-webkit-touch-callout: none) {
  .toast-container {
    padding-top: env(safe-area-inset-top);
    padding-right: env(safe-area-inset-right);
  }
  
  .toast {
    -webkit-overflow-scrolling: touch;
    touch-action: manipulation;
  }
  
  .btn-close {
    -webkit-appearance: none;
    appearance: none;
    touch-action: manipulation;
    min-height: 44px;
    min-width: 44px;
    -webkit-tap-highlight-color: rgba(107, 114, 128, 0.2);
  }
  
  /* Prevent text selection */
  .toast-header,
  .toast-body {
    -webkit-user-select: none;
    user-select: none;
  }
}

@media (max-width: 576px) {
  .toast-container {
    padding: 0.5rem;
    padding-top: max(0.5rem, env(safe-area-inset-top));
    padding-right: max(0.5rem, env(safe-area-inset-right));
  }
  
  .toast {
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  
  .btn-close {
    min-height: 44px;
    min-width: 44px;
  }
}
</style>