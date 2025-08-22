<template>
  <div class="topbar">
    <div class="topbar-left">
      <!-- Ana Sayfa butonu -->
      <button class="icon-btn" @click="$emit('go-home')" title="Ana Sayfa">
        <i class="fas fa-house"></i>
      </button>

      <button class="mobile-menu-btn" @click="toggleMobileSidebar" title="Menü">
        <i class="fas fa-bars"></i>
      </button>

      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input
          type="text"
          placeholder="Ara..."
          v-model="searchQuery"
          class="search-input"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <div class="topbar-right">
      <!-- Bildirimler -->
      <div class="notification-dropdown" @click="toggleNotifications">
        <div class="notification-btn">
          <i class="fas fa-bell"></i>
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </div>

        <div v-if="showNotifications" class="dropdown-menu notification-menu" @click.stop>
          <div class="dropdown-header">
            <h4>Bildirimler</h4>
            <span class="mark-all-read" @click="markAllAsRead">Tümünü okundu işaretle</span>
          </div>
          <div class="notification-list">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ 'unread': !notification.read }"
            >
              <div class="notification-icon">
                <i :class="notification.icon"></i>
              </div>
              <div class="notification-content">
                <p>{{ notification.message }}</p>
                <small>{{ formatTime(notification.time) }}</small>
              </div>
            </div>
          </div>
          <div class="dropdown-footer">
            <a href="#" class="view-all">Tüm bildirimleri görüntüle</a>
          </div>
        </div>
      </div>

      <!-- Mesajlar -->
      <div class="message-dropdown" @click="toggleMessages">
        <div class="message-btn">
          <i class="fas fa-envelope"></i>
          <span v-if="unreadMessages > 0" class="message-badge">{{ unreadMessages }}</span>
        </div>
      </div>

      <!-- Kullanıcı menüsü -->
      <div class="user-dropdown" @click="toggleUserMenu">
        <div class="user-info">
          <img :src="currentUser.avatar || 'https://via.placeholder.com/40'" :alt="currentUser.name" class="user-avatar">
          <span class="user-name">{{ currentUser.name }}</span>
          <i class="fas fa-chevron-down dropdown-arrow" :class="{ 'rotated': showUserMenu }"></i>
        </div>

        <div v-if="showUserMenu" class="dropdown-menu user-menu" @click.stop>
          <div class="user-profile">
            <img :src="currentUser.avatar || 'https://via.placeholder.com/60'" :alt="currentUser.name" class="profile-avatar">
            <div class="profile-info">
              <h4>{{ currentUser.name }}</h4>
              <p>{{ currentUser.email }}</p>
            </div>
          </div>

          <hr />

          <ul class="menu-list">
            <li><a href="#"><i class="fas fa-user"></i> Profil</a></li>
            <li><a href="#"><i class="fas fa-cog"></i> Ayarlar</a></li>
            <li><a href="#"><i class="fas fa-question-circle"></i> Yardım</a></li>
            <li><a href="#" @click.prevent="logout"><i class="fas fa-sign-out-alt"></i> Çıkış Yap</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Topbar',
  props: {
    user: { 
      type: Object, 
      default: () => ({
        name: 'Demo User',
        email: 'demo@example.com',
        avatar: null
      })
    }
  },
  data() {
    return {
      searchQuery: '',
      showNotifications: false,
      showUserMenu: false,
      showMessages: false,
      unreadCount: 3,
      unreadMessages: 2,
      notifications: [
        { id: 1, message: 'Yeni bir sipariş aldınız', icon: 'fas fa-shopping-cart', time: new Date(Date.now() - 5 * 60 * 1000), read: false },
        { id: 2, message: 'Sistem güncellendi', icon: 'fas fa-sync', time: new Date(Date.now() - 30 * 60 * 1000), read: false },
        { id: 3, message: 'Yeni kullanıcı kaydı', icon: 'fas fa-user-plus', time: new Date(Date.now() - 2 * 60 * 60 * 1000), read: false }
      ]
    }
  },
  computed: {
    currentUser() {
      // User prop'u null ise default değer döndür
      return this.user || {
        name: 'Demo User',
        email: 'demo@example.com',
        avatar: null
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  },
  methods: {
    toggleMobileSidebar() { this.$emit('toggle-sidebar') },
    handleSearch() {
      if (this.searchQuery.trim()) console.log('Arama:', this.searchQuery)
    },
    toggleNotifications() {
      this.showNotifications = !this.showNotifications
      this.showUserMenu = false
      this.showMessages = false
    },
    toggleMessages() {
      this.showMessages = !this.showMessages
      this.showNotifications = false
      this.showUserMenu = false
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
      this.showNotifications = false
      this.showMessages = false
    },
    handleOutsideClick(event) {
      if (!event.target.closest('.notification-dropdown')) this.showNotifications = false
      if (!event.target.closest('.user-dropdown')) this.showUserMenu = false
      if (!event.target.closest('.message-dropdown')) this.showMessages = false
    },
    markAllAsRead() {
      this.notifications.forEach(n => (n.read = true))
      this.unreadCount = 0
    },
    formatTime(time) {
      const diff = Date.now() - new Date(time).getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      return minutes < 60 ? `${minutes} dakika önce` : `${hours} saat önce`
    },
    logout() { this.$emit('logout') }
  }
}
</script>

<style scoped>
.topbar {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Ortak ikon buton stili */
.icon-btn,
.mobile-menu-btn {
  background: none;
  border: 1px solid #eee;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.icon-btn:hover,
.mobile-menu-btn:hover { background: #f5f5f5; color: #3498db; }

.search-container { position: relative; width: 300px; }
.search-icon {
  position: absolute; left: 12px; top: 50%;
  transform: translateY(-50%); color: #999; font-size: 14px;
}
.search-input {
  width: 100%; padding: 10px 40px; border: 1px solid #ddd;
  border-radius: 20px; font-size: 14px; outline: none;
  transition: border-color 0.3s ease;
}
.search-input:focus { border-color: #3498db; }

.topbar-right { display: flex; align-items: center; gap: 15px; }

.notification-dropdown, .message-dropdown, .user-dropdown { position: relative; }

.notification-btn, .message-btn {
  position: relative; background: none; border: none; font-size: 18px;
  color: #666; cursor: pointer; padding: 8px; border-radius: 4px; transition: all 0.3s ease;
}
.notification-btn:hover, .message-btn:hover { background: #f5f5f5; color: #3498db; }

.notification-badge, .message-badge {
  position: absolute; top: -2px; right: -2px; background: #e74c3c; color: #fff;
  border-radius: 50%; width: 18px; height: 18px; font-size: 10px;
  display: flex; align-items: center; justify-content: center; font-weight: 700;
}

.user-info {
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  padding: 5px 10px; border-radius: 20px; transition: background 0.3s ease;
}
.user-info:hover { background: #f5f5f5; }
.user-avatar { width: 35px; height: 35px; border-radius: 50%; object-fit: cover; }
.dropdown-arrow { transition: transform 0.2s ease; }
.dropdown-arrow.rotated { transform: rotate(180deg); }

.dropdown-menu {
  position: absolute; right: 0; top: calc(100% + 8px);
  background: #fff; border: 1px solid #eee; border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  min-width: 280px; overflow: hidden; z-index: 200;
}

.dropdown-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; border-bottom: 1px solid #f0f0f0;
}
.dropdown-header h4 { font-size: 14px; margin: 0; }
.mark-all-read { font-size: 12px; color: #3498db; cursor: pointer; }

.notification-list { max-height: 280px; overflow: auto; }
.notification-item {
  display: flex; gap: 12px; padding: 10px 12px; border-bottom: 1px solid #f7f7f7;
}
.notification-item.unread { background: #fbfdff; }
.notification-icon i { color: #3498db; }
.notification-content p { margin: 0 0 4px; font-size: 14px; }
.notification-content small { color: #888; }

.dropdown-footer { padding: 10px 12px; text-align: center; }
.view-all { color: #3498db; font-size: 13px; text-decoration: none; }

.user-menu .user-profile {
  display: flex; gap: 12px; padding: 12px;
}
.profile-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
.profile-info h4 { margin: 0 0 4px; font-size: 15px; }
.profile-info p { margin: 0; color: #777; font-size: 13px; }

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-list li {
  border-bottom: 1px solid #f7f7f7;
}

.menu-list li:last-child {
  border-bottom: none;
}

.menu-list a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: #333;
  text-decoration: none;
  transition: background 0.2s ease;
}

.menu-list a:hover {
  background: #f8f9fa;
}

.menu-list i {
  width: 16px;
  color: #666;
}

@media (max-width: 768px) {
  .search-container { width: 180px; }
}
</style>