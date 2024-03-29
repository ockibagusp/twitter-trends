import { createApp } from 'vue'
import App from '/src/App.vue'
import router from './router'

import '/src/assets/main.css'

createApp(App)
    .use(router)
    .mount('#app')