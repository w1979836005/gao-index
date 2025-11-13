<template>
  <div id="app">
    <n-message-provider>
      <router-view></router-view>
    </n-message-provider>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'

//初始化函数
const doInit = () => {
  // 初始化应用
}

//页面挂载后初始化
onMounted(() => {
  doInit()
})
</script>

<style scoped></style>
