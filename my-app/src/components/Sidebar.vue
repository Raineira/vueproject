<!-- src/components/Sidebar.vue -->
<template>
  <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-header">
      <div class="logo" v-if="!isCollapsed" @click="selectMenuItem('dashboard')" style="cursor:pointer">
        <h3>Dashboard</h3>
      </div>
      <div class="logo-mini" v-else @click="selectMenuItem('dashboard')" style="cursor:pointer">
        <span>D</span>
      </div>

      <button
        class="collapse-btn"
        @click="toggleSidebar"
        :title="isCollapsed ? 'Menüyü Aç' : 'Menüyü Kapat'"
        aria-label="Sidebarı aç/kapat"
      >
        <i class="fas" :class="isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-menu">
        <li
          v-for="item in menuItems"
          :key="item.key"
          class="nav-item"
          :class="{ 'active': isActive(item) }"
          @click="selectMenuItem(item.key)"
        >
          <a href="#" class="nav-link" @click.prevent>
            <i :class="item.icon"></i>
            <span v-if="!isCollapsed" class="nav-text">{{ item.label }}</span>
            <i v-if="item.children && !isCollapsed" 
               class="fas fa-chevron-down expand-icon" 
               :class="{ 'rotated': isMenuOpen(item.key) }"></i>
          </a>

          <!-- 1. seviye alt menü -->
          <ul
            v-if="item.children && !isCollapsed && isMenuOpen(item.key)"
            class="sub-menu"
          >
            <li
              v-for="child in item.children"
              :key="child.key"
              class="sub-item"
              @click.stop="selectMenuItem(child.key)"
            >
              <a href="#" class="sub-link" :class="{ active: isActive(child) }" @click.prevent>
                {{ child.label }}
                <i v-if="child.children" 
                   class="fas fa-chevron-down expand-icon-sub" 
                   :class="{ 'rotated': isMenuOpen(child.key) }"></i>
              </a>

              <!-- 2. seviye alt menü -->
              <ul v-if="child.children && !isCollapsed && isMenuOpen(child.key)" class="sub-sub-menu">
                <li
                  v-for="g in child.children"
                  :key="g.key"
                  class="sub-sub-item"
                  @click.stop="selectMenuItem(g.key)"
                >
                  <a href="#" class="sub-sub-link" :class="{ active: isActive(g) }" @click.prevent>
                    {{ g.label }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info" v-if="!isCollapsed">
        <i class="fas fa-user-circle"></i>
        <span>Dev User</span>
      </div>
      <button class="toggle-btn" @click="toggleSidebar" aria-label="Sidebarı aç/kapat">
        <i class="fas fa-chevron-left" :class="{ 'rotated': isCollapsed }"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    isCollapsed: { type: Boolean, default: false },
    activeMenuItem: { type: String, default: '' }
  },
  data() {
    return {
      openMenus: [], // Açık menülerin key'lerini tutan array
      menuItems: [
        { 
          key: 'dashboard', 
          label: 'Ana Sayfa', 
          icon: 'fas fa-house',
          route: '/dashboard'
        },
        {
          key: 'personel',
          label: 'Personel',
          icon: 'fas fa-user-tie',
          children: [
            { 
              key: 'personel-list', 
              label: 'Personel Listele',
              route: '/dashboard/personel'
            }
          ]
        },
        {
          key: 'stok',
          label: 'Stok',
          icon: 'fas fa-boxes-stacked',
          children: [
            { 
              key: 'stok-list', 
              label: 'Stok Listele',
              route: '/dashboard/stok'
            },
            { 
              key: 'stok-hareketleri', 
              label: 'Stok Hareketleri',
              route: '/dashboard/stok/hareketler'
            },
            { 
              key: 'stok-giris-cikis', 
              label: 'Stok Giriş/Çıkış',
              route: '/dashboard/stok/giris-cikis'
            }
          ]
        },
        {
          key: 'musteri-tedarikci',
          label: 'Müşteriler/Tedarikçiler',
          icon: 'fas fa-handshake',
          children: [
            { 
              key: 'musteriler', 
              label: 'Müşteri Listele',
              route: '/dashboard/musteriler'
            }
          ]
        },
        {
          key: 'odeme-tahsilat',
          label: 'Ödemeler/Tahsilatlar',
          icon: 'fas fa-money-bill-wave',
          children: [
            { 
              key: 'odeme-listele', 
              label: 'Ödeme Listele',
              route: '/dashboard/odemeler'
            },
            { 
              key: 'tahsilat-listele', 
              label: 'Tahsilat Listele',
              route: '/dashboard/tahsilatlar'
            }
          ]
        },
        {
          key: 'fatura',
          label: 'Fatura',
          icon: 'fas fa-file-invoice',
          children: [
            {
              key: 'giden-fatura',
              label: 'Giden Fatura',
              children: [
                { 
                  key: 'giden-fatura-listele', 
                  label: 'Giden Fatura Listele' 
                }
              ]
            },
            {
              key: 'gelen-fatura',
              label: 'Gelen Fatura',
              children: [
                { 
                  key: 'gelen-fatura-listele', 
                  label: 'Gelen Fatura Listele' 
                },
                { 
                  key: 'manuel-fatura-listele', 
                  label: 'Manuel Fatura Listele' 
                }
              ]
            },
            {
              key: 'faturalar',
              label: 'Tüm Faturalar',
              route: '/dashboard/faturalar'
            }
          ]
        },
        {
          key: 'irsaliye',
          label: 'İrsaliye',
          icon: 'fas fa-file-signature',
          children: [
            {
              key: 'giden-irsaliye',
              label: 'Giden İrsaliye',
              children: [
                { 
                  key: 'giden-irsaliye-listele', 
                  label: 'Giden İrsaliye Listele' 
                }
              ]
            },
            {
              key: 'gelen-irsaliye',
              label: 'Gelen İrsaliye',
              children: [
                { 
                  key: 'gelen-irsaliye-listele', 
                  label: 'Gelen İrsaliye Listele' 
                }
              ]
            }
          ]
        },
        {
          key: 'siparis',
          label: 'Sipariş',
          icon: 'fas fa-clipboard-list',
          children: [
            { 
              key: 'siparisler', 
              label: 'Sipariş Listele',
              route: '/dashboard/siparisler'
            }
          ]
        },
        {
          key: 'urunler',
          label: 'Ürünler',
          icon: 'fas fa-box-open',
          children: [
            { 
              key: 'urunler-listele', 
              label: 'Ürün Listele',
              route: '/dashboard/urunler/liste'
            },
            { 
              key: 'urunler-ekle', 
              label: 'Ürün Ekle',
              route: '/dashboard/urunler/ekle'
            }
          ]
        },
        {
          key: 'magazalar',
          label: 'Mağazalar',
          icon: 'fas fa-store',
          children: [
            { 
              key: 'magazalar-listele', 
              label: 'Mağaza Listele',
              route: '/dashboard/magazalar'
            },
            { 
              key: 'magaza-ekle', 
              label: 'Mağaza Ekle',
              route: '/dashboard/magazalar/ekle'
            }
          ]
        },
        {
          key: 'depo',
          label: 'Depo',
          icon: 'fas fa-warehouse',
          children: [
            { 
              key: 'depo-listele', 
              label: 'Depo Listele',
              route: '/dashboard/depolar'
            },
            { 
              key: 'depo-ekle', 
              label: 'Depo Ekle',
              route: '/dashboard/depolar/ekle'
            },
            { 
              key: 'depo-transfer', 
              label: 'Depo Transfer',
              route: '/dashboard/depolar/transfer'
            }
          ]
        },
        {
          key: 'raporlar',
          label: 'Raporlar',
          icon: 'fas fa-chart-bar',
          children: [
            { 
              key: 'raporlar-satis', 
              label: 'Satış Raporları',
              route: '/dashboard/raporlar/satis'
            }
          ]
        },
        {
          key: 'ayarlar',
          label: 'Ayarlar',
          icon: 'fas fa-cog',
          route: '/dashboard/ayarlar'
        }
      ]
    }
  },
  computed: {
    currentActive() {
      return (
        this.activeMenuItem ||
        this.$route?.meta?.menuKey ||
        this.keyFromRouteName(this.$route?.name) ||
        'dashboard'
      )
    }
  },
  mounted() {
    // Sayfa yüklendiğinde aktif menünün parent'larını aç
    this.openParentMenus()
  },
  methods: {
    selectMenuItem(key) {
      this.$emit('menu-select', key)
      
      // Menü item'ını bul
      const menuItem = this.findMenuItemByKey(key)
      
      if (menuItem?.route) {
        // Route varsa yönlendir
        this.$router.push(menuItem.route)
      } else if (menuItem?.children) {
        // Alt menüsü varsa toggle yap
        this.toggleMenu(key)
      }
    },

    toggleMenu(key) {
      const index = this.openMenus.indexOf(key)
      if (index > -1) {
        // Menü açıksa kapat
        this.openMenus.splice(index, 1)
      } else {
        // Menü kapalıysa aç
        this.openMenus.push(key)
      }
    },

    isMenuOpen(key) {
      return this.openMenus.includes(key)
    },

    isActive(item) {
      if (this.currentActive === item.key) return true
      
      // Alt menülerinde aktif item varsa parent'ı da aktif göster
      if (item.children) {
        return this.hasActiveChild(item.children)
      }
      
      return false
    },

    hasActiveChild(children) {
      return children.some(child => {
        if (this.currentActive === child.key) return true
        if (child.children) {
          return this.hasActiveChild(child.children)
        }
        return false
      })
    },

    openParentMenus() {
      // Aktif menünün tüm parent'larını aç
      const activeKey = this.currentActive
      const parents = this.findParentKeys(activeKey)
      this.openMenus = [...new Set([...this.openMenus, ...parents])]
    },

    findParentKeys(targetKey) {
      const parents = []
      
      const findInItems = (items, currentPath = []) => {
        for (const item of items) {
          const newPath = [...currentPath, item.key]
          
          if (item.key === targetKey) {
            parents.push(...currentPath)
            return true
          }
          
          if (item.children && findInItems(item.children, newPath)) {
            return true
          }
        }
        return false
      }
      
      findInItems(this.menuItems)
      return parents
    },

    toggleSidebar() { 
      this.$emit('toggle-sidebar') 
    },

    findMenuItemByKey(key) {
      const findInItems = (items) => {
        for (const item of items) {
          if (item.key === key) return item
          if (item.children) {
            const found = findInItems(item.children)
            if (found) return found
          }
        }
        return null
      }
      return findInItems(this.menuItems)
    },

    keyFromRouteName(name) {
      const nameMap = {
        'dashboard': 'dashboard',
        'products.list': 'urunler-listele',
        'products.create': 'urunler-ekle',
        'products.edit': 'urunler-listele',
        'products.show': 'urunler-listele'
      }
      return nameMap[name] || ''
    }
  },

  watch: {
    '$route'(to, from) {
      // Route değiştiğinde parent menüleri aç
      this.openParentMenus()
      
      if (to.meta?.menuKey) {
        this.$emit('menu-select', to.meta.menuKey)
      }
    }
  }
}
</script>

