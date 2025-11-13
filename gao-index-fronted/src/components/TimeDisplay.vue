<template>
  <div id="time-display">{{ formatedTime }}</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

//首次获取时间
const now = ref(new Date())

//获取格式化获取的时间 -由于这里多次会获取到相同的，可以使用计算属性优化
const formatedTime = computed(() => {
  const hours = String(now.value.getHours()).padStart(2, '0')
  const minutes = String(now.value.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
})

//定时器变量  -如果未被销毁，则一直执行
let timer: null | number = null

//组件挂载时，执行连续定时器
onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

//组件销毁时，也销毁掉timer
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped lang="scss">
#time-display {
  color: #ffffff;
  font-size: 48px;
}
</style>
