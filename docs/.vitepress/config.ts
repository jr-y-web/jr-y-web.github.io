import { defineConfig } from 'vitepress'
import { sidebar, nav } from './router'

export default defineConfig({
  lang: 'zh-CN',
  title: "岚晴雪",
  description: "alterEgo 技术博客",
  // lastUpdated: true,
  themeConfig: {
    logo: '../assets/blogLogo.png',
    outlineTitle: '本页目录',
    nav,
    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jr-y-web/jr-y-web.github.io' }
    ],
    // 搜索
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },
    // 分页
    docFooter: {
      prev: '上一页',
      next: '下一页'
    }
  }
})