<style scoped>
/* Önceki stillerinizin aynısı */
.sidebar {
  width: 250px; height: 100vh; background: #2c3e50; color: #fff;
  position: fixed; left: 0; top: 0; z-index: 1000;
  transition: width 0.3s ease; display: flex; flex-direction: column;
}
.sidebar.collapsed { width: 70px; }

.sidebar-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 12px; border-bottom: 1px solid #34495e;
}
.logo h3 { margin: 0; font-size: 20px; color: #ecf0f1; }
.logo-mini span { font-size: 20px; font-weight: 700; color: #3498db; }

.collapse-btn {
  background: transparent; border: 1px solid #3a5168; color: #bdc3c7;
  border-radius: 8px; width: 36px; height: 32px;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s ease;
}
.collapse-btn:hover { background: #34495e; color: #fff; }

.sidebar-nav { 
  flex: 1; padding: 12px 0; overflow-y: auto; 
}

.nav-menu { list-style: none; padding: 0; margin: 0; }
.nav-item { margin-bottom: 2px; }

.nav-link {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; color: #bdc3c7; text-decoration: none;
  transition: all 0.2s ease; cursor: pointer; position: relative;
}
.nav-link:hover { background: #34495e; color: #3498db; }
.nav-item.active > .nav-link { background: #3498db; color: #fff; }

.nav-link i:first-child { 
  font-size: 18px; width: 20px; text-align: center; margin-right: 12px; 
}

.sidebar.collapsed .nav-link { justify-content: center; padding: 12px; }
.sidebar.collapsed .nav-link i:first-child { margin-right: 0; }

.nav-text { font-size: 14px; font-weight: 500; flex: 1; }

.expand-icon, .expand-icon-sub {
  font-size: 10px;
  transition: transform 0.2s ease;
  margin-left: 8px;
}
.expand-icon.rotated, .expand-icon-sub.rotated {
  transform: rotate(180deg);
}

.sub-menu {
  list-style: none; padding: 0; margin: 0;
  background: #233040; border-left: 3px solid #3498db;
  animation: slideDown 0.2s ease-out;
}
.sub-item { margin: 0; }
.sub-link {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px 10px 52px;
  color: #95a5a6; text-decoration: none; font-size: 13px; 
  transition: all 0.2s ease; cursor: pointer;
}
.sub-link:hover, .sub-link.active { background: #2c3e50; color: #3498db; }

.sub-sub-menu {
  list-style: none; padding: 0; margin: 0;
  background: #1c2633; border-left: 3px solid #2a79b9;
  animation: slideDown 0.2s ease-out;
}
.sub-sub-item { margin: 0; }
.sub-sub-link {
  display: block; padding: 10px 16px 10px 72px;
  color: #9fb0bd; text-decoration: none; font-size: 13px; 
  transition: all 0.2s ease; cursor: pointer;
}
.sub-sub-link:hover, .sub-sub-link.active { background: #253449; color: #49a2e6; }

.sidebar-footer {
  padding: 16px; border-top: 1px solid #34495e;
  display: flex; align-items: center; justify-content: space-between;
}

.user-info {
  display: flex; align-items: center; gap: 8px;
  color: #bdc3c7; font-size: 14px;
}
.user-info i { font-size: 20px; }

.toggle-btn {
  background: #3498db; color: #fff; border: none; border-radius: 50%;
  width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s ease;
}
.toggle-btn:hover { background: #2980b9; transform: scale(1.05); }
.toggle-btn i { font-size: 12px; transition: transform 0.2s ease; }
.toggle-btn i.rotated { transform: rotate(180deg); }

@keyframes slideDown {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 500px; }
}

.sidebar-nav::-webkit-scrollbar { width: 6px; }
.sidebar-nav::-webkit-scrollbar-track { background: transparent; }
.sidebar-nav::-webkit-scrollbar-thumb { background: #34495e; border-radius: 3px; }
.sidebar-nav::-webkit-scrollbar-thumb:hover { background: #4a6277; }

@media (max-width: 768px) {
  .sidebar { 
    transform: translateX(-100%); 
    transition: transform 0.3s ease, width 0.3s ease; 
  }
  .sidebar.show { transform: translateX(0); }
  .sidebar.collapsed { 
    width: 250px; 
    transform: translateX(-100%); 
  }
  .sidebar-footer {
    flex-direction: column;
    gap: 12px;
  }
}

.nav-item:hover .nav-link {
  padding-left: 20px;
}
.sub-item:hover .sub-link {
  padding-left: 56px;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #3498db;
}
</style>