// src/api.js
import axios from 'axios'

// API base URL - environment'a göre ayarlanabilir
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.faturina.com'

// Axios instance oluştur
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor - token ekleme
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Debug için
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
        params: config.params
      })
    }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => {
    // Debug için
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: response.status,
        data: response.data,
        url: response.config.url
      })
    }
    
    return response
  },
  (error) => {
    console.error('API Error:', error)
    
    // 401 hatası - token geçersiz
    if (error.response?.status === 401) {
      // Token'ı temizle ve login'e yönlendir
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      
      // Vue router ile yönlendirme için event dispatch
      window.dispatchEvent(new CustomEvent('auth-expired'))
    }
    
    // 403 hatası - yetkisiz erişim
    if (error.response?.status === 403) {
      console.warn('Yetkisiz erişim:', error.response.config.url)
    }
    
    // 500+ hatası - sunucu hatası
    if (error.response?.status >= 500) {
      console.error('Sunucu hatası:', error.response.status)
    }
    
    return Promise.reject(error)
  }
)

export default api