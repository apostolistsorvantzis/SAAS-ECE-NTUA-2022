<script>
import { userStore } from '@/stores/userStore';
export default {
  setup() {
    const user = userStore();
    // calculate the subscription end date
    const subscriptionEndDate = new Date(parseInt(user.subscriptionEndDate));
    const subscriptionStartDate = new Date(
      parseInt(user.subscriptionStartDate),
    );
    const email = user.email;

    return {
      email,
      subscriptionEndDate,
      subscriptionStartDate,
    };
  },
};
</script>

<template>
  <h2>Welcome!</h2>
  <p>
    You are logged in as: <strong>{{ email }}</strong>
  </p>
  <p>
    Your subscription started on:
    <strong>{{ subscriptionStartDate }}</strong>
  </p>
  <p>
    Your subscription will expire on:
    <strong>{{ subscriptionEndDate }}</strong>
  </p>
</template>
