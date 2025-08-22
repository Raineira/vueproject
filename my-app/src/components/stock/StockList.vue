<template>
  <div class="stock-container">
    <!-- Breadcrumb Navigation -->
    <div class="breadcrumb">
      <router-link to="/dashboard" class="breadcrumb-link">Ana Sayfa</router-link>
      <span class="breadcrumb-separator">/</span>
      <router-link to="/dashboard/stok" class="breadcrumb-link">Stok</router-link>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">Liste</span>
    </div>

    <!-- Page Title -->
    <div class="page-title">
      <h1>Stok</h1>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <h3>Filtrele</h3>
      <div class="filter-row">
        <div class="filter-group">
          <label>Stok Adı</label>
          <input 
            v-model="filters.stockName" 
            type="text" 
            class="filter-input"
            @input="applyFilters"
          />
        </div>
        <div class="filter-group">
          <label>Stok Kod</label>
          <input 
            v-model="filters.stockCode" 
            type="text" 
            class="filter-input"
            @input="applyFilters"
          />
        </div>
        <div class="filter-group">
          <label>Barkod</label>
          <input 
            v-model="filters.barcode" 
            type="text" 
            class="filter-input"
            @input="applyFilters"
          />
        </div>
        <div class="filter-actions">
          <button @click="searchStocks" class="btn-search">Getir</button>
          <button @click="clearFilters" class="btn-clear">Temizle</button>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-section">
      <button @click="showAddModal = true" class="btn-action btn-add">
        <i class="fas fa-plus"></i> Yeni Ekle
      </button>
      <button @click="exportData" class="btn-action btn-export">
        <i class="fas fa-download"></i> İndir
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Stoklar yükleniyor...</p>
    </div>

    <!-- Error State -->
    <div v-if="error && !loading" class="error-state">
      <div class="alert alert-danger">
        {{ error }}
        <button @click="loadStocks" class="btn-retry">Tekrar Dene</button>
      </div>
    </div>

    <!-- Stock Table -->
    <div v-if="!loading && !error" class="table-section">
      <div class="table-header">
        <h3>Stoktaki Ürünler</h3>
        <div class="table-info">
          {{ filteredStocks.length }} kayıt gösteriliyor
        </div>
      </div>
      
      <div class="table-container">
        <table class="stock-table">
          <thead>
            <tr>
              <th>Stok Kod</th>
              <th>Ürün Stok Adı</th>
              <th>Barkod</th>
              <th>Açıklama</th>
              <th>Toplam Miktar</th>
              <th>Liste Fiyatı</th>
              <th>Satış Fiyatı</th>
              <th>KDV</th>
              <th>Oluşturulma</th>
              <th>Güncelleme</th>
              <th>Durum</th>
              <th>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stock in paginatedStocks" :key="stock.stockId">
              <td>
                <code class="stock-code">{{ stock.stockCode }}</code>
              </td>
              <td>
                <div class="stock-name">{{ stock.stockName }}</div>
              </td>
              <td>
                <span class="barcode">{{ stock.barcode }}</span>
              </td>
              <td>
                <span class="description">{{ stock.description || '-' }}</span>
              </td>
              <td class="amount-cell">
                <span class="amount">{{ stock.totalAmount || 0 }} {{ stock.unitName }}</span>
              </td>
              <td class="price-cell">
                <span class="price">{{ formatPrice(stock.listPrice || 0) }}</span>
              </td>
              <td class="price-cell">
                <span class="price">{{ formatPrice(stock.salePrice || 0) }}</span>
              </td>
              <td class="tax-cell">
                <span class="tax">{{ stock.tax }}%</span>
              </td>
              <td class="date-cell">
                <span class="date">{{ formatDate(stock.createdAt) }}</span>
              </td>
              <td class="date-cell">
                <span class="date">{{ formatDate(stock.updatedAt) }}</span>
              </td>
              <td>
                <span :class="getStatusClass(stock)" class="status-badge">
                  {{ getStatusText(stock) }}
                </span>
              </td>
              <td>
                <div class="action-dropdown">
                  <button @click="toggleActionMenu(stock.stockId)" class="action-btn">
                    Aksiyon <i class="fas fa-chevron-down"></i>
                  </button>
                  <div v-if="activeDropdown === stock.stockId" class="dropdown-menu" @click.stop>
                    <a @click="viewStock(stock)" href="#" class="dropdown-item">
                      <i class="fas fa-eye"></i> Görüntüle
                    </a>
                    <a @click="editStock(stock)" href="#" class="dropdown-item">
                      <i class="fas fa-edit"></i> Düzenle
                    </a>
                    <a @click="deleteStock(stock.stockId)" href="#" class="dropdown-item delete">
                      <i class="fas fa-trash"></i> Sil
                    </a>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredStocks.length === 0" class="empty-state">
        <i class="fas fa-box-open"></i>
        <h3>Stok bulunamadı</h3>
        <p>Arama kriterlerinize uygun stok bulunmamaktadır.</p>
        <button @click="clearFilters" class="btn-primary">Filtreleri Temizle</button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && !error && filteredStocks.length > 0" class="pagination-section">
      <div class="pagination-info">
        Toplam {{ totalStocks }} kayıttan {{ startRecord }}-{{ endRecord }} arası gösteriliyor
      </div>
      <div class="pagination-controls">
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <i class="fas fa-chevron-left"></i> Önceki
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          Sonraki <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Add Stock Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModals">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Yeni Stok Ekle</h3>
          <button @click="closeModals" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveStock">
            <div class="form-grid">
              <div class="form-group">
                <label>Stok Adı <span class="required">*</span></label>
                <input v-model="currentStock.stockName" type="text" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Stok Kodu <span class="required">*</span></label>
                <input v-model="currentStock.stockCode" type="text" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Barkod <span class="required">*</span></label>
                <input v-model="currentStock.barcode" type="text" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Vergi Oranı <span class="required">*</span></label>
                <select v-model="currentStock.tax" class="form-select" required>
                  <option value="">Seçiniz</option>
                  <option value="0">%0</option>
                  <option value="1">%1</option>
                  <option value="10">%10</option>
                  <option value="20">%20</option>
                </select>
              </div>
              <div class="form-group">
                <label>Stok Tipi <span class="required">*</span></label>
                <select v-model="currentStock.typeId" class="form-select" required>
                  <option value="">Seçiniz</option>
                  <option value="1">Hammadde</option>
                  <option value="2">Mamul</option>
                  <option value="3">Yan Ürün</option>
                </select>
              </div>
              <div class="form-group">
                <label>Birim <span class="required">*</span></label>
                <select v-model="currentStock.unitId" class="form-select" required>
                  <option value="">Seçiniz</option>
                  <option value="1">ADET</option>
                  <option value="2">LİTRE</option>
                  <option value="3">KG</option>
                </select>
              </div>
            </div>
            
            <div v-if="formError" class="form-error">
              {{ formError }}
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="closeModals" class="btn-secondary" :disabled="formLoading">
                İptal
              </button>
              <button type="submit" class="btn-primary" :disabled="formLoading">
                <span v-if="formLoading" class="btn-spinner"></span>
                {{ formLoading ? 'Kaydediliyor...' : 'Kaydet' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Stock Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Stok Düzenle</h3>
          <button @click="closeModals" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateStock">
            <div class="form-grid">
              <div class="form-group">
                <label>Stok Adı <span class="required">*</span></label>
                <input v-model="currentStock.stockName" type="text" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Vergi Oranı <span class="required">*</span></label>
                <select v-model="currentStock.tax" class="form-select" required>
                  <option value="0">%0</option>
                  <option value="1">%1</option>
                  <option value="10">%10</option>
                  <option value="20">%20</option>
                </select>
              </div>
              <div class="form-group">
                <label>Stok Tipi <span class="required">*</span></label>
                <select v-model="currentStock.typeId" class="form-select" required>
                  <option value="1">Hammadde</option>
                  <option value="2">Mamul</option>
                  <option value="3">Yan Ürün</option>
                </select>
              </div>
              <div class="form-group">
                <label>Birim <span class="required">*</span></label>
                <select v-model="currentStock.unitId" class="form-select" required>
                  <option value="1">ADET</option>
                  <option value="2">LİTRE</option>
                  <option value="3">KG</option>
                </select>
              </div>
            </div>
            
            <div v-if="formError" class="form-error">
              {{ formError }}
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="closeModals" class="btn-secondary" :disabled="formLoading">
                İptal
              </button>
              <button type="submit" class="btn-primary" :disabled="formLoading">
                <span v-if="formLoading" class="btn-spinner"></span>
                {{ formLoading ? 'Güncelleniyor...' : 'Güncelle' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
// import { stockService } from '@/services/stockService'

export default {
  name: 'StockList',
  setup() {
    // Reactive data
    const stocks = ref([])
    const loading = ref(false)
    const error = ref(null)
    const formLoading = ref(false)
    const formError = ref(null)
    const activeDropdown = ref(null)
    
    // Pagination
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const totalStocks = ref(0)
    
    // Filters
    const filters = ref({
      stockName: '',
      stockCode: '',
      barcode: ''
    })
    
    // Modals
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const currentStock = ref({
      stockName: '',
      stockCode: '',
      barcode: '',
      tax: '',
      typeId: '',
      unitId: ''
    })

    // Computed properties
    const filteredStocks = computed(() => {
      let filtered = stocks.value

      // Apply filters
      if (filters.value.stockName) {
        filtered = filtered.filter(stock => 
          stock.stockName.toLowerCase().includes(filters.value.stockName.toLowerCase())
        )
      }
      
      if (filters.value.stockCode) {
        filtered = filtered.filter(stock => 
          stock.stockCode.toLowerCase().includes(filters.value.stockCode.toLowerCase())
        )
      }
      
      if (filters.value.barcode) {
        filtered = filtered.filter(stock => 
          stock.barcode.includes(filters.value.barcode)
        )
      }

      totalStocks.value = filtered.length
      return filtered
    })

    const totalPages = computed(() => Math.ceil(totalStocks.value / itemsPerPage.value))
    
    const paginatedStocks = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredStocks.value.slice(start, end)
    })

    const startRecord = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1)
    const endRecord = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalStocks.value))

    // Methods
    const loadStocks = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Mock data for testing
        stocks.value = [
          {
            stockId: 1,
            stockName: 'Test Stok 1',
            stockCode: 'TST001',
            barcode: '1234567890',
            unitName: 'ADET',
            tax: 20,
            avgPurcPrice: 100,
            isSales: 1,
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
            description: 'Test açıklama',
            totalAmount: 50,
            listPrice: 120,
            salePrice: 110
          }
        ]
        
      } catch (err) {
        error.value = err.message
        stocks.value = []
      } finally {
        loading.value = false
      }
    }

    const searchStocks = () => {
      currentPage.value = 1
    }

    const clearFilters = () => {
      filters.value = {
        stockName: '',
        stockCode: '',
        barcode: ''
      }
      currentPage.value = 1
    }

    const applyFilters = () => {
      currentPage.value = 1
    }

    const exportData = () => {
      alert('Export functionality will be implemented')
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price) + ' TL'
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    const getStatusClass = (stock) => {
      if (stock.isSales) return 'status-active'
      return 'status-inactive'
    }

    const getStatusText = (stock) => {
      return stock.isSales ? 'Satışta' : 'Satışta Değil'
    }

    const toggleActionMenu = (stockId) => {
      activeDropdown.value = activeDropdown.value === stockId ? null : stockId
    }

    const viewStock = (stock) => {
      alert(`Stok Detayları:\nAd: ${stock.stockName}\nKod: ${stock.stockCode}\nBarkod: ${stock.barcode}`)
      activeDropdown.value = null
    }

    const editStock = (stock) => {
      currentStock.value = {
        stockId: stock.stockId,
        stockName: stock.stockName,
        tax: stock.tax.toString(),
        typeId: stock.typeId ? stock.typeId.toString() : '1',
        unitId: stock.unitId ? stock.unitId.toString() : '1'
      }
      showEditModal.value = true
      activeDropdown.value = null
    }

    const deleteStock = async (stockId) => {
      if (!confirm('Bu stoğu silmek istediğinizden emin misiniz?')) return
      
      try {
        // Mock delete
        stocks.value = stocks.value.filter(s => s.stockId !== stockId)
        activeDropdown.value = null
      } catch (err) {
        alert(`Silme hatası: ${err.message}`)
      }
    }

    const saveStock = async () => {
      formLoading.value = true
      formError.value = null
      
      try {
        // Mock save
        const newStock = {
          stockId: Date.now(),
          ...currentStock.value,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          unitName: 'ADET',
          isSales: 1
        }
        stocks.value.push(newStock)
        closeModals()
      } catch (err) {
        formError.value = err.message
      } finally {
        formLoading.value = false
      }
    }

    const updateStock = async () => {
      formLoading.value = true
      formError.value = null
      
      try {
        // Mock update
        const index = stocks.value.findIndex(s => s.stockId === currentStock.value.stockId)
        if (index !== -1) {
          stocks.value[index] = { ...stocks.value[index], ...currentStock.value }
        }
        closeModals()
      } catch (err) {
        formError.value = err.message
      } finally {
        formLoading.value = false
      }
    }

    const closeModals = () => {
      showAddModal.value = false
      showEditModal.value = false
      formError.value = null
      currentStock.value = {
        stockName: '',
        stockCode: '',
        barcode: '',
        tax: '',
        typeId: '',
        unitId: ''
      }
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-dropdown')) {
        activeDropdown.value = null
      }
    }

    onMounted(() => {
      loadStocks()
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      stocks,
      loading,
      error,
      formLoading,
      formError,
      activeDropdown,
      currentPage,
      itemsPerPage,
      totalStocks,
      totalPages,
      filters,
      showAddModal,
      showEditModal,
      currentStock,
      filteredStocks,
      paginatedStocks,
      startRecord,
      endRecord,
      loadStocks,
      searchStocks,
      clearFilters,
      applyFilters,
      exportData,
      formatPrice,
      formatDate,
      getStatusClass,
      getStatusText,
      toggleActionMenu,
      viewStock,
      editStock,
      deleteStock,
      saveStock,
      updateStock,
      closeModals,
      goToPage
    }
  }
}
</script>

