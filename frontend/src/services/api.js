import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants.js'
import { 
  getAccessToken, 
  getRefreshToken, 
  setAccessToken, 
  clearSession 
} from '@/utils/storage.js'

// Cliente HTTP principal
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Variables para refresh token
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// === INTERCEPTORS ===

// REQUEST: Agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(` API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    console.error(' Request Error:', error)
    return Promise.reject(error)
  }
)

// RESPONSE: Manejo de errores y refresh token
apiClient.interceptors.response.use(
  (response) => {
    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(` API Response: ${response.status} ${response.config.url}`)
    }
    
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Log de errores
    console.error(` API Error: ${error.response?.status} ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    })
    
    // Error 401 - Token expirado
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Ya estamos refreshing, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      const refreshToken = getRefreshToken()
      
      if (refreshToken) {
        try {
          // Intentar refresh
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken
          })
          
          const { accessToken } = response.data.data
          setAccessToken(accessToken)
          
          processQueue(null, accessToken)
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
          
        } catch (refreshError) {
          console.error(' Refresh token failed:', refreshError)
          processQueue(refreshError, null)
          clearSession()
          
          // Redirigir al login
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else {
        // No hay refresh token
        clearSession()
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// === FUNCIONES HELPER ===

export const get = (url, config = {}) => {
  return apiClient.get(url, config)
}

export const post = (url, data = {}, config = {}) => {
  return apiClient.post(url, data, config)
}

export const put = (url, data = {}, config = {}) => {
  return apiClient.put(url, data, config)
}

export const del = (url, config = {}) => {
  return apiClient.delete(url, config)
}

// Upload de archivos
export const upload = (url, formData, onUploadProgress = null) => {
  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress
  })
}

// Health check
export const healthCheck = () => {
  return get('/api/health')
}

export default apiClient