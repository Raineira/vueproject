<template>
  <div class="product-list-container">
    <!-- Sayfa Başlığı -->
    <div class="page-header">
      <h1>Ürün Listesi</h1>
      <button @click="showAddModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i> Yeni Ürün Ekle
      </button>
    </div>

    <!-- Filtreleme ve Arama -->
    <div class="filters-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Ürün ara..." 
          class="form-control"
        />
      </div>
      <div class="filter-controls">
        <select v-model="selectedCategory" class="form-select">
          <option value="">Tüm Kategoriler</option>
          <option value="elektronik">Elektronik</option>
          <option value="giyim">Giyim</option>
          <option value="kitap">Kitap</option>
          <option value="ev-bahce">Ev & Bahçe</option>
        </select>
        <select v-model="sortBy" class="form-select">
          <option value="name">İsme Göre</option>
          <option value="price">Fiyata Göre</option>
          <option value="stock">Stoka Göre</option>
          <option value="date">Tarihe Göre</option>
        </select>
      </div>
    </div>

    <!-- Ürün Tablosu -->
    <div class="table-container">
      <table class="products-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ürün Adı</th>
            <th>Kategori</th>
            <th>Fiyat</th>
            <th>Stok</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td>#{{ product.id }}</td>
            <td>
              <div class="product-info">
                <img :src="product.image" :alt="product.name" class="product-image">
                <span>{{ product.name }}</span>
              </div>
            </td>
            <td>
              <span class="category-badge">{{ product.category }}</span>
            </td>
            <td class="price">₺{{ formatPrice(product.price) }}</td>
            <td>
              <span :class="getStockClass(product.stock)">{{ product.stock }}</span>
            </td>
            <td>
              <span :class="getStatusClass(product.status)" class="status-badge">
                {{ product.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="editProduct(product)" class="btn btn-edit" title="Düzenle">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteProduct(product.id)" class="btn btn-delete" title="Sil">
                  <i class="fas fa-trash"></i>
                </button>
                <button @click="viewProduct(product)" class="btn btn-view" title="Görüntüle">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sayfalama -->
    <div class="pagination-container">
      <div class="pagination-info">
        Toplam {{ totalProducts }} ürün gösteriliyor
      </div>
      <div class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1" class="btn btn-pagination">
          Önceki
        </button>
        <span class="page-numbers">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="btn btn-pagination">
          Sonraki
        </button>
      </div>
    </div>

    <!-- Ürün Ekleme/Düzenleme Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddModal ? 'Yeni Ürün Ekle' : 'Ürün Düzenle' }}</h3>
          <button @click="closeModals" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProduct">
            <div class="form-group">
              <label>Ürün Adı</label>
              <input v-model="currentProduct.name" type="text" class="form-control" required>
            </div>
            <div class="form-group">
              <label>Kategori</label>
              <select v-model="currentProduct.category" class="form-select" required>
                <option value="">Kategori Seçin</option>
                <option value="elektronik">Elektronik</option>
                <option value="giyim">Giyim</option>
                <option value="kitap">Kitap</option>
                <option value="ev-bahce">Ev & Bahçe</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Fiyat (₺)</label>
                <input v-model.number="currentProduct.price" type="number" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Stok</label>
                <input v-model.number="currentProduct.stock" type="number" class="form-control" required>
              </div>
            </div>
            <div class="form-group">
              <label>Açıklama</label>
              <textarea v-model="currentProduct.description" class="form-control" rows="3"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeModals" class="btn btn-secondary">İptal</button>
              <button type="submit" class="btn btn-primary">
                {{ showAddModal ? 'Ürün Ekle' : 'Güncelle' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'ProductList',
  setup() {
    // Reactive data
    const products = ref([
      {
        id: 1,
        name: 'iPhone 14 Pro',
        category: 'elektronik',
        price: 45999,
        stock: 25,
        status: 'Aktif',
        image: 'https://via.placeholder.com/40',
        description: 'Apple iPhone 14 Pro 256GB'
      },
      {
        id: 2,
        name: 'Samsung Galaxy S23',
        category: 'elektronik',
        price: 35999,
        stock: 12,
        status: 'Aktif',
        image: 'https://via.placeholder.com/40',
        description: 'Samsung Galaxy S23 128GB'
      },
      {
        id: 3,
        name: 'Nike Air Max',
        category: 'giyim',
        price: 2599,
        stock: 0,
        status: 'Stokta Yok',
        image: 'https://via.placeholder.com/40',
        description: 'Nike Air Max 270 Spor Ayakkabı'
      },
      {
        id: 4,
        name: 'MacBook Pro M2',
        category: 'elektronik',
        price: 67999,
        stock: 8,
        status: 'Aktif',
        image: 'https://via.placeholder.com/40',
        description: 'MacBook Pro 13" M2 Chip'
      },
      {
        id: 5,
        name: 'Adidas Originals',
        category: 'giyim',
        price: 1899,
        stock: 35,
        status: 'Aktif',
        image: 'https://via.placeholder.com/40',
        description: 'Adidas Originals Hoodie'
      }
    ])

    const searchQuery = ref('')
    const selectedCategory = ref('')
    const sortBy = ref('name')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    
    // Modal states
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const currentProduct = ref({
      name: '',
      category: '',
      price: 0,
      stock: 0,
      description: '',
      status: 'Aktif'
    })

    // Computed properties
    const filteredProducts = computed(() => {
      let filtered = products.value

      // Arama filtresi
      if (searchQuery.value) {
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      // Kategori filtresi
      if (selectedCategory.value) {
        filtered = filtered.filter(product => 
          product.category === selectedCategory.value
        )
      }

      // Sıralama
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'price':
            return a.price - b.price
          case 'stock':
            return b.stock - a.stock
          case 'name':
          default:
            return a.name.localeCompare(b.name)
        }
      })

      return filtered
    })

    const totalProducts = computed(() => filteredProducts.value.length)
    const totalPages = computed(() => Math.ceil(totalProducts.value / itemsPerPage.value))

    // Methods
    const formatPrice = (price) => {
      return new Intl.NumberFormat('tr-TR').format(price)
    }

    const getStockClass = (stock) => {
      if (stock === 0) return 'stock-empty'
      if (stock < 10) return 'stock-low'
      return 'stock-good'
    }

    const getStatusClass = (status) => {
      switch (status) {
        case 'Aktif': return 'status-active'
        case 'Stokta Yok': return 'status-out-of-stock'
        case 'Pasif': return 'status-inactive'
        default: return 'status-active'
      }
    }

    const editProduct = (product) => {
      currentProduct.value = { ...product }
      showEditModal.value = true
    }

    const deleteProduct = (productId) => {
      if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        products.value = products.value.filter(p => p.id !== productId)
      }
    }

    const viewProduct = (product) => {
      alert(`Ürün Detayları:\n${product.name}\nFiyat: ₺${formatPrice(product.price)}\nStok: ${product.stock}`)
    }

    const saveProduct = () => {
      if (showAddModal.value) {
        // Yeni ürün ekle
        const newId = Math.max(...products.value.map(p => p.id)) + 1
        products.value.push({
          ...currentProduct.value,
          id: newId,
          image: 'https://via.placeholder.com/40'
        })
      } else {
        // Mevcut ürünü güncelle
        const index = products.value.findIndex(p => p.id === currentProduct.value.id)
        if (index !== -1) {
          products.value[index] = { ...currentProduct.value }
        }
      }
      closeModals()
    }

    const closeModals = () => {
      showAddModal.value = false
      showEditModal.value = false
      currentProduct.value = {
        name: '',
        category: '',
        price: 0,
        stock: 0,
        description: '',
        status: 'Aktif'
      }
    }

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    onMounted(() => {
      console.log('ProductList component mounted')
    })

    return {
      products,
      searchQuery,
      selectedCategory,
      sortBy,
      currentPage,
      showAddModal,
      showEditModal,
      currentProduct,
      filteredProducts,
      totalProducts,
      totalPages,
      formatPrice,
      getStockClass,
      getStatusClass,
      editProduct,
      deleteProduct,
      viewProduct,
      saveProduct,
      closeModals,
      previousPage,
      nextPage
    }
  }
}
</script>