<style scoped>
.stock-container {
  padding: 16px 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.breadcrumb-link {
  color: #3b82f6;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #9ca3af;
}

.breadcrumb-current {
  color: #6b7280;
}

.page-title {
  margin-bottom: 20px;
}

.page-title h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.filter-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.btn-search {
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-search:hover {
  background: #b91c1c;
}

.btn-clear {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-clear:hover {
  background: #d97706;
}

.action-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add {
  background: #10b981;
  color: white;
}

.btn-add:hover {
  background: #059669;
}

.btn-export {
  background: #6b7280;
  color: white;
}

.btn-export:hover {
  background: #4b5563;
}

.loading-state, .error-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-left: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.alert-danger {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.btn-retry {
  margin-left: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.table-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.table-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.table-info {
  font-size: 13px;
  color: #6b7280;
}

.table-container {
  overflow-x: auto;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.stock-table th {
  background: #f9fafb;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.stock-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.stock-table tbody tr:hover {
  background: #f9fafb;
}

.stock-code {
  background: #f3f4f6;
  padding: 4px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #4b5563;
}

.stock-name {
  font-weight: 500;
  color: #1f2937;
  max-width: 200px;
  word-wrap: break-word;
}

.barcode {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #6b7280;
}

.description {
  color: #6b7280;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-cell, .price-cell, .tax-cell {
  text-align: right;
}

.amount {
  font-weight: 500;
  color: #059669;
}

.price {
  font-weight: 500;
  color: #059669;
}

.tax {
  font-weight: 500;
  color: #d97706;
}

.date-cell {
  font-size: 11px;
  color: #6b7280;
  min-width: 110px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  min-width: 60px;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.action-dropdown {
  position: relative;
}

.action-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover {
  background: #e5e7eb;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 120px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  text-decoration: none;
  color: #374151;
  font-size: 12px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f9fafb;
}

.dropdown-item.delete {
  color: #dc2626;
}

.dropdown-item.delete:hover {
  background: #fef2f2;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-state i {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #374151;
  margin-bottom: 8px;
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pagination-info {
  font-size: 13px;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-btn {
  background: white;
  border: 1px solid #d1d5db;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
}

.modal-close:hover {
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.required {
  color: #dc2626;
}

.form-input, .form-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-error {
  background: #fef2f2;
  color: #991b1b;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 16px;
  border: 1px solid #fecaca;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-primary, .btn-secondary {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-primary:disabled, .btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-left: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@media (max-width: 1024px) {
  .stock-table {
    font-size: 12px;
  }
  
  .stock-table th,
  .stock-table td {
    padding: 8px 6px;
  }
}

@media (max-width: 768px) {
  .stock-container {
    padding: 12px 16px;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .filter-actions {
    justify-content: center;
  }
  
  .action-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-container {
    margin: 20px;
    width: calc(100% - 40px);
  }
}

@media (max-width: 640px) {
  .table-container {
    font-size: 11px;
  }
  
  .stock-table th,
  .stock-table td {
    padding: 6px 4px;
  }
  
  .stock-name {
    max-width: 120px;
  }
  
  .description {
    max-width: 100px;
  }
}
</style>