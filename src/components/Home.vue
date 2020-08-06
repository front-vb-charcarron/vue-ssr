<template>
  <div class="home">
    <span>This is home</span>
    <div class="jump" @click="toFoo">toFoo</div>
  </div>
</template>
<script>
export default {
  methods: {
    toFoo() {
      this.$router.push({ name: 'foo', params: { id: 12 } });
    }
  }
};
</script>
<style lang="scss">
.jump {
  background: skyblue;
  cursor: pointer;
  display: inline-block;
  color: pink;
}
</style>
