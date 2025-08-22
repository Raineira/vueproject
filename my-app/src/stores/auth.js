// src/stores/auth.js - Mevcut dosyanızın içeriğini silerek bunu yapıştırın
import { defineStore } from 'pinia'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => state.user?.name || '',
    userEmail: (state) => state.user?.email || ''
  },

  actions: {
    initializeAuth() {
      const token = localStorage.getItem('access_token')
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      
      if (token) {
        this.token = token
        this.user = user
      }
    },

    async login(credentials) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await authService.login(credentials)
        this.token = response.access_token
        this.user = response.user
        return { success: true, data: response }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async logout(callAPI = true) {
      if (callAPI) {
        try {
          await authService.logout()
        } catch (error) {
          console.error('Logout error:', error)
        }
      }
      
      this.user = null
      this.token = null
      this.error = null
      this.isLoading = false
    },

    clearError() {
      this.error = null
    },

    async fetchUser() {
      if (!this.token) return

      try {
        const user = authService.getCurrentUser()
        this.user = user
        return user
      } catch (error) {
        console.error('Fetch user error:', error)
        if (error.message.includes('401')) {
          await this.logout(false)
        }
        throw error
      }
    }
  }
})