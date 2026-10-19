<script>
export default {
  props: {
    messages: {
      type: Array,
      default: () => [],
    },
  },
};
</script>
<template>
  <div class="messages">
    <div v-for="message in messages" :key="message.status">
      <div class="message" v-bind:class="{ error: message.type === 'error' }">
        {{ message.text }}
      </div>
    </div>
  </div>
</template>
<style>
.messages .error {
  color: red;
  padding: 12px;
  border: 1px solid red;
  border-radius: 4px;
  background-color: #f2dede;
}
</style>
