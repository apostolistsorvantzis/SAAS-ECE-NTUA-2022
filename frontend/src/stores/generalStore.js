import { defineStore } from 'pinia';

export const generalStore = defineStore('general', {
  state: () => {
    return {
      apiUrl: 'http://localhost:3333',
      socketUrlATL: 'ws://localhost:3320/ws',
      socketUrlCBF: 'ws://localhost:3321/ws',
      socketUrlGPT: 'ws://localhost:3322/ws',
    };
  },
});
