<script>
import { generalStore } from '@/stores/generalStore';
import { userStore } from '@/stores/userStore';

import ATL from '@/components/ATL.vue';
import CBF from '@/components/CBF.vue';
import GPT from '@/components/GPT.vue';

export default {
  components: {
    ATL,
    CBF,
    GPT,
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
      socketUrlATL: this.store.socketUrlATL,
      socketUrlCBF: this.store.socketUrlCBF,
      socketUrlGPT: this.store.socketUrlGPT,
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
};
</script>

<template>
  <ATL :socketUrl="socketUrlATL" />
  <CBF :socketUrl="socketUrlCBF" />
  <GPT :socketUrl="socketUrlGPT" />
</template>
