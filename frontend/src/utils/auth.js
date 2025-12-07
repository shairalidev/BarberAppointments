import axios from 'axios'

export const isAuthenticated = () => {
  return !!localStorage.getItem('adminToken')
}

export const getToken = () => {
  return localStorage.getItem('adminToken')
}

export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && localStorage.getItem('adminToken')) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        if (window.location.pathname === '/admin') {
          window.location.href = '/'
        }
      }
      return Promise.reject(error)
    }
  )
}