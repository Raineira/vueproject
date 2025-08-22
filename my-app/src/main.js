// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router.js'
import './api' 

const app = createApp(App)
app.use(createPinia())
app.use(router)  // ← Bu satır eklendi
app.mount('#app')