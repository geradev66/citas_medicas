import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import {createPinia} from 'pinia'
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { updatePrimaryPalette } from '@primeuix/themes';

import '@/assets/tailwind.css';
import '@/assets/styles.scss';

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});

updatePrimaryPalette({
    50: '#e0f8ff',
    100: '#b3edff',
    200: '#80e0ff',
    300: '#4dd4ff',
    400: '#26c8ff',
    500: '#00a6f4',
    600: '#0095db',
    700: '#0084c2',
    800: '#0073a9',
    900: '#006290',
    950: '#005177'
});

app.use(Vue3Toastify, {
    autoClose: 3000,
    newestOnTop: true
})
app.use(VueSweetalert2);
app.use(createPinia());
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');
