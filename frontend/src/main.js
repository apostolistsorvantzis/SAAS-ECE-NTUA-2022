import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from '@/App.vue';
import MainPage from '@/pages/MainPage.vue';
import UserLogin from '@/pages/UserLogin.vue';
import UserProfile from '@/pages/UserProfile.vue';
import UserRegister from '@/pages/UserRegister.vue';
import UserSettings from '@/pages/UserSettings.vue';

import VueChartkick from 'vue-chartkick';
import 'chartkick/chart.js';

import vue3GoogleLogin from 'vue3-google-login';

const gauthOptions = {
  clientId:
    '83704981457-mlre2hfojutr2e8m7e6s96h4th3b6dme.apps.googleusercontent.com',
};

const routes = [
  { path: '/', component: MainPage },
  { path: '/me', component: UserProfile },
  { path: '/login', component: UserLogin },
  { path: '/register', component: UserRegister },
  { path: '/settings', component: UserSettings },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);
app.use(vue3GoogleLogin, gauthOptions);
app.use(router);
app.use(VueChartkick);
app.use(createPinia());
app.mount('#app');
