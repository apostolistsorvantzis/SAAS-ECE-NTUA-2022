<script>
import { userStore } from '@/stores/userStore';

import ActiveSubProfile from '@/components/ActiveSubProfile.vue';
import InactiveSubProfile from '@/components/InactiveSubProfile.vue';

export default {
  components: {
    ActiveSubProfile,
    InactiveSubProfile,
  },
  setup() {
    const user = userStore();
    return {
      user,
    };
  },
  data() {
    return {
      status: false,
    };
  },
  mounted() {
    if (!this.user.isLoggedIn) {
      this.$router.push('/login');
    }
    if (
      !this.user.hasActiveSubscription ||
      this.user.subscriptionEndDate < new Date()
    ) {
      this.user.hasActiveSubscription = false;
      this.status = false;
    } else {
      this.status = true;
    }
  },
};
</script>
<template>
  <h1>Profile</h1>
  <div class="profile">
    <div v-if="status">
      <ActiveSubProfile />
    </div>
    <div v-else>
      <InactiveSubProfile />
    </div>
  </div>
</template>

<style>
.profile {
  padding: 24px;
  border: 1px solid #efefef;
  border-radius: 4px;
  background-color: #fefefe;
}
</style>
