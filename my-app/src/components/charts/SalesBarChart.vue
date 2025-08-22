<script setup>
import { ref, onMounted } from 'vue'
import BarChart from '@/components/charts/BarChart.js'

// Başlangıç için örnek veri (API çalışmasa bile ekran gelsin)
const chartData = ref({
  labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
  datasets: [
    { label: 'Satış', data: [12, 19, 3, 5, 2, 3] }
  ]
})

const chartOptions = { responsive: true, maintainAspectRatio: false }

// (İsteğe bağlı) Laravel API’den gerçek veri
onMounted(async () => {
  try {
    // Vite proxy kullandıysan sadece '/api/...' yaz (vite.config.js'de proxy ayarlı olsun)
    // const res = await fetch('/api/stats/sales')
    // const json = await res.json()
    // chartData.value = {
    //   labels: json.labels,
    //   datasets: [{ label: 'Satış', data: json.data }]
    // }
  } catch (e) {
    console.warn('Satış grafiği API okunamadı, demo veri gösteriliyor.', e)
  }
})
</script>

<template>
  <div style="height:320px; padding:16px">
    <BarChart :chart-data="chartData" :chart-options="chartOptions" height="320" />
  </div>
</template>
