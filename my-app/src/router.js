// src/router.js - Stok route'u güncellenmiş versiyon
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/components/Dashboard.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    component: Dashboard,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/components/DashboardHome.vue'),
        meta: {
          menuKey: 'dashboard',
          title: 'Dashboard'
        }
      },
      // ÜRÜN YÖNETİMİ
      {
        path: 'urunler/liste',
        name: 'products.list',
        component: () => import('@/components/products/ProductList.vue'),
        meta: {
          menuKey: 'urunler-listele',
          title: 'Ürün Listesi'
        }
      },
      // STOK YÖNETİMİ
      {
        path: 'stok',
        name: 'stock.index',
        component: () => import('@/components/stock/StockList.vue'),
        meta: { menuKey: 'stok-list', title: 'Stok Listesi' }
      },
      {
        path: 'stok/hareketler',
        name: 'stock.movements',
        component: { 
          template: `
            <div style="padding: 24px;">
              <h1>Stok Hareketleri</h1>
              <p>Stok hareketleri sayfası yakında gelecek...</p>
            </div>
          `
        },
        meta: { menuKey: 'stok-hareketleri', title: 'Stok Hareketleri' }
      },
      {
        path: 'stok/giris-cikis',
        name: 'stock.transactions',
        component: { 
          template: `
            <div style="padding: 24px;">
              <h1>Stok Giriş/Çıkış</h1>
              <p>Stok giriş/çıkış sayfası yakında gelecek...</p>
            </div>
          `
        },
        meta: { menuKey: 'stok-giris-cikis', title: 'Stok Giriş/Çıkış' }
      },
      // MÜŞTERİ/TEDARİKÇİ YÖNETİMİ
      {
        path: 'musteriler',
        name: 'customers.index',
        component: () => import('@/components/customers/CustomerList.vue'),
        meta: { menuKey: 'musteriler', title: 'Müşteriler' }
      },
      // ÖDEME/TAHSİLAT YÖNETİMİ
      {
        path: 'odemeler',
        name: 'payments.index',
        component: { 
          template: `
            <div style="padding: 24px;">
              <h1>Ödeme Listesi</h1>
              <p>Ödeme listesi sayfası yakında gelecek...</p>
            </div>
          `
        },
        meta: { menuKey: 'odeme-listele', title: 'Ödemeler' }
      },
      {
        path: 'tahsilatlar',
        name: 'collections.index',
        component: { 
          template: `
            <div style="padding: 24px;">
              <h1>Tahsilat Listesi</h1>
              <p>Tahsilat listesi sayfası yakında gelecek...</p>
            </div>
          `
        },
        meta: { menuKey: 'tahsilat-listele', title: 'Tahsilatlar' }
      },
      // MAĞAZA YÖNETİMİ
      {
        path: 'magazalar',
        name: 'stores.index',
        component: { 
          template: `
            <div style="padding: 24px;">
              <h1>Mağaza Listesi</h1>
              <p>Mağaza listesi sayfası yakında gelecek...</p>
            </div>
          `
        },
        meta: { menuKey: 'magazalar-listele', title: 'Mağazalar' }
      },
      {
        path: 'magazalar/ekle',
        name: 'stores.create',
        component: { 
          template: `
            <div style="padding: 24px;">
              <h1>Yeni Mağaza Ekle</h1>
              <p>Mağaza ekleme sayfası yakında gelecek...</p>
            </div>
          `
        },
        meta: { menuKey: 'magaza-ekle', title: 'Mağaza Ekle' }
      },
      // DEPO YÖNETİMİ
      {
        path: 'depolar',
        name: 'warehouses.index',
        component: { 
          template: `
            <div style="padding: 24px;">
              <h1>Depo Listesi</h1>
              <p>Depo listesi sayfası yakında gelecek...</p>
            </div>
          `
        },
        meta: { menuKey: 'depo-listele', title: 'Depolar' }
      },
      {
        path: 'depolar/ekle',
        name: 'warehouses.create',
        component: { 
          template: `
            <div style="padding: 24px;">
              <h1>Yeni Depo Ekle</h1>
              <p>Depo ekleme sayfası yakında gelecek...</p>
            </div>
          `
        },
        meta: { menuKey: 'depo-ekle', title: 'Depo Ekle' }
      },
      {
        path: 'depolar/transfer',
        name: 'warehouses.transfer',
        component: { 
          template: `
            <div style="padding: 24px;">
              <h1>Depo Transfer</h1>
              <p>Depo transfer sayfası yakında gelecek...</p>
            </div>
          `
        },
        meta: { menuKey: 'depo-transfer', title: 'Depo Transfer' }
      }
    ]
  },
  // Login sayfası - gerçek LoginForm component'i
  {
    path: '/login',
    name: 'login',
    component: () => import('@/components/LoginForm.vue'),
    meta: { title: 'Giriş Yap' }
  },
  // 404 sayfası
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: { 
      template: `
        <div style="padding: 24px; text-align: center; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc;">
          <div>
            <h1 style="font-size: 48px; color: #ef4444; margin-bottom: 16px;">404</h1>
            <h2 style="color: #1f2937; margin-bottom: 16px;">Sayfa Bulunamadı</h2>
            <router-link to="/" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
              Ana Sayfaya Dön
            </router-link>
          </div>
        </div>
      `
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Basit auth guard
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - Dashboard`
  }

  // Demo auth kontrolü - DÜZELTME: access_token kullan
  const isAuthenticated = localStorage.getItem('access_token')
  
  if (to.path.startsWith('/dashboard') && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router