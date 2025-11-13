/**
 * 配置文件服务
 * 负责加载和管理配置文件
 */

import { ref } from 'vue'
import defaultConfigData from '@/assets/gao-config.json'

// 搜索引擎接口定义
export interface SearchEngine {
  id: string
  name: string
  baseUrl: string
}

// 配置接口定义
export interface Config {
  version: string
  name: string
  description: string
  searchEngines: {
    default: string
    engines: SearchEngine[]
  }
}

class ConfigService {
  private config = ref<Config | null>(null)
  private isLoading = ref(false)
  private error = ref<string | null>(null)

  /**
   * 加载配置文件
   */
  async loadConfig(): Promise<Config> {
    this.isLoading.value = true
    this.error.value = null

    try {
      let configData: Config

      // 首先尝试从localStorage加载用户导入的配置
      const savedConfig = localStorage.getItem('gao-user-config')
      if (savedConfig) {
        try {
          configData = JSON.parse(savedConfig)
        } catch (parseError) {
          configData = defaultConfigData as Config
        }
      } else {
        // 没有用户配置，使用默认配置文件
        configData = defaultConfigData as Config
      }

      // 验证配置文件格式
      this.validateConfig(configData)

      this.config.value = configData

      return configData
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : '配置加载失败'

      // 返回默认配置
      const defaultConfig = this.getDefaultConfig()
      this.config.value = defaultConfig
      return defaultConfig
    } finally {
      this.isLoading.value = false
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): Config | null {
    return this.config.value
  }

  /**
   * 获取搜索引擎列表
   */
  getSearchEngines(): SearchEngine[] {
    if (!this.config.value) return []
    return this.config.value.searchEngines.engines
  }

  /**
   * 获取默认搜索引擎
   */
  getDefaultSearchEngine(): SearchEngine | null {
    if (!this.config.value) return null

    const defaultId = this.config.value.searchEngines.default
    return (
      this.config.value.searchEngines.engines.find(
        (engine) => engine.id === defaultId,
      ) || null
    )
  }

  /**
   * 设置默认搜索引擎
   */
  setDefaultSearchEngine(engineId: string): boolean {
    if (!this.config.value) return false

    const engine = this.config.value.searchEngines.engines.find((e) => e.id === engineId)
    if (engine) {
      this.config.value.searchEngines.default = engineId
      return true
    }
    return false
  }

  /**
   * 保存用户导入的配置到localStorage
   */
  saveUserConfig(config: Config): void {
    try {
      // 验证配置格式
      this.validateConfig(config)

      // 保存到localStorage
      localStorage.setItem('gao-user-config', JSON.stringify(config))

      // 更新当前配置
      this.config.value = config
    } catch (error) {
      throw new Error(`保存配置失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 清除用户配置（恢复默认配置）
   */
  clearUserConfig(): void {
    localStorage.removeItem('gao-user-config')
  }

  /**
   * 通过后端API更新配置文件（开发环境）
   */
  async updateConfigFile(config: Config): Promise<boolean> {
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '更新配置文件失败')
      }

      const result = await response.json()
      return result.status === 'SUCCESS'
    } catch (error) {
      console.error('更新配置文件失败:', error)
      throw error
    }
  }

  /**
   * 从后端API获取当前配置文件
   */
  async fetchConfigFile(): Promise<Config | null> {
    try {
      const response = await fetch('/api/config')

      if (!response.ok) {
        throw new Error('获取配置文件失败')
      }

      const result = await response.json()
      return result.status === 'SUCCESS' ? result.data : null
    } catch (error) {
      console.error('获取配置文件失败:', error)
      return null
    }
  }

  /**
   * 备份当前配置文件
   */
  async backupConfigFile(): Promise<string | null> {
    try {
      const response = await fetch('/api/config/backup', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '备份配置文件失败')
      }

      const result = await response.json()
      return result.status === 'SUCCESS' ? result.backupFileName : null
    } catch (error) {
      console.error('备份配置文件失败:', error)
      return null
    }
  }

  /**
   * 获取加载状态
   */
  isLoadingConfig(): boolean {
    return this.isLoading.value
  }

  /**
   * 获取错误信息
   */
  getError(): string | null {
    return this.error.value
  }

  /**
   * 验证配置文件格式
   */
  private validateConfig(config: any): void {
    if (!config) {
      throw new Error('配置文件为空')
    }

    if (!config.searchEngines || !Array.isArray(config.searchEngines.engines)) {
      throw new Error('搜索引擎配置格式错误')
    }

    if (!config.searchEngines.engines.length) {
      throw new Error('至少需要配置一个搜索引擎')
    }

    // 验证每个搜索引擎的必需字段
    for (const engine of config.searchEngines.engines) {
      if (!engine.id || !engine.name || !engine.baseUrl) {
        throw new Error(`搜索引擎 "${engine.name || '未知'}" 配置不完整`)
      }
    }

    // 验证默认搜索引擎是否存在
    const defaultEngine = config.searchEngines.engines.find(
      (e: SearchEngine) => e.id === config.searchEngines.default
    )
    if (!defaultEngine) {
      throw new Error('默认搜索引擎配置错误')
    }
  }

  /**
   * 获取默认配置（降级方案）
   */
  private getDefaultConfig(): Config {
    return {
      version: '1.0.0',
      name: 'Gao Index 配置',
      description: '工具箱浏览器主页配置文件',
      searchEngines: {
        default: 'bing',
        engines: [
          {
            id: 'bing',
            name: 'Bing',
            baseUrl: 'https://cn.bing.com/search?form=QBLH&q=',
          },
          {
            id: 'baidu',
            name: '百度',
            baseUrl: 'https://www.baidu.com/s?wd=',
          },
          {
            id: 'google',
            name: 'Google',
            baseUrl: 'https://www.google.com/search?q=',
          },
        ],
      },
    }
  }
}

// 创建单例实例
export const configService = new ConfigService()
