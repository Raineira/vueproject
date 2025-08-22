<template>
  <div id="app">
    <!-- Boot/Hydrate -->
    <div v-if="booting" class="loading-screen">
      <div class="loading-spinner"></div>
      <p>Yükleniyor...</p>
    </div>

    <!-- Router-based yapı -->
    <div v-else class="app-wrapper">
      <!-- Ana layout router-view ile kontrol edilecek -->
      <router-view />
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useAuthStore } from './stores/auth'

export default {
  name: 'App',
  
  data() {
    return {
      booting: true,
    }
  },

  computed: {
    // Pinia store'u Options API ile bağla
    ...mapStores(useAuthStore),

    // UI'nın takip edeceği durumlar
    isAuthenticated() {
      return this.authStore.isAuthenticated
    },
    currentUser() {
      return this.authStore.user
    },
  },

  async mounted() {
    // Sayfa yenilendiğinde token varsa kullanıcıyı çek
    if (this.authStore.isAuthenticated) {
      try { 
        await this.authStore.fetchMe() 
      } catch (error) {
        console.error('User fetch failed:', error)
        // Token geçersizse logout yap
        this.authStore.logout(false)
      }
    }
    
    this.booting = false
    
    // İlk yüklemede authentication kontrolü
    this.checkAuthAndRedirect()
  },

  methods: {
    // Authentication durumuna göre yönlendirme
    checkAuthAndRedirect() {
      const currentRoute = this.$route.name
      const isAuthRoute = ['login', 'register'].includes(currentRoute)
      
      if (!this.isAuthenticated && !isAuthRoute) {
        // Giriş yapmamış ve auth sayfasında değilse login'e yönlendir
        this.$router.push({ name: 'login', query: { redirect: this.$route.fullPath } })
      } else if (this.isAuthenticated && isAuthRoute) {
        // Giriş yapmış ve auth sayfasındaysa dashboard'a yönlendir
        this.$router.push({ name: 'dashboard' })
      }
    },
  },

  // Route değişimlerini izle
  watch: {
    '$route'(to, from) {
      // Route değiştiğinde auth kontrolü yap
      this.checkAuthAndRedirect()
    },
    
    // Authentication durumu değiştiğinde yönlendirme yap
    isAuthenticated(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.checkAuthAndRedirect()
      }
    }
  }
}
</script>

<style>
/* Global Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  height: 100vh;
  background: #f8fafc;
  color: #1a202c;
  line-height: 1.6;
}

/* Loading Screen */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-left: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-screen p {
  font-size: 16px;
  font-weight: 500;
}

/* App Wrapper */
.app-wrapper {
  height: 100vh;
  overflow: hidden;
}

/* Global Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

p {
  margin-bottom: 1rem;
  color: #4a5568;
}

/* Global Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3182ce;
  color: white;
  border-color: #3182ce;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2c5282;
  border-color: #2c5282;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #4a5568;
  border-color: #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #cbd5e0;
  border-color: #cbd5e0;
}

.btn-success {
  background-color: #38a169;
  color: white;
  border-color: #38a169;
}

.btn-success:hover:not(:disabled) {
  background-color: #2f855a;
  border-color: #2f855a;
}

.btn-danger {
  background-color: #e53e3e;
  color: white;
  border-color: #e53e3e;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c53030;
  border-color: #c53030;
}

.btn-warning {
  background-color: #d69e2e;
  color: white;
  border-color: #d69e2e;
}

.btn-warning:hover:not(:disabled) {
  background-color: #b7791f;
  border-color: #b7791f;
}

/* Global Form Styles */
.form-control {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #2d3748;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.form-control:disabled {
  background-color: #f7fafc;
  opacity: 0.6;
  cursor: not-allowed;
}

.form-select {
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-group .error {
  color: #e53e3e;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Global Card Styles */
.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

/* Global Alert Styles */
.alert {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
}

.alert-success {
  color: #065f46;
  background-color: #d1fae5;
  border-color: #a7f3d0;
}

.alert-danger {
  color: #991b1b;
  background-color: #fee2e2;
  border-color: #fecaca;
}

.alert-warning {
  color: #92400e;
  background-color: #fef3c7;
  border-color: #fde68a;
}

.alert-info {
  color: #1e40af;
  background-color: #dbeafe;
  border-color: #bfdbfe;
}

/* Global Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.d-flex { display: flex; }
.d-block { display: block; }
.d-inline { display: inline; }
.d-inline-block { display: inline-block; }
.d-none { display: none; }

.justify-content-center { justify-content: center; }
.justify-content-between { justify-content: space-between; }
.justify-content-end { justify-content: flex-end; }

.align-items-center { align-items: center; }
.align-items-start { align-items: flex-start; }
.align-items-end { align-items: flex-end; }

.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-5 { gap: 1.25rem; }

.m-0 { margin: 0; }
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-3 { margin: 0.75rem; }
.m-4 { margin: 1rem; }
.m-5 { margin: 1.25rem; }

.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-5 { padding: 1.25rem; }

.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }
.mt-5 { margin-top: 1.25rem; }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-5 { margin-bottom: 1.25rem; }

.pt-0 { padding-top: 0; }
.pt-1 { padding-top: 0.25rem; }
.pt-2 { padding-top: 0.5rem; }
.pt-3 { padding-top: 0.75rem; }
.pt-4 { padding-top: 1rem; }
.pt-5 { padding-top: 1.25rem; }

.pb-0 { padding-bottom: 0; }
.pb-1 { padding-bottom: 0.25rem; }
.pb-2 { padding-bottom: 0.5rem; }
.pb-3 { padding-bottom: 0.75rem; }
.pb-4 { padding-bottom: 1rem; }
.pb-5 { padding-bottom: 1.25rem; }

/* Responsive Utilities */
@media (max-width: 768px) {
  .d-md-none { display: none !important; }
  .d-md-block { display: block !important; }
  .d-md-flex { display: flex !important; }
}

@media (max-width: 640px) {
  .d-sm-none { display: none !important; }
  .d-sm-block { display: block !important; }
  .d-sm-flex { display: flex !important; }
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Focus outline for accessibility */
:focus-visible {
  outline: 2px solid #3182ce;
  outline-offset: 2px;
}
</style>