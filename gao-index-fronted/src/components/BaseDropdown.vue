<template>
  <div id="base-dropdown">
    <!--    触发器-->
    <div @click="toggleDropdown">
      <slot></slot>
    </div>
    <!--    下拉内容插槽-->
    <Transition name="dropdown">
      <div
        v-show="isVisible"
        class="dropdown-content"
        :class="`dropdown-${props.position}-${props.align}`"
        @click.stop
      >
        <slot name="dropdown"></slot>
      </div>
    </Transition>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// 定义组件属性
interface Props {
  position?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
}

// 默认属性
const props = withDefaults(defineProps<Props>(), {
  position: 'bottom',
  align: 'center',
})

//控制下拉菜单的显隐
const isVisible = ref(false)
//控制下拉状态的显示隐藏
const toggleDropdown = (event: MouseEvent) => {
  event.stopPropagation() //阻止事件冒泡
  isVisible.value = !isVisible.value
}

//单击其他地方关闭
const handleClickOutside = () => {
  isVisible.value = false
}

//组件挂载
onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

//组件销毁时去掉事件
onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
#base-dropdown {
  position: relative;
  display: inline-block;

  .dropdown-content {
    position: absolute;
    z-index: 1000; // 确保下拉内容在最上层
    min-width: 120px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 2px 0;
    overflow: hidden; // 防止子元素溢出圆角

    // 默认位置 - 下方中心对齐
    &.dropdown-bottom-center {
      top: calc(100% + 4px);
      left: 50%;
      transform: translateX(-50%);
      transform-origin: top center;
    }

    // 下方左对齐
    &.dropdown-bottom-start {
      top: calc(100% + 4px);
      left: 0;
      transform-origin: top left;
    }

    // 下方右对齐
    &.dropdown-bottom-end {
      top: calc(100% + 4px);
      right: 0;
      transform-origin: top right;
    }

    // 上方中心对齐
    &.dropdown-top-center {
      bottom: calc(100% + 4px);
      left: 50%;
      transform: translateX(-50%);
      transform-origin: bottom center;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
    }

    // 上方左对齐
    &.dropdown-top-start {
      bottom: calc(100% + 4px);
      left: 0;
      transform-origin: bottom left;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
    }

    // 上方右对齐 - 右上方
    &.dropdown-top-end {
      bottom: calc(100% + 4px);
      right: 0;
      transform-origin: bottom right;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
    }

    // 左侧中心对齐
    &.dropdown-left-center {
      top: 50%;
      right: calc(100% + 4px);
      transform: translateY(-50%);
      transform-origin: right center;
    }

    // 左侧上对齐
    &.dropdown-left-start {
      top: 0;
      right: calc(100% + 4px);
      transform-origin: right top;
    }

    // 左侧下对齐
    &.dropdown-left-end {
      bottom: 0;
      right: calc(100% + 4px);
      transform-origin: right bottom;
    }

    // 右侧中心对齐
    &.dropdown-right-center {
      top: 50%;
      left: calc(100% + 4px);
      transform: translateY(-50%);
      transform-origin: left center;
    }

    // 右侧上对齐
    &.dropdown-right-start {
      top: 0;
      left: calc(100% + 4px);
      transform-origin: left top;
    }

    // 右侧下对齐
    &.dropdown-right-end {
      bottom: 0;
      left: calc(100% + 4px);
      transform-origin: left bottom;
    }
  }
}
// 定义下拉菜单的淡入淡出动画
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

// 进入动画起始状态和离开动画结束状态
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
}

// 根据位置设置不同的动画效果
.dropdown-top.dropdown-enter-from,
.dropdown-top.dropdown-leave-to {
  transform: scaleY(0.8) translateY(8px);
}

.dropdown-bottom.dropdown-enter-from,
.dropdown-bottom.dropdown-leave-to {
  transform: scaleY(0.8) translateY(-8px);
}

.dropdown-left.dropdown-enter-from,
.dropdown-left.dropdown-leave-to {
  transform: scaleX(0.8) translateX(-8px);
}

.dropdown-right.dropdown-enter-from,
.dropdown-right.dropdown-leave-to {
  transform: scaleX(0.8) translateX(8px);
}
</style>
