<template>
  <h1>Settings</h1>
  <FormMessages :messages="messages" />
  <form @submit.prevent="deleteAccount">
    <button type="submit" id="delete-account">Delete User Account</button>
  </form>
</template>

<script>
import axios from 'axios';

import { generalStore } from '@/stores/generalStore';
import { userStore } from '@/stores/userStore';
import FormMessages from '@/components/FormMessages.vue';

import { cleanUserState } from '@/composables/userState';

export default {
  components: {
    FormMessages,
  },
  setup() {
    const store = generalStore();
    const user = userStore();
    return {
      store,
      user,
    };
  },
  data() {
    return {
      messages: [],
    };
  },
  async mounted() {
    // Guard clauses
    if (!this.user.token) {
      this.$router.push('/login');
    }
    if (!this.user.hasActiveSubscription) {
      this.$router.push('/me');
    }
    if (this.user.subscriptionEndDate < new Date()) {
      this.user.hasActiveSubscription = false;
      this.$router.push('/me');
    }
  },
  methods: {
    deleteAccount() {
      this.messages = [];
      const url = `${this.store.apiUrl}/user/delete`;
      axios
        .post(url, {
          token: this.user.token,
        })
        .then(() => {
          cleanUserState();
          this.$router.push('/login');
        })
        .catch((error) => {
          this.messages.push({
            type: 'error',
            message: error.response.data.message,
          });
        });


    }
  }
}
</script>

<style>
  #delete-account {
    background-color: #d9534f;
    border-color: #d43f3a;
  }
  #delete-account:hover {
    background-color: #c9302c;
    border-color: #ac2925;
  }
</style>