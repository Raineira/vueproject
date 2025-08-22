<!-- src/components/customers/CustomerList.vue -->
<template>
  <div class="customer-list-container">
    <!-- Header -->
    <div class="page-header">
      <h1>Müşteri Listesi</h1>
      <button @click="showAddModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i> Yeni Müşteri Ekle
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Müşteri ara..." 
          class="form-control"
          @keyup.enter="searchCustomers"
        />
        <button @click="searchCustomers" class="btn btn-search">
          <i class="fas fa-search"></i>
        </button>
      </div>
      <div class="filter-controls">
        <select v-model="selectedStatus" @change="filterCustomers" class="form-select">
          <option value="">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
        </select>
        <button @click="resetFilters" class="btn btn-secondary">
          <i class="fas fa-refresh"></i> Sıfırla
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Müşteriler yükleniyor...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Hata Oluştu</h3>
        <p>{{ error }}</p>
        <button @click="fetchCustomers" class="btn btn-primary">Tekrar Dene</button>
      </div>
    </div>

    <!-- Customer Table -->
    <div v-else class="table-container">
      <table class="customers-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ad Soyad</th>
            <th>E-posta</th>
            <th>Telefon</th>
            <th>Adres</th>
            <th>Durum</th>
            <th>Kayıt Tarihi</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.id">
            <td>#{{ customer.id }}</td>
            <td>
              <div class="customer-info">
                <div class="customer-avatar">
                  <i class="fas fa-user"></i>
                </div>
                <div>
                  <strong>{{ customer.name || 'İsimsiz' }}</strong>
                  <br>
                  <small>{{ customer.company || 'Şirket belirtilmemiş' }}</small>
                </div>
              </div>
            </td>
            <td>{{ customer.email || '-' }}</td>
            <td>{{ customer.phone || '-' }}</td>
            <td>
              <div class="address-info">
                {{ getAddressDisplay(customer.address) }}
              </div>
            </td>
            <td>
              <span :class="getStatusClass(customer.status)" class="status-badge">
                {{ getStatusText(customer.status) }}
              </span>
            </td>
            <td>{{ formatDate(customer.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <button @click="viewCustomer(customer)" class="btn btn-view" title="Görüntüle">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click="editCustomer(customer)" class="btn btn-edit" title="Düzenle">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteCustomer(customer)" class="btn btn-delete" title="Sil">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="customers.length === 0" class="empty-state">
        <i class="fas fa-users"></i>
        <h3>Müşteri Bulunamadı</h3>
        <p>Henüz müşteri kaydı bulunmuyor veya arama kriterlerinize uygun müşteri yok.</p>
        <button @click="showAddModal = true" class="btn btn-primary">
          İlk Müşteriyi Ekle
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="customers.length > 0" class="pagination-container">
      <div class="pagination-info">
        {{ paginationInfo }}
      </div>
      <div class="pagination">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1" 
          class="btn btn-pagination"
        >
          Önceki
        </button>
        <span class="page-numbers">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages" 
          class="btn btn-pagination"
        >
          Sonraki
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddModal ? 'Yeni Müşteri Ekle' : 'Müşteri Düzenle' }}</h3>
          <button @click="closeModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCustomer">
            <div class="form-row">
              <div class="form-group">
                <label>Ad Soyad *</label>
                <input v-model="currentCustomer.name" type="text" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Şirket</label>
                <input v-model="currentCustomer.company" type="text" class="form-control">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>E-posta</label>
                <input v-model="currentCustomer.email" type="email" class="form-control">
              </div>
              <div class="form-group">
                <label>Telefon</label>
                <input v-model="currentCustomer.phone" type="tel" class="form-control">
              </div>
            </div>
            <div class="form-group">
              <label>Adres</label>
              <textarea v-model="currentCustomer.address" class="form-control" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Durum</label>
              <select v-model="currentCustomer.status" class="form-control">
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">İptal</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="loading-spinner small"></span>
                {{ saving ? 'Kaydediliyor...' : (showAddModal ? 'Ekle' : 'Güncelle') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="toast toast-success">
      <i class="fas fa-check-circle"></i>
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
// Gerçek API için:
import { customerService } from '@/services/customerService'

// Test için fake data kullanın (gerektiğinde uncomment edin):
// import { fakeCustomerService as customerService } from '@/services/customerService'

export default {
  name: 'CustomerList',
  
  data() {
    return {
      customers: [],
      loading: false,
      error: null,
      saving: false,
      successMessage: '',
      
      // Filtering & Search
      searchQuery: '',
      selectedStatus: '',
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      
      // Modals
      showAddModal: false,
      showEditModal: false,
      currentCustomer: this.getEmptyCustomer()
    }
  },
  
  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage)
    },
    
    paginationInfo() {
      const start = (this.currentPage - 1) * this.itemsPerPage + 1
      const end = Math.min(start + this.itemsPerPage - 1, this.totalItems)
      return `${start}-${end} / ${this.totalItems} müşteri gösteriliyor`
    }
  },
  
  mounted() {
    this.fetchCustomers()
  },
  
  methods: {
    async fetchCustomers() {
      this.loading = true
      this.error = null
      
      try {
        const params = {
          page: this.currentPage,
          limit: this.itemsPerPage,
          search: this.searchQuery,
          status: this.selectedStatus
        }
        
        console.log('Fetching customers with params:', params)
        const response = await customerService.getCustomers(params)
        
        this.customers = response.data || []
        this.totalItems = response.total || 0
        
        console.log('Customers loaded:', this.customers.length)
        
      } catch (error) {
        this.error = error.message || 'Müşteriler yüklenirken hata oluştu'
        console.error('Customer fetch error:', error)
        
        // Eğer 401 hatası alırsanız token kontrolü yapın
        if (error.response?.status === 401) {
          this.error = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.'
        }
      } finally {
        this.loading = false
      }
    },
    
    async saveCustomer() {
      this.saving = true
      this.error = null
      
      try {
        if (this.showAddModal) {
          await customerService.createCustomer(this.currentCustomer)
          this.showSuccessMessage('Müşteri başarıyla eklendi')
        } else {
          await customerService.updateCustomer(this.currentCustomer.id, this.currentCustomer)
          this.showSuccessMessage('Müşteri başarıyla güncellendi')
        }
        
        this.closeModal()
        this.fetchCustomers()
        
      } catch (error) {
        this.error = error.message || 'Müşteri kaydedilirken hata oluştu'
        console.error('Save customer error:', error)
      } finally {
        this.saving = false
      }
    },
    
    async deleteCustomer(customer) {
      if (!confirm(`${customer.name} adlı müşteriyi silmek istediğinizden emin misiniz?`)) {
        return
      }
      
      try {
        await customerService.deleteCustomer(customer.id)
        this.showSuccessMessage('Müşteri başarıyla silindi')
        this.fetchCustomers()
      } catch (error) {
        this.error = error.message || 'Müşteri silinirken hata oluştu'
        console.error('Delete customer error:', error)
      }
    },
    
    searchCustomers() {
      this.currentPage = 1
      this.fetchCustomers()
    },
    
    filterCustomers() {
      this.currentPage = 1
      this.fetchCustomers()
    },
    
    resetFilters() {
      this.searchQuery = ''
      this.selectedStatus = ''
      this.currentPage = 1
      this.fetchCustomers()
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.fetchCustomers()
      }
    },
    
    viewCustomer(customer) {
      this.$router.push(`/dashboard/musteriler/${customer.id}`)
    },
    
    editCustomer(customer) {
      this.currentCustomer = { ...customer }
      this.showEditModal = true
    },
    
    closeModal() {
      this.showAddModal = false
      this.showEditModal = false
      this.currentCustomer = this.getEmptyCustomer()
      this.error = null
    },
    
    getEmptyCustomer() {
      return {
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        status: 'active'
      }
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'active': return 'status-active'
        case 'inactive': return 'status-inactive'
        default: return 'status-unknown'
      }
    },
    
    getStatusText(status) {
      switch (status) {
        case 'active': return 'Aktif'
        case 'inactive': return 'Pasif'
        default: return 'Bilinmiyor'
      }
    },
    
    getAddressDisplay(address) {
      if (!address) return '-'
      
      // Eğer address bir string ise direkt döndür
      if (typeof address === 'string') return address
      
      // Eğer address bir object ise (city, district gibi)
      if (typeof address === 'object') {
        const parts = []
        if (address.city) parts.push(address.city)
        if (address.district) parts.push(address.district)
        return parts.length > 0 ? parts.join(', ') : '-'
      }
      
      return '-'
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      
      try {
        return new Date(dateString).toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } catch (error) {
        return '-'
      }
    },
    
    showSuccessMessage(message) {
      this.successMessage = message
      setTimeout(() => {
        this.successMessage = ''
      }, 3000)
    }
  }
}
</script>

