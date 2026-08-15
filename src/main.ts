import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useConfigStore } from '@/stores/config'
import { useUserStore } from '@/stores/user'
import 'vant/lib/index.css'
import './styles/index.scss'
import '@vant/touch-emulator'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

const configStore = useConfigStore()
const userStore = useUserStore()
Promise.all([
  configStore.load().catch((err) => console.warn('[boot] config/info failed', err)),
  userStore.ensureLogin().catch((err) => console.warn('[boot] user/login failed', err)),
])

app.mount('#app')
