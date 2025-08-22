// src/services/stockService.js
import api from '@/api'

export const stockService = {
  // Stok listesi getir
  async getStocks(params = {}) {
    try {
      const response = await api.get('/api/v1/stock/list', { 
        params: {
          page: params.page || 1,
          size: params.size || 10
        }
      })
      
      const stockData = response.data.data?.stockItem
      
      return {
        data: stockData?.stockItems || [],
        total: stockData?.viewCount || 0,
        currentPage: stockData?.page || 1,
        pageSize: stockData?.size || 10
      }
      
    } catch (error) {
      console.error('getStocks API Error:', error)
      throw this.handleError(error)
    }
  },

  // Tek stok detayı getir
  async getStock(stockId) {
    try {
      const response = await api.get(`/api/v1/stock/show/${stockId}`)
      return response.data.data?.stockItem || response.data.data
    } catch (error) {
      console.error('getStock API Error:', error)
      throw this.handleError(error)
    }
  },

  // Yeni stok oluştur
  async createStock(stockData) {
    try {
      const payload = {
        stockCode: stockData.stockCode,
        barcode: stockData.barcode,
        tax: parseInt(stockData.tax), // 0, 1, 10, 20
        typeId: parseInt(stockData.typeId),
        unitId: parseInt(stockData.unitId),
        stockName: stockData.stockName
      }
      
      const response = await api.post('/api/v1/stock/insert', payload)
      return response.data
    } catch (error) {
      console.error('createStock API Error:', error)
      throw this.handleError(error)
    }
  },

  // Stok güncelle
  async updateStock(stockId, stockData) {
    try {
      const payload = {
        tax: parseInt(stockData.tax),
        typeId: parseInt(stockData.typeId), 
        unitId: parseInt(stockData.unitId),
        stockName: stockData.stockName
      }
      
      const response = await api.put(`/api/v1/stock/update/${stockId}`, payload)
      return response.data
    } catch (error) {
      console.error('updateStock API Error:', error)
      throw this.handleError(error)
    }
  },

  // Stok sil
  async deleteStock(stockId) {
    try {
      const response = await api.delete(`/api/v1/stock/delete/${stockId}`)
      return response.data
    } catch (error) {
      console.error('deleteStock API Error:', error)
      throw this.handleError(error)
    }
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
          
          // Validation errors (stockCode ve barcode unique hatası vs)
          if (data.errors?.validationError) {
            const validationErrors = []
            const errors = data.errors.validationError
            
            if (errors.stock_code) {
              validationErrors.push('Stok kodu zaten kullanılıyor')
            }
            if (errors.barcode) {
              validationErrors.push('Barkod zaten kullanılıyor')
            }
            
            if (validationErrors.length > 0) {
              message = validationErrors.join(', ')
            }
          }
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

// Fake data service (test için)
export const fakeStockService = {
  async getStocks(params = {}) {
    const fakeData = [
      {
        stockId: 1,
        stockName: 'iPhone 14 Pro',
        stockCode: 'IPHONE14PRO',
        barcode: '1234567890123',
        unitName: 'ADET',
        stockTypeName: 'Hammadde',
        tax: 20,
        avgPurcPrice: 45999,
        isSales: 1,
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        stockId: 2,
        stockName: 'Samsung S23',
        stockCode: 'SAMS23',
        barcode: '9876543210987',
        unitName: 'ADET',
        stockTypeName: 'Mamul',
        tax: 20,
        avgPurcPrice: 35999,
        isSales: 1,
        createdAt: '2024-01-10T14:20:00Z'
      }
    ]
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return {
      data: fakeData,
      total: fakeData.length,
      currentPage: params.page || 1,
      pageSize: params.size || 10
    }
  },
  
  async createStock(stockData) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { 
      success: true, 
      data: { stockItem: { stockId: Date.now() } }, 
      messages: 'created' 
    }
  },
  
  async updateStock(stockId, stockData) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { 
      success: true, 
      data: { stockItem: { stockId } }, 
      messages: 'updated' 
    }
  },
  
  async deleteStock(stockId) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { 
      success: true, 
      data: { stockItem: { stockId } }, 
      messages: 'deleted' 
    }
  }
}