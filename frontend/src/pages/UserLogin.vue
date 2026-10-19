<template>
  <div class="login-form">
    <h1>Login</h1>
    <FormMessages :messages="messages" />
    <form @submit.prevent="login">
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
      <button id="login-button" type="submit" class="btn btn-primary">Login</button>
    </form>
    <div class="separator">
      <hr />
      <div class="hr-or"><span>OR</span></div>
    </div>
    <div class="login-extras">
      <GoogleLogin :callback="googleLoginCallback" prompt />
      <div class="extra-message">
        <p>No account? Click <router-link to="/register" class="register-login-link">here</router-link></p>
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
    login() {
      this.messages = [];
      // Create an axios request to the backend login endpoint
      // with the email and password that the user entered
      const url = `${this.store.apiUrl}/auth/signin`;
      // Do axios request
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
          // Update session
          setUserState({
            id: decoded.sub,
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
          // console.error(error);
          // If the request was not successful,
          // show the error message
          this.messages.push({
            type: 'error',
            text: error.response.data.message,
          });
        });
    },
  },
  mounted() {},
  components: { FormMessages },
};
</script>

<style>
.login-extras {
  text-align: center;
}
label,
input,
button {
  font-family: 'Gentium Plus', serif;
}
.form-group-pass {
  margin-top: 12px;
}
label {
  font-size: 1.2rem;
}
h1 {
  font-family: 'Gentium Plus', serif;
  font-weight: 700;
  text-align: center;
  color: #333;
}
.extra-message {
  margin-top: 48px;
  text-align: center;
}
.extra-message p {
  font-size: 0.8em;
  color: #aaa;
  font-style: italic;
}
.separator {
  position: relative;
  margin-top: 12px;
  margin-bottom: 48px;
}
hr {
  position: absolute;
  left: 0;
  right: 0;
}
.hr-or {
  position: absolute;
  top: 4px;
  left: 0;
  right: 0;
  margin: auto;
  width: 100%;
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
  color: #ccc;
}
.hr-or span {
  background-color: #fff;
  padding: 0 8px;
}
button {
  margin-top: 20px;
}

div#app,
div#app-container {
  background-color: #dedede;
}

div#app-container {
  border: 5px solid #ccc;
}
button {
  background-color: #42ba96;
  display: block;
  width: 100%;
}
button:hover {
  background-color: #16cf98;
  border: 1px solid #fff;
  cursor: pointer;
}
.register-form,
.login-form {
  max-width: 400px;
  margin: 12px auto;
  border: 2px solid #ccc;
  border-radius: 5px;
  padding: 0 24px;
  background-color: #fff;
}

.google-btn {
  width: 184px;
  height: 42px;
  background-color: #4285f4;
  border-radius: 2px;
  box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.25);
  margin: 0 auto;
}
.google-btn .google-icon-wrapper {
  position: absolute;
  margin-top: 1px;
  margin-left: 1px;
  width: 40px;
  height: 40px;
  border-radius: 2px;
  background-color: #fff;
}
.google-btn .google-icon {
  position: absolute;
  margin-top: 11px;
  margin-left: 11px;
  width: 18px;
  height: 18px;
}
.google-btn .btn-text {
  float: right;
  margin: 11px 11px 0 0;
  color: #fff;
  font-size: 14px;
  letter-spacing: 0.2px;
  font-family: 'Roboto';
}
.google-btn:hover {
  box-shadow: 0 0 6px #4285f4;
  cursor: pointer;
}
.google-btn:active {
  background: #1669f2;
}
</style>
