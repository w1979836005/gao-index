<template>
  <!--  首页-->
  <div id="homePage" :class="{ 'search-focused': isSearchFocused }">
    <!--    背景图片-->
    <div
      class="background-image"
      :style="{ backgroundImage: `url(${backgroundImages[currentBackgroundIndex]})` }"
    ></div>

    <!--    遮罩层-->
    <div class="overlay"></div>

    <!--    内容容器-->
    <div class="content-container">
      <!--    顶部盒子-->
      <div class="top-container">
        <!--        时间组件-->
        <time-display />
        <!--      主要搜索组件-->
        <search-input @search-focus="handleSearchFocus" />
      </div>
      <!--    底部盒子-->
      <div class="bottom-container">
        <!--        收藏夹-->
        <!--        <div class="collection-box">-->
        <!--          <div class="collection-item">-->
        <!--            <div class="title">学习</div>-->
        <!--          </div>-->
        <!--          <div class="collection-item">-->
        <!--            <div class="title">oj</div>-->
        <!--          </div>-->
        <!--          <div class="collection-item"></div>-->
        <!--          <div class="collection-item"></div>-->
        <!--        </div>-->
        <!--        设置dropdown-->
        <base-dropdown class="setting-dropdown" position="top" align="end">
          <!-- 默认插槽 - 设置图标按钮 -->
          <img
            src="@/assets/settings.png"
            class="setting-icon"
            :class="{ paused: isSettingHovered || isSettingClicked }"
            alt="setting"
            srcset=""
            width="32"
            @mouseenter="handleSettingMouseEnter"
            @mouseleave="handleSettingMouseLeave"
          />

          <!-- 具名插槽 - 下拉内容 -->
          <template #dropdown>
            <div class="setting-menu">
              <div class="menu-item" @click="handleImportConfig">
                <span class="menu-text">导入配置</span>
              </div>
              <div class="menu-item" @click="handleExportConfig">
                <span class="menu-text">导出配置</span>
              </div>
              <div class="menu-item" @click="handleResetConfig">
                <span class="menu-text">重置配置</span>
              </div>
              <!--              <div class="menu-item" @click="handleBackgroundSwitch">-->
              <!--                <span class="menu-text">切换背景</span>-->
              <!--              </div>-->
            </div>
          </template>
        </base-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TimeDisplay from '@/components/TimeDisplay.vue'
import SearchInput from '@/components/SearchInput.vue'
import BaseDropdown from '@/components/BaseDropdown.vue'
import { configService } from '@/services/configService'
import { useMessage } from 'naive-ui'

// 搜索框状态
const isSearchFocused = ref(false)

// 设置图标状态
const isSettingHovered = ref(false)
const isSettingClicked = ref(false)

// 背景图片状态
const currentBackgroundIndex = ref(0)
const backgroundImages = [
  new URL('@/assets/backgroundImg/bg1.webp', import.meta.url).href,
  // 暂时只使用一张图片，等有其他背景图片时再添加
]

// 初始化背景图片
const initBackground = () => {
  const savedIndex = localStorage.getItem('gao-background-index')
  if (savedIndex) {
    currentBackgroundIndex.value = parseInt(savedIndex)
  }
}

// 处理搜索框 focus 状态变化
const handleSearchFocus = (focused: boolean) => {
  isSearchFocused.value = focused
}

// 处理设置图标鼠标进入
const handleSettingMouseEnter = () => {
  isSettingHovered.value = true
}

// 处理设置图标鼠标离开
const handleSettingMouseLeave = () => {
  isSettingHovered.value = false
}

const message = useMessage()
// 导入配置
const handleImportConfig = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const config = JSON.parse(text)

      // 使用配置服务保存用户导入的配置
      configService.saveUserConfig(config)

      message.success('配置导入成功！已立即应用新配置。')

      // 重新加载配置以更新UI
      await configService.loadConfig()
    } catch (error) {
      alert('配置导入失败: ' + (error as Error).message)
    }
  }

  input.click()
}

// 导出配置
const handleExportConfig = () => {
  const config = configService.getConfig()
  if (!config) {
    alert('无法获取配置信息')
    return
  }

  const dataStr = JSON.stringify(config, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'gao-config.json'
  link.click()

  URL.revokeObjectURL(url)
}

// 重置为默认配置
const handleResetConfig = () => {
  message.success('已重置为默认配置')
}

// 切换背景图片
// const handleBackgroundSwitch = () => {
//   currentBackgroundIndex.value = (currentBackgroundIndex.value + 1) % backgroundImages.length
//
//   // 保存背景设置到 localStorage
//   localStorage.setItem('gao-background-index', currentBackgroundIndex.value.toString())
// }

// 组件挂载时初始化
onMounted(() => {
  initBackground()
})
</script>

<style scoped lang="scss">
//首页样式
#homePage {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  z-index: 0;

  // 背景图片
  .background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    transition: all 0.5s ease;
    transform: scale(1);
  }

  // 遮罩层
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
  }

  // 内容容器
  .content-container {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  // 搜索框聚焦时的效果
  &.search-focused {
    .background-image {
      transform: scale(1.2);
    }

    .overlay {
      background: rgba(0, 0, 0, 0.6);
    }
  }
}

//页面内两个容器
#homePage .content-container {
  //顶部容器
  .top-container {
    width: 100%;
    height: 50vh;
    position: relative;

    //登录按钮样式
    .login-button {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 10;
    }

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  //底部容器
  .bottom-container {
    width: 100%;
    height: 50vh;
    position: relative;
    display: flex;
    align-items: flex-end;
    padding-bottom: 32px;
    justify-content: center;

    .setting-dropdown {
      position: absolute;
      bottom: 32px;
      right: 32px;
    }

    .setting-icon {
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;

      // 持续旋转动画
      animation: rotate 4s linear infinite;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      // 暂停动画
      &.paused {
        animation-play-state: paused;
      }
    }

    // 设置菜单样式
    .setting-menu {
      min-width: 120px;
      background: rgba(255, 255, 255, 0.01);
      border-radius: 8px;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }

      .menu-text {
        text-align: center;
        flex: 1;
        font-size: 12px;
        color: white;
      }

      .menu-badge {
        font-size: 12px;
        padding: 2px 8px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        color: #666;
        font-weight: 600;
        text-transform: uppercase;
      }
    }

    // 旋转动画定义
    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }
}

.collection-box {
  width: 80%;
  height: 68px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .collection-item {
    cursor: pointer;
    width: 48px;
    height: 48px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    transition: transform 0.2s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    .title {
      color: white;
      font-size: 12px;
    }
    &:hover {
      transform: translateY(-10px) scale(1.1);
    }
  }
}
</style>
