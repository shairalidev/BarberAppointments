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
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information'
      }
      return titles[type] || titles.info
    }
  }
}
</script>

<style scoped>
.toast {
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: none;
  margin-bottom: 12px;
}

.toast-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px 12px 0 0;
}

.toast-body {
  border-radius: 0 0 12px 12px;
}
</style>