<template>
  <div class="register-form">
    <h1>Register</h1>
    <FormMessages :messages="messages" />
    <form @submit.prevent="register">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" class="form-control" id="email" v-model="email" />
      </div>
      <div class="form-group form-group-pass">
        <label for="password">Password</label>
        <input
          type="password"
          class="form-control"
          id="password"
          v-model="password"
        />
      </div>
      <button type="submit" class="btn btn-primary" id="register-button">Register</button>
    </form>
    <div class="separator">
      <hr />
      <div class="hr-or"><span>OR</span></div>
    </div>
    <div class="login-extras">
      <GoogleLogin :callback="googleLoginCallback" prompt />
      <div class="extra-message">
        <p>
          Already have an account? Click
          <router-link to="/login" class="register-login-link">here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { decodeCredential } from 'vue3-google-login';

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
      email: '',
      password: '',
    };
  },
  methods: {
    googleLoginCallback(response) {
      const decoded = decodeCredential(response.credential);
      const url = `${this.store.apiUrl}/auth/lookup`;
      axios
        .post(url, {
          email: decoded.email,
          password: decoded.jti,
        })
        .then((lookup) => {
          setUserState({
            id: decoded.sub,
            type: 'google',
            email: decoded.email,
            token: response.credential,
            isLoggedIn: true,
            hasActiveSubscription: lookup.data.hasActiveSubscription,
            subscriptionStartDate: lookup.data.subscriptionStartDate,
            subscriptionEndDate: lookup.data.subscriptionEndDate,
          });

          // Redirect to the user's profile page
          this.$router.push('/me');
        })
        .catch((error) => {
          this.messages.push({
            type: 'danger',
            message: error.response.data.message,
          });
        });
    },
    register() {
      this.messages = [];
      // Create an axios request to the backend login endpoint
      const url = `${this.store.apiUrl}/auth/signup`;
      axios
        .post(url, {
          email: this.email,
          password: this.password,
        })
        .then((response) => {
          // If the request was successful,
          // set the user token and redirect to the main page
          const token = response.data.access_token;
          const decoded = jwt_decode(token);

          setUserState({
            id: decoded.sub,
            type: 'local',
            token,
            email: decoded.email,
            isLoggedIn: true,
            hasActiveSubscription: decoded.hasActiveSubscription ? true : false,
            subscriptionStartDate: decoded.subscriptionStartDate
              ? decoded.subscriptionStartDate
              : null,
            subscriptionEndDate: decoded.subscriptionEndDate
              ? decoded.subscriptionEndDate
              : null,
          });

          // Redirect to the user's profile page
          this.$router.push('/me');
        })
        .catch((error) => {
          console.error(error);
          // If the request was unsuccessful,
          // add an error message to the errors array
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
