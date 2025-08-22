<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>Giriş Yap</h2>
        <p>Hesabınıza erişim sağlayın</p>
      </div>
      
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="email">E-posta</label>
          <input 
            id="email"
            v-model="credentials.email" 
            type="email" 
            placeholder="ornek@email.com"
            required
            :disabled="authStore.isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Şifre</label>
          <input 
            id="password"
            v-model="credentials.password" 
            type="password" 
            placeholder="Şifrenizi girin"
            required
            :disabled="authStore.isLoading"
          />
        </div>
        
        <div class="form-options">
          <label class="checkbox-container">
            <input type="checkbox" v-model="rememberMe">
            <span class="checkmark"></span>
            Beni hatırla
          </label>
          <a href="#" class="forgot-password">Şifremi unuttum</a>
        </div>
        
        <button 
          type="submit" 
          class="login-button"
          :disabled="authStore.isLoading || !isFormValid"
        >
          <span v-if="authStore.isLoading" class="loading-spinner"></span>
          {{ authStore.isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
        </button>
        
        <!-- API Error Message -->
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <!-- Debug Info (Development Only) -->
        <div v-if="isDevelopment" class="debug-info">
          <h4>Debug Bilgileri:</h4>
          <p><strong>API Base URL:</strong> {{ apiBaseUrl }}</p>
          <p><strong>Token:</strong> {{ authStore.token ? 'Var' : 'Yok' }}</p>
          <button type="button" @click="toggleTestMode" class="test-button">
            {{ useTestMode ? 'Gerçek API\'ye Geç' : 'Test Moduna Geç' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginForm',
  
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  
  data() {
    return {
      credentials: {
        email: '',
        password: ''
      },
      rememberMe: false,
      isDevelopment: import.meta.env.DEV,
      useTestMode: false, // Test modu için
      apiBaseUrl: import.meta.env.DEV ? 'Proxy' : 'https://api.faturina.com'
    }
  },

  computed: {
    isFormValid() {
      return this.credentials.email && 
             this.credentials.password && 
             this.credentials.email.includes('@')
    }
  },
  
  methods: {
    async login() {
      console.log('Login başlıyor...')
      
      // Clear previous errors
      this.authStore.clearError()
      
      try {
        if (this.useTestMode) {
          // Test mode - fake login
          await this.fakeLogin()
        } else {
          // Real API login
          await this.realApiLogin()
        }
      } catch (error) {
        console.error('Login error:', error)
      }
    },

    async realApiLogin() {
      console.log('Real API login başlıyor...')
      
      const result = await this.authStore.login({
        email: this.credentials.email,
        password: this.credentials.password
      })
      
      if (result.success) {
        console.log('Login başarılı, dashboard\'a yönlendiriliyor...')
        // Login başarılı - dashboard'a yönlendir
        const redirectPath = this.$route.query.redirect || '/dashboard'
        await this.$router.push(redirectPath)
      } else {
        console.log('Login başarısız:', result.error)
      }
    },

    async fakeLogin() {
      console.log('Fake login başlıyor...')
      
      // Validation
      if (!this.credentials.email.trim() || !this.credentials.password.trim()) {
        this.authStore.error = 'Lütfen tüm alanları doldurun'
        return
      }

      this.authStore.isLoading = true
      
      try {
        // Fake delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Fake token ve user bilgisi
        const fakeToken = 'demo-token-' + Date.now()
        const fakeUser = {
          id: 1,
          name: 'Demo User',
          email: this.credentials.email
        }
        
        // Store'u güncelle
        this.authStore.token = fakeToken
        this.authStore.user = fakeUser
        
        // localStorage'a kaydet
        localStorage.setItem('access_token', fakeToken)
        localStorage.setItem('user', JSON.stringify(fakeUser))
        
        console.log('Fake login başarılı')
        
        // Dashboard'a yönlendir
        const redirectPath = this.$route.query.redirect || '/dashboard'
        await this.$router.push(redirectPath)
        
      } catch (error) {
        this.authStore.error = 'Test login sırasında hata oluştu'
      } finally {
        this.authStore.isLoading = false
      }
    },

    toggleTestMode() {
      this.useTestMode = !this.useTestMode
      this.authStore.clearError()
      console.log('Test mode:', this.useTestMode ? 'Aktif' : 'Pasif')
    }
  },

  mounted() {
    // Eğer zaten login olmuşsa dashboard'a yönlendir
    if (this.authStore.isAuthenticated) {
      this.$router.push('/dashboard')
    }

    // Development için demo credentials
    if (this.isDevelopment) {
      this.credentials.email = 'demo@faturina.com'
      this.credentials.password = 'demo123'
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin-bottom: 8px;
  font-size: 28px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e1e1;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #666;
}

.checkbox-container input {
  width: auto;
  margin-right: 8px;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-button:hover:not(:disabled) {
  opacity: 0.9;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-top: 15px;
  padding: 10px;
  background: #ffeaea;
  border-radius: 4px;
  font-size: 14px;
}

.debug-info {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.debug-info h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #495057;
}

.debug-info p {
  margin: 5px 0;
  font-size: 12px;
  color: #6c757d;
}

.test-button {
  margin-top: 10px;
  padding: 6px 12px;
  background: #ffc107;
  color: #212529;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.test-button:hover {
  background: #e0a800;
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }
}
</style>