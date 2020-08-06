<template>
  <div class="foo">
    <span>This is foos</span>
    <span>{{ item.title }}</span>
  </div>
</template>
<script>
export default {
  asyncData({ store, route }) {
    // console.log(route.params.id);
    return store.dispatch('fetchItem', route.params.id);
  },
  computed: {
    item() {
      return this.$store.getters.items[this.$route.params.id];
    }
  }
};
</script>
