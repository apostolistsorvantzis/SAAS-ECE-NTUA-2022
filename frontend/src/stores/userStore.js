import { defineStore } from 'pinia';

export const userStore = defineStore('user', {
  state: () => {
    return {
      id: localStorage.getItem('id') || null,
      type: localStorage.getItem('type') || null,
      token: localStorage.getItem('token') || null,
      email: localStorage.getItem('email') || null,
      isLoggedIn: localStorage.getItem('token') || false,
      hasActiveSubscription:
        localStorage.getItem('hasActiveSubscription') || false,
      subscriptionStartDate:
        localStorage.getItem('subscriptionStartDate') || null,
      subscriptionEndDate: localStorage.getItem('subscriptionEndDate') || null,
    };
  },
});
