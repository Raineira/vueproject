<!-- src/components/Dashboard.vue -->
<template>
  <div class="dashboard-container">
    <Sidebar
      :isCollapsed="isSidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
      @menu-select="handleMenuSelect"
    />

    <div class="main-content" :class="{ expanded: isSidebarCollapsed }">
      <Topbar
        :user="currentUser"
        @logout="handleLogout"
        @toggle-sidebar="toggleSidebar"
      />

      <main class="content-area">
        <!-- Router view - burada sayfalar gösterilecek -->
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Dashboard',
  components: {
    Sidebar,
    Topbar
  },

  data() {
    return {
      isSidebarCollapsed: false,
    }
  },

  computed: {
    ...mapStores(useAuthStore),

    currentUser() {
      return this.authStore.user
    }
  },

  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed
    },

    handleMenuSelect(menuItem) {
      // Sidebar'da menü seçildiğinde buraya gelir
      // Router navigation Sidebar içinde yapılıyor
      console.log('Menu selected:', menuItem)
    },

    handleLogout() {
      this.authStore.logout(true)
      this.$router.push({ name: 'login' })
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  background: #f8fafc;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.main-content.expanded {
  margin-left: 70px;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
  min-height: calc(100vh - 60px); /* Topbar height */
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .main-content.expanded {
    margin-left: 0;
  }
}
</style>