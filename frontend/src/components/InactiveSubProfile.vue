<script>
import axios from 'axios';

import { generalStore } from '@/stores/generalStore';
import { userStore } from '@/stores/userStore';
import FormMessages from '@/components/FormMessages.vue';

import { setUserState } from '@/composables/userState';

export default {
  setup() {
    const user = userStore();
    const store = generalStore();
    return {
      user,
      store,
    };
  },
  data() {
    return {
      messages: [],
      name: 'John Doe',
      email: this.user.email,
      cardNumber: '1111 2222 3333 4444',
      cardExpiry: '12/26',
      cardCvc: '123',
    };
  },
  methods: {
    subscribe() {
      this.messages = [];
      const url = `${this.store.apiUrl}/user/subscribe`;
      const config = {
        headers: {
          Authorization: `Bearer ${this.user.token}`,
        },
      };
      axios
        .post(
          url,
          {
            name: this.name,
            email: this.email,
            cardNumber: this.cardNumber,
            cardExpiry: this.cardExpiry,
            cardCvc: this.cardCvc,
          },
          config,
        )
        .then((response) => {
          this.user.hasActiveSubscription = true;
          this.user.subscriptionEndDate = response.data.subscriptionEndDate;
          this.user.subscriptionStartDate = response.data.subscriptionStartDate;
          setUserState(this.user);
          // this.$router.push('/');
          this.$router.go();
        })
        .catch((error) => {
          console.error(error);
          this.messages.push({
            type: 'error',
            text: error.response.data.message,
          });
        });
    },
  },
  components: {
    FormMessages,
  },
};
</script>

<template>
  <h2 class="profile-message">You currently have no active subscription!</h2>
  <h3 class="profile-message">
    Please fill in your credit card information below:
  </h3>
  <FormMessages :messages="messages" />
  <form @submit.prevent="subscribe">
    <div class="form-group">
      <label for="name">Name</label>
      <input type="text" class="form-control" id="name" v-model="name" />
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" class="form-control" id="email" v-model="email" />
    </div>
    <div class="form-group">
      <label for="card-number">Card Number</label>
      <input
        type="text"
        class="form-control"
        id="card-number"
        v-model="cardNumber"
      />
    </div>
    <div class="form-group">
      <label for="card-expiry">Expiration Date</label>
      <input
        type="text"
        class="form-control"
        id="card-expiry"
        v-model="cardExpiry"
      />
    </div>
    <div class="form-group">
      <label for="card-cvc">CVC</label>
      <input type="text" class="form-control" id="card-cvc" v-model="cardCvc" />
    </div>
    <button type="submit" class="btn btn-primary" id="subscribe-button">Subscribe!</button>
  </form>
</template>

<style>
h2.profile-message,
h3.profile-message {
  text-align: center;
  font-family: 'Gentium Plus', serif;
}
h2.profile-message {
  font-size: 1.2rem;
}
h3.profile-message {
  font-size: 1rem;
}
input[type='email'],
input[type='text'] {
  font-family: 'Gentium Plus', serif;
}
</style>