<style scoped>
.product-list-container {
  padding: 24px;
  background-color: #f8fafc;
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
  flex: 1;
  max-width: 400px;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.form-control, .form-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
}

.form-control:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th {
  background-color: #f8fafc;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.products-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.products-table tbody tr:hover {
  background-color: #f9fafb;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.category-badge {
  background-color: #e0e7ff;
  color: #3730a3;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.price {
  font-weight: 600;
  color: #059669;
}

.stock-good { color: #059669; font-weight: 500; }
.stock-low { color: #d97706; font-weight: 500; }
.stock-empty { color: #dc2626; font-weight: 500; }

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #dcfce7;
  color: #166534;
}

.status-out-of-stock {
  background-color: #fecaca;
  color: #991b1b;
}

.status-inactive {
  background-color: #f3f4f6;
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
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-edit {
  background-color: #f59e0b;
  color: white;
  padding: 6px 10px;
}

.btn-edit:hover {
  background-color: #d97706;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
  padding: 6px 10px;
}

.btn-delete:hover {
  background-color: #dc2626;
}

.btn-view {
  background-color: #6b7280;
  color: white;
  padding: 6px 10px;
}

.btn-view:hover {
  background-color: #4b5563;
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
  background-color: white;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  font-weight: 500;
  color: #374151;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
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

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .products-table {
    font-size: 14px;
  }
  
  .products-table th,
  .products-table td {
    padding: 8px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>