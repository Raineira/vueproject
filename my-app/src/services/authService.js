// src/services/authService.js
import api from '@/api'

export const authService = {
  // Login
  async login(credentials) {
    try {
      const response = await api.post('/login', {
        email: credentials.email,
        password: credentials.password
      })
      
      // Token'ı localStorage'a kaydet
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token)
      }
      
      // User bilgisini localStorage'a kaydet
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw this.handleError(error)
    }
  },

  // Register
  async register(userData) {
    try {
      const response = await api.post('/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.passwordConfirmation
      })
      
      return response.data
    } catch (error) {
      console.error('Register error:', error)
      throw this.handleError(error)
    }
  },

  // Logout
  async logout() {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.post('/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.newPasswordConfirmation
      })
      
      return response.data
    } catch (error) {
      console.error('Change password error:', error)
      throw this.handleError(error)
    }
  },

  // Send activation mail
  async sendActivationMail(email) {
    try {
      const response = await api.post('/send-activation-mail', { email })
      return response.data
    } catch (error) {
      console.error('Send activation mail error:', error)
      throw this.handleError(error)
    }
  },

  // Verify activation mail
  async verifyActivationMail(token) {
    try {
      const response = await api.post('/verify-activation-mail', { token })
      return response.data
    } catch (error) {
      console.error('Verify activation mail error:', error)
      throw this.handleError(error)
    }
  },

  // Forget password request
  async forgetPasswordRequest(email) {
    try {
      const response = await api.post('/forget-password-request', { email })
      return response.data
    } catch (error) {
      console.error('Forget password request error:', error)
      throw this.handleError(error)
    }
  },

  // Forget password verify
  async forgetPasswordVerify(data) {
    try {
      const response = await api.post('/forget-password-verify', {
        token: data.token,
        password: data.password,
        password_confirmation: data.passwordConfirmation
      })
      
      return response.data
    } catch (error) {
      console.error('Forget password verify error:', error)
      throw this.handleError(error)
    }
  },

  // Token var mı kontrol et
  isAuthenticated() {
    return !!localStorage.getItem('access_token')
  },

  // Kullanıcı bilgisini localStorage'dan al
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Token'ı al
  getToken() {
    return localStorage.getItem('access_token')
  },

  // Hata yönetimi
  handleError(error) {
    let message = 'Bir hata oluştu'
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          message = data.message || 'Geçersiz istek'
          break
        case 401:
          message = 'E-posta veya şifre hatalı'
          break
        case 403:
          message = 'Bu işlem için yetkiniz yok'
          break
        case 422:
          message = data.message || 'Doğrulama hatası'
          if (data.errors) {
            const validationErrors = Object.values(data.errors).flat()
            message = validationErrors.join(', ')
          }
          break
        case 429:
          message = 'Çok fazla deneme. Lütfen bekleyin.'
          break
        case 500:
          message = 'Sunucu hatası'
          break
        default:
          message = data.message || `HTTP ${status} hatası`
      }
    } else if (error.request) {
      message = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.'
    } else {
      message = error.message
    }
    
    return new Error(message)
  }
}