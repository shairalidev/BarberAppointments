import axios from 'axios'

export const isAuthenticated = () => {
  return !!localStorage.getItem('adminToken')
}

export const getToken = () => {
  return localStorage.getItem('adminToken')
}

export const logout = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  window.location.href = '/'
}

export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // Ensure proper headers for all requests
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'
      config.headers['Accept'] = 'application/json'
      
      console.log('Making request to:', config.url, 'with method:', config.method)
      return config
    },
    (error) => {
      console.error('Request interceptor error:', error)
      return Promise.reject(error)
    }
  )

  axios.interceptors.response.use(
    (response) => {
      console.log('Response received from:', response.config.url, 'Status:', response.status)
      return response
    },
    (error) => {
      console.error('Response interceptor error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      if (error.response?.status === 401) {
        logout()
      }
      
      // Handle JSON parsing errors
      if (error.message.includes('JSON') || error.message.includes('Unexpected token')) {
        console.error('JSON parsing error - server may have returned HTML instead of JSON')
        console.error('Response text:', error.response?.data)
      }
      
      return Promise.reject(error)
    }
  )
}