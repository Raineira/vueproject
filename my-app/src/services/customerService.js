// src/services/customerService.js
import api from '@/api'

export const customerService = {
  // Müşteri listesi getir
  async getCustomers(params = {}) {
    try {
      const response = await api.get('/api/v1/customer/list', { 
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || '',
          status: params.status || '',
          sort: params.sort || 'created_at',
          order: params.order || 'desc'
        }
      })
      
      // API response formatına göre ayarlayın
      return {
        data: response.data.data || response.data.customers || response.data,
        total: response.data.total || response.data.meta?.total || response.data.length,
        currentPage: response.data.current_page || params.page || 1,
        lastPage: response.data.last_page || Math.ceil((response.data.total || response.data.length) / (params.limit || 10))
      }
      
    } catch (error) {
      console.error('getCustomers API Error:', error)
      throw this.handleError(error)
    }
  },

  // Tek müşteri getir
  async getCustomer(id) {
    try {
      const response = await api.get(`/api/v1/customer/show`, {
        params: { id }
      })
      return response.data.data || response.data.customer || response.data
    } catch (error) {
      console.error('getCustomer API Error:', error)
      throw this.handleError(error)
    }
  },

  // Müşteri oluştur
  async createCustomer(customerData) {
    try {
      const payload = {
        name: customerData.name,
        company: customerData.company || null,
        email: customerData.email || null,
        phone: customerData.phone || null,
        address: customerData.address || null,
        status: customerData.status || 'active'
      }
      
      const response = await api.post('/api/v1/customer/insert', payload)
      return response.data.data || response.data.customer || response.data
    } catch (error) {
      console.error('createCustomer API Error:', error)
      throw this.handleError(error)
    }
  },

  // Müşteri güncelle
  async updateCustomer(id, customerData) {
    try {
      const payload = {
        id: id,
        name: customerData.name,
        company: customerData.company || null,
        email: customerData.email || null,
        phone: customerData.phone || null,
        address: customerData.address || null,
        status: customerData.status || 'active'
      }
      
      const response = await api.put('/api/v1/customer/update', payload)
      return response.data.data || response.data.customer || response.data
    } catch (error) {
      console.error('updateCustomer API Error:', error)
      throw this.handleError(error)
    }
  },

  // Müşteri sil
  async deleteCustomer(id) {
    try {
      const response = await api.delete('/api/v1/customer/delete', {
        data: { id } // DELETE request için data kullan
      })
      return response.data
    } catch (error) {
      console.error('deleteCustomer API Error:', error)
      throw this.handleError(error)
    }
  },

  // Hata yönetimi
  handleError(error) {
    let message = 'Bir hata oluştu'
    
    if (error.response) {
      // API'den gelen hata
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          message = data.message || 'Geçersiz istek'
          break
        case 401:
          message = 'Oturum süreniz dolmuş'
          break
        case 403:
          message = 'Bu işlem için yetkiniz yok'
          break
        case 404:
          message = 'Kaynak bulunamadı'
          break
        case 422:
          message = data.message || 'Doğrulama hatası'
          // Validation errors
          if (data.errors) {
            const validationErrors = Object.values(data.errors).flat()
            message = validationErrors.join(', ')
          }
          break
        case 500:
          message = 'Sunucu hatası'
          break
        default:
          message = data.message || `HTTP ${status} hatası`
      }
    } else if (error.request) {
      // Network hatası
      message = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.'
    } else {
      // Diğer hatalar
      message = error.message
    }
    
    return new Error(message)
  }
}

// Fake data (test için)
export const fakeCustomerService = {
  async getCustomers(params = {}) {
    // Test verisi
    const fakeData = [
      {
        id: 1,
        name: 'Ahmet Yılmaz',
        company: 'ABC Şirketi',
        email: 'ahmet@example.com',
        phone: '0555 123 4567',
        address: { city: 'İstanbul', district: 'Kadıköy' },
        status: 'active',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Ayşe Demir',
        company: 'XYZ Ltd.',
        email: 'ayse@example.com',
        phone: '0555 987 6543',
        address: { city: 'Ankara', district: 'Çankaya' },
        status: 'active',
        created_at: '2024-01-10T14:20:00Z'
      },
      {
        id: 3,
        name: 'Mehmet Kaya',
        company: 'Test A.Ş.',
        email: 'mehmet@example.com',
        phone: '0555 555 5555',
        address: { city: 'İzmir', district: 'Bornova' },
        status: 'inactive',
        created_at: '2024-01-05T09:15:00Z'
      }
    ]
    
    // Arama filtresi
    let filteredData = fakeData
    if (params.search) {
      filteredData = fakeData.filter(customer => 
        customer.name.toLowerCase().includes(params.search.toLowerCase()) ||
        customer.email.toLowerCase().includes(params.search.toLowerCase()) ||
        customer.company.toLowerCase().includes(params.search.toLowerCase())
      )
    }
    
    // Durum filtresi
    if (params.status) {
      filteredData = filteredData.filter(customer => customer.status === params.status)
    }
    
    // Pagination
    const limit = params.limit || 10
    const page = params.page || 1
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedData = filteredData.slice(start, end)
    
    // Fake delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return {
      data: paginatedData,
      total: filteredData.length,
      currentPage: page,
      lastPage: Math.ceil(filteredData.length / limit)
    }
  },
  
  async createCustomer(customerData) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { id: Date.now(), ...customerData, created_at: new Date().toISOString() }
  },
  
  async updateCustomer(id, customerData) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { id, ...customerData, updated_at: new Date().toISOString() }
  },
  
  async deleteCustomer(id) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true, message: 'Müşteri silindi' }
  }
}