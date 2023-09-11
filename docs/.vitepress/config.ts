import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/docs',
  lang: 'zh-CN',
  title: "alterEgo Blog",
  description: "alterEgo 技术博客",
  // lastUpdated: true,
  themeConfig: {
    outlineTitle: '本页目录',
    nav: [
      { text: '首页', link: '/' },
      {
        text: '前端开发',
        items: [
          { text: 'Vue.js 笔记', link: '/web/vue/clearDebuggerAndLog' },
          { text: '前端技巧', link: '/web/skill/visibilitystate.md' }
        ]
      },
      {
        text: '后端开发',
        items: [
          { text: '从零开始的Node.js', link: '/serve/nodejs/index.md' },
          { text: 'Nest.js笔记', link: '/serve/nestjs/env.md' }

        ]
      },
      {
        text: '面试题挑战',
        link: '../interview/202309.md'
      },
      { text: '关于我', link: '/about/me.md' }
    ],

    sidebar: {
      // 后端node
      '/serve/nodejs/': [
        {
          text: '基础性知识',
          items: [
            {
              text: '概述与基本操作',
              items: [
                { text: '概述', link: '/serve/nodejs/index.md' },
                { text: 'npm install 原理', link: '/serve/nodejs/install.md' },
                { text: 'npm run 原理', link: '/serve/nodejs/run.md' },
                { text: 'npx 作用', link: '/serve/nodejs/npx.md' }
              ]
            },
            {
              text: '模块化',
              link: '/serve/nodejs/modularity.md'
            }
          ]
        },
        {
          text: '核心模块',
          items: [
            { text: 'path', link: '/serve/nodejs/path.md' }
          ]
        }
      ],
      '/serve/nestjs/': [
        { text: 'Nest.js 环境变量配置', link: '/serve/nestjs/env.md' }
      ],
      // 前端vue
      '/web/vue/': [
        { text: 'Vue 项目中如何在打包时清除 console 和 debugger', link: '/web/vue/clearDebuggerAndLog' }
      ],
      // 前端技巧
      '/web/skill/': [
        { text: 'visibilitystate 检测页面是否处于焦点状态', link: '/web/skill/visibilitystate.md' }
      ],
      // 装b | 吹水
      '/about/': [
        {
          text: '关于我',
          items: [
            {
              text: '我',
              link: '/about/me.md'
            }
          ]
        }
      ],
      // 面试题
      '/interview/': [
        { text: '2023-09', link: '/interview/202309.md' }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
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