<style scoped>
.customer-list-container {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  color: #1e293b;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}

.search-box {
  display: flex;
  gap: 8px;
  flex: 1;
  max-width: 400px;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-left: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin: 0 8px 0 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  justify-content: center;
  padding: 48px;
}

.error-message {
  text-align: center;
  max-width: 400px;
}

.error-message i {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 16px;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.customers-table {
  width: 100%;
  border-collapse: collapse;
}

.customers-table th {
  background: #f8fafc;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.customers-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.customers-table tbody tr:hover {
  background: #f9fafb;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-avatar {
  width: 40px;
  height: 40px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.address-info {
  max-width: 150px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.status-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-search {
  background: #059669;
  color: white;
  padding: 8px 12px;
}

.btn-search:hover {
  background: #047857;
}

.btn-view {
  background: #6b7280;
  color: white;
  padding: 6px 10px;
}

.btn-edit {
  background: #f59e0b;
  color: white;
  padding: 6px 10px;
}

.btn-delete {
  background: #ef4444;
  color: white;
  padding: 6px 10px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: #6b7280;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-pagination {
  background: white;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
}

.btn-pagination:hover:not(:disabled) {
  background: #f3f4f6;
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

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1050;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.toast-success {
  background: #10b981;
  color: white;
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .customers-table {
    font-size: 14px;
  }
  
  .customers-table th,
  .customers-table td {
    padding: 8px;
  }
}
</style>