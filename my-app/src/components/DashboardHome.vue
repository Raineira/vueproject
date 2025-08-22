<!-- src/components/DashboardHome.vue -->
<template>
  <div class="dashboard-home">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1>Hoş Geldiniz!</h1>
        <p>Sistem durumunuz ve önemli metriklere genel bakış</p>
      </div>
      <div class="date-info">
        <i class="fas fa-calendar"></i>
        <span>{{ currentDate }}</span>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon user-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalUsers.toLocaleString('tr-TR') }}</h3>
          <p>Toplam Kullanıcı</p>
          <span class="stat-change positive">+12.5%</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon revenue-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="stat-content">
          <h3>₺{{ stats.monthlyRevenue.toLocaleString('tr-TR') }}</h3>
          <p>Bu Ay Gelir</p>
          <span class="stat-change positive">+8.2%</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orders-icon">
          <i class="fas fa-box"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.activeOrders }}</h3>
          <p>Aktif Siparişler</p>
          <span class="stat-change negative">-2.1%</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon uptime-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-content">
          <h3>%{{ stats.systemUptime }}</h3>
          <p>Sistem Uptime</p>
          <span class="stat-change positive">+0.3%</span>
        </div>
      </div>
    </div>

    <!-- Charts and Tables Section -->
    <div class="dashboard-content">
      <!-- Sales Chart -->
      <div class="chart-section">
        <div class="section-header">
          <h2>Satış Trendleri</h2>
          <select v-model="selectedPeriod" class="form-select">
            <option value="week">Son Hafta</option>
            <option value="month">Son Ay</option>
            <option value="quarter">Son 3 Ay</option>
          </select>
        </div>
        <div class="chart-container">
          <div class="chart-placeholder">
            <i class="fas fa-chart-area"></i>
            <p>Grafik burada görüntülenecek</p>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="table-section">
        <div class="section-header">
          <h2>Son Siparişler</h2>
          <router-link to="/dashboard/siparisler" class="btn btn-primary btn-sm">
            Tümünü Gör
          </router-link>
        </div>
        <div class="table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Müşteri</th>
                <th>Tutar</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id">
                <td>#{{ order.id }}</td>
                <td>{{ order.customer }}</td>
                <td class="price">₺{{ order.amount.toLocaleString('tr-TR') }}</td>
                <td>
                  <span :class="getOrderStatusClass(order.status)" class="status-badge">
                    {{ order.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Hızlı İşlemler</h2>
      <div class="actions-grid">
        <router-link to="/dashboard/urunler/ekle" class="action-card">
          <i class="fas fa-plus-circle"></i>
          <span>Yeni Ürün Ekle</span>
        </router-link>
        <router-link to="/dashboard/musteriler" class="action-card">
          <i class="fas fa-user-plus"></i>
          <span>Müşteri Ekle</span>
        </router-link>
        <router-link to="/dashboard/siparisler" class="action-card">
          <i class="fas fa-shopping-basket"></i>
          <span>Sipariş Ver</span>
        </router-link>
        <router-link to="/dashboard/raporlar/satis" class="action-card">
          <i class="fas fa-chart-bar"></i>
          <span>Rapor Görüntüle</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardHome',

  data() {
    return {
      selectedPeriod: 'month',
      stats: {
        totalUsers: 1248,
        monthlyRevenue: 24680,
        activeOrders: 892,
        systemUptime: 94.8
      },
      recentOrders: [
        {
          id: 1001,
          customer: 'Ahmet Yılmaz',
          amount: 245.90,
          status: 'Tamamlandı'
        },
        {
          id: 1002,
          customer: 'Ayşe Demir',
          amount: 189.50,
          status: 'İşleniyor'
        },
        {
          id: 1003,
          customer: 'Mehmet Kaya',
          amount: 567.20,
          status: 'Beklemede'
        },
        {
          id: 1004,
          customer: 'Fatma Özkan',
          amount: 324.75,
          status: 'Tamamlandı'
        },
        {
          id: 1005,
          customer: 'Ali Çelik',
          amount: 456.30,
          status: 'İşleniyor'
        }
      ]
    }
  },

  computed: {
    currentDate() {
      return new Date().toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  },

  methods: {
    getOrderStatusClass(status) {
      switch (status) {
        case 'Tamamlandı': return 'status-completed'
        case 'İşleniyor': return 'status-processing'
        case 'Beklemede': return 'status-pending'
        case 'İptal': return 'status-cancelled'
        default: return 'status-pending'
      }
    }
  }
}
</script>

<style scoped>
.dashboard-home {
  padding: 24px;
  background: #f8fafc;
  min-height: 100%;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.welcome-section h1 {
  color: #1e293b;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.welcome-section p {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 14px;
}

.date-info i {
  font-size: 18px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.user-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.revenue-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.orders-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.uptime-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stat-content h3 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.stat-content p {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 8px 0;
}

.stat-change {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 20px;
}

.stat-change.positive {
  color: #059669;
  background: #d1fae5;
}

.stat-change.negative {
  color: #dc2626;
  background: #fee2e2;
}

/* Dashboard Content */
.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.chart-section, .table-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.form-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.chart-container, .table-container {
  padding: 24px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #f9fafb;
  border-radius: 8px;
  color: #6b7280;
}

.chart-placeholder i {
  font-size: 48px;
  margin-bottom: 12px;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.orders-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.price {
  font-weight: 600;
  color: #059669;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-processing {
  background: #dbeafe;
  color: #1e40af;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.quick-actions {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-actions h2 {
  margin-bottom: 20px;
  color: #1e293b;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  color: #374151;
  transition: all 0.2s ease;
}

.action-card:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.action-card i {
  font-size: 24px;
  margin-bottom: 8px;
  color: #3b82f6;
}

@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .dashboard-home {
    padding: 16px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>