<template>
  <div id="search-input">
    <!-- 加载状态 -->
    <div v-if="configService.isLoadingConfig()" class="loading">
      <n-spin size="small" />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="configService.getError()" class="error">
      <n-alert type="error" size="small" title="配置加载失败">
        {{ configService.getError() }}
      </n-alert>
    </div>

    <!-- 正常显示 -->
    <template v-else>
      <div class="current-search">{{ currentSearchEngine?.name }}</div>
      <div
        class="search-wrapper"
        ref="searchWrapperRef"
        @click="handleClickInside"
        :class="{ 'is-active': isSearchActive }"
      >
        <!--      搜索容器 这里注意放在首位，方便css的兄弟选择器使用-->
        <input
          class="search"
          placeholder="search..."
          v-model="searchText"
          @keydown.enter="handleSearch"
          @focus="handleSearchFocus"
          @blur="handleSearchBlur"
          ref="searchInputRef"
        />
        <!--下拉-->

        <base-dropdown class="search-source-dropdown">
          <!-- 默认插槽     左侧搜索按钮-->
          <div class="search-tools">
            <n-button round quaternary class="search-button">
              <img src="@/assets/searchInput/tool-icon.png" alt="tool-icon" srcset="" width="28" />
            </n-button>
          </div>

          <!-- 具名插槽 dropdown：作为下拉内容 -->
          <template #dropdown>
            <div class="dropdown-menu">
              <div
                class="dropdown-item"
                v-for="engine in configService.getSearchEngines()"
                :key="engine.id"
                :class="{ active: currentSearchEngine?.id === engine.id }"
                @click="toggleSearchEngine(engine.id)"
              >
                {{ engine.name }}
              </div>
            </div>
          </template>
        </base-dropdown>

        <!--      搜索按钮-->
        <div class="search-icon">
          <n-button round quaternary class="search-button" @click="handleSearch">
            <img src="@/assets/searchInput/search.png" alt="search" srcset="" width="20" />
          </n-button>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import BaseDropdown from '@/components/BaseDropdown.vue'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { configService, type Config } from '@/services/configService'

// 定义事件
const emit = defineEmits<{
  searchFocus: [isFocused: boolean]
}>()

// 搜索状态
const searchText = ref('')
const isSearchActive = ref(false)
const searchWrapperRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const config = ref<Config | null>(null)
const isSearchFocused = ref(false)

// 计算属性
const currentSearchEngine = computed(() => configService.getDefaultSearchEngine())

// 切换搜索引擎
const toggleSearchEngine = (engineId: string) => {
  const success = configService.setDefaultSearchEngine(engineId)
  console.log(success)

  isSearchActive.value = false
  // 切换后重新获得焦点
  setTimeout(() => {
    searchInputRef.value?.focus()
  }, 100)
}

// 搜索框 focus 事件
const handleSearchFocus = () => {
  isSearchFocused.value = true
  emit('searchFocus', true)
}

// 搜索框 blur 事件
const handleSearchBlur = () => {
  // 延迟处理 blur，避免点击下拉菜单时过早触发
  setTimeout(() => {
    isSearchFocused.value = false
    emit('searchFocus', false)
  }, 150)
}

// 搜索功能
const handleSearch = () => {
  const engine = currentSearchEngine.value
  if (!searchText.value.trim() || !engine) return

  const searchTargetUrl = `${engine.baseUrl}${encodeURIComponent(searchText.value)}`

  // 执行搜索（新窗口打开）
  window.open(searchTargetUrl, '_blank')

  searchText.value = ''
}

// 处理在搜索区域内部的点击
const handleClickInside = () => {
  isSearchActive.value = true
  // 点击搜索区域时，让输入框获得焦点
  searchInputRef.value?.focus()
}

// 处理在搜索区域外部的点击
const handleClickOutside = (event: MouseEvent) => {
  if (searchWrapperRef.value && !searchWrapperRef.value.contains(event.target as Node)) {
    isSearchActive.value = false
  }
}

// 初始化配置
const initConfig = async () => {
  try {
    config.value = await configService.loadConfig()
  } catch (error) {
    // 配置加载失败时静默处理
    console.log(error)
  }
}

// 生命周期
onMounted(() => {
  initConfig()
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
#search-input {
  //搜索框
  .search {
    margin: 0 auto;
    width: 720px;
    height: 36px;
    border-radius: 50px;
    background: rgba(0, 0, 0, 0.1);
    border: none;
    transition: all 0.3s ease;
    outline: none;
    padding: 5px 18px;
    color: #ffffff;
    font-size: 18px;

    // 平板设备
    @media (max-width: 768px) {
      width: 100%;
      max-width: none;
      font-size: 16px; // 防止iOS自动缩放
      padding: 8px 50px; // 左右留出按钮空间
    }

    // 手机设备
    @media (max-width: 480px) {
      width: 100%;
      max-width: none;
      font-size: 16px; // 防止iOS自动缩放
      padding: 8px 50px; // 左右留出按钮空间
    }

    line-height: 18px;
    text-align: center;
    //鼠标hover
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    //鼠标单击
    &:focus {
      background: rgba(0, 0, 0, 0.2);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
      // --- 关键修改：在 focus 时隐藏 placeholder ---
      &::placeholder {
        color: transparent; // 将字体颜色设为透明，实现隐藏
      }
      &::-webkit-input-placeholder {
        color: transparent;
      }
      &::-moz-placeholder {
        color: transparent;
        opacity: 1;
      }
      &:-ms-input-placeholder {
        color: transparent;
      }
    }

    &::placeholder {
      color: #ffffff;
      font-size: 18px;
      letter-spacing: 1px;
    }

    // WebKit (Chrome, Safari, Edge, Opera)
    &::-webkit-input-placeholder {
      color: #ffffff;
      font-size: 18px;
      letter-spacing: 1px;
    }
    // Mozilla (Firefox)
    &::-moz-placeholder {
      color: #ffffff;
      font-size: 18px;
      letter-spacing: 1px;
      opacity: 1; // Firefox 默认会给 placeholder 设置透明度，需要覆盖
    }
    // IE (Internet Explorer 10+)
    &:-ms-input-placeholder {
      color: #ffffff;
      font-size: 18px;
      letter-spacing: 1px;
    }
  }
}

//搜索容器
#search-input .search-wrapper {
  position: relative;

  // --- 关键修改：定位整个 dropdown 组件 ---
  .search-source-dropdown {
    position: absolute;
    top: 4px;
    left: 4px;
    // 默认隐藏，并添加过渡动画
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  //左侧工具源选择
  //.search-tools {
  //  position: absolute;
  //  top: 4px;
  //  left: 4px;
  //  //默认消失 动画显示
  //  opacity: 0;
  //  transition: opacity 0.2s ease;
  //}
  //右侧搜索按钮
  .search-icon {
    position: absolute;
    top: 4px;
    right: 4px;
    //默认消失 动画显示
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  //搜索按钮样式 -左侧和右侧
  .search-button {
    padding: 5px !important;
    height: 28px !important;
  }
}

//搜索容器交互
//#search-input .search-wrapper {
//  // --- 关键修改：更新选择器 ---
//  // 1. 使用 .search-source-dropdown 而不是 #base-dropdown .search-tools
//  // 2. 这样我们控制的是整个组件容器的透明度
//  .search:focus ~ .search-source-dropdown,
//  .search:focus ~ .search-icon {
//    opacity: 1;
//  }
//}
//搜索容器交互
#search-input .search-wrapper {
  // --- 关键修改：使用 .is-active class 来控制显示 ---
  // 当 .is-active class 存在时，显示按钮
  &.is-active .search-source-dropdown,
  &.is-active .search-icon {
    opacity: 1;
  }
}

//下拉框样式
.dropdown-item {
  cursor: pointer;
  text-align: center;
  font-size: 14px;
}

.dropdown-item:hover {
  background: rgba(0, 0, 0, 0.2);
}
.active {
  background: rgba(0, 0, 0, 0.2);
}

.current-search {
  margin-bottom: 16px;
  width: 100%;
  text-align: center;
  color: white;
}

// 加载和错误状态
.loading,
.error {
  margin: 20px 0;
  text-align: center;
}

.engine-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border-radius: 2px;
}
</style>
