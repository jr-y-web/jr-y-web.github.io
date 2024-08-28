/**
 * @description 路由集合
 * @implements config的路由和顶部菜单路由有多少重复，而且过度写在config会变得不好配置其他，所以把路由抽离出来
 */

interface TypeRouter {
    text: string,
    items?: Array<TypeRouter>,
    link?: string,
    collapsed?: boolean
    base?: string
    docFooterText?: string
    rel?: string
    target?: string
    activeMatch?: string
}

// node.js
export const nodejs: Array<TypeRouter> = [
    {
        text: '基础性知识',
        items: [
            { text: '概述', link: '/serve/nodejs/index.md' },
            { text: 'npm install 原理', link: '/serve/nodejs/install.md' },
            { text: 'npm run 原理', link: '/serve/nodejs/run.md', activeMatch: '/serve/nodejs/' },
            { text: 'npx 作用', link: '/serve/nodejs/npx.md' },
            { text: '模块化', link: '/serve/nodejs/modularity.md' },
        ]
    },
    {
        text: '内置模块',
        items: [
            { text: 'path', link: '/serve/nodejs/path.md' },
            { text: 'os', link: '/serve/nodejs/os.md' },
            { text: 'process', link: '/serve/nodejs/process.md' },
            { text: 'child_process', link: '/serve/nodejs/child_process.md' }
        ]
    }
]

// nest.js
export const nestjs: Array<TypeRouter> = [
    {
        text: '知识梳理', items: [
            { text: '第一步 firstStep', link: '/serve/nestjs/firstStep.md' },
            { text: '控制器 controller', link: '/serve/nestjs/controller.md' },
            { text: '守卫 Guard', link: '/serve/nestjs/guard.md' },
            { text: '管道 Pipe', link: '/serve/nestjs/pipe.md' }
        ]
    },
    { text: '环境变量配置', link: '/serve/nestjs/env.md' },
    { text: '如何连接数据库', link: '/serve/nestjs/nestSql.md' },
    { text: '如何集成日志插件winston.js', link: '/serve/nestjs/logger.md' }
]

// vue.js
export const vuejs: Array<TypeRouter> = [
    { text: 'Vue 项目中如何在打包时清除 console 和 debugger', link: '/web/vue/clearDebuggerAndLog' }
]

// webSkill  
export const webSkill: Array<TypeRouter> = [
    {
        text: "VitePress 从零建立自己博客",
        items: [
            { text: '手摸手 带你入门且部署VitePress', link: '/web/skill/vitepress.md' },
            { text: '我必须立马评论！为 VitePress 添加评论功能', link: '/web/skill/vitepressGitalk.md' },
        ]
    },
    {
        text: "工作中的骚解法",
        items: [
            { text: 'visibilitystate 检测页面是否处于焦点状态', link: '/web/skill/visibilitystate.md' },
            { text: 'Css has选择器', link: '/web/skill/cssHas.md' },
            { text: 'Echarts 绘制特殊的圆环图', link: '/web/skill/ringEchartsSkill.md' },
            { text: '快速学会YAML', link: '/web/skill/yaml.md' },
            { text: '一个“夸张”的表格内嵌层级下拉选择需求', link: '/web/skill/exaggerateTableInSelect.md' },
            { text: '前端伪 Mvc 架构与脚手架生成模版', link: '/web/skill/quickTemplate.md' }
        ]
    }

]

// interest
export const interest: Array<TypeRouter> = [
    {
        text: 'No Game NO Life',
        items: [
            { link: '/interest/cyberpunk.md', text: '赛博朋克2077' },
            { link: '/interest/rw2.md', text: '仁王2' }
        ]
    },
    {
        text: '电影',
        items: [
            { link: '/interest/dansIaMaison.md', text: '《登堂入室》' }
        ]
    }
]


// about
export const about: Array<TypeRouter> = [
    {
        text: '关于我',
        items: [
            {
                text: '我',
                link: '/about/me.md'
            }
        ]
    }
]

// 面试题
export const interview: Array<TypeRouter> = [
    { text: '2023-09', link: '/interview/202309.md' }
]

// docs vueTestUtile
export const vueTestUtile: Array<TypeRouter> = [
    { text: '安装', link: '/docsTranslate/vueTestUtile/Installation.md' },
    {
        text: '基础',
        items: [
            { text: '概述', link: '/docsTranslate/vueTestUtile/gettingStarted.md' },
            { text: '快速入门', link: '/docsTranslate/vueTestUtile/ACrashCourse.md' },
            { text: '条件呈现', link: '/docsTranslate/vueTestUtile/conditionalRendering.md' },
            { text: '事件处理', link: '/docsTranslate/vueTestUtile/eventHandling.md' },
            { text: '表单交互', link: '/docsTranslate/vueTestUtile/formHandling.md' },
            { text: '向组件传递数据', link: '/docsTranslate/vueTestUtile/passingDataToComponents.md' },
            { text: '编写易于测试的组件', link: '/docsTranslate/vueTestUtile/easyToTest.md' },
            { text: '发送HTTP请求', link: '/docsTranslate/vueTestUtile/httpRequests.md' }

        ]
    },
    {
        text: '深入 Vue-Test-Utils',
        items: [
            { text: '插槽(Slots)', link: '/docsTranslate/vueTestUtile/slots.md' },
            { text: '异步行为', link: '/docsTranslate/vueTestUtile/asynchronous.md' },
            { text: '发送HTTP请求', link: '/docsTranslate/vueTestUtile/httpRequests.md' },
            { text: '过滤(transition)', link: '/docsTranslate/vueTestUtile/transitions.md' },
            { text: '组件实例', link: '/docsTranslate/vueTestUtile/componentInstance.md' },
            { text: '可重复性和组合', link: '/docsTranslate/vueTestUtile/reusabilityCompositionre.md' },
            { text: '测试 v-model', link: '/docsTranslate/vueTestUtile/vModel.md' },
            { text: '测试 vuex', link: '/docsTranslate/vueTestUtile/vuex.md' },
            { text: '测试 vue router', link: '/docsTranslate/vueTestUtile/vRouter.md' },
            { text: '测试 teleport', link: '/docsTranslate/vueTestUtile/teleport.md' },
            { text: 'Stubs 以及 Shallow Mount', link: '/docsTranslate/vueTestUtile/stubs.md' }
        ]
    },
    {
        text: '扩展 Vue-Test-Utils',
        items: [
            { text: '插件', link: '/docsTranslate/vueTestUtile/plugins.md' },
            { text: '社区与学习', link: '/docsTranslate/vueTestUtile/communityAndLearning.md' }
        ]
    },
    { text: 'FAQ', link: '/docsTranslate/vueTestUtile/faq.md' },
    { text: 'API 参考', link: '/docsTranslate/vueTestUtile/apiReference.md' }
]

// 汇总字典 （config.nav使用）
const navItem = {
    nodejs: {
        router: nodejs,
        text: '从零开始的Node.js'
    },
    nestjs: {
        router: nestjs,
        text: 'Nest.js笔记'
    },
    // vuejs: {
    //     text: 'Vue.js 笔记',
    //     router: vuejs
    // },
    webSkill: {
        text: '前端技巧',
        router: webSkill
    },
    about: {
        text: '关于作者',
        router: about
    },
    interview: {
        router: interview,
        text: '面试题挑战'
    },
    interest: {
        router: interest,
        text: '兴趣爱好'
    },
    vueTestUtile: {
        router: vueTestUtile,
        text: 'Vue Test Utils'
    }

}


/** 
 * @description 根据key获取对应系列的第一个能点的link
 * @param {Array} key 系列
 * @returns 路由对象数组
*/
export const getNavOneRouter = (...key) => {
    let result: Array<{ text: string, link: string }> = []
    if (Array.isArray(key) && key.length) {
        key.forEach((item, index) => {
            if (navItem[item]) {
                const { text } = navItem[item]
                result.push({
                    link: getRouterLink(navItem[item].router), text
                })
            }
        })
    }
    return result
}

/**
 * @description 递归找到某系列第一个link
 */
const getRouterLink = (arr) => {
    let result = ''
    const fn = (copyarr) => {
        for (let i in copyarr) {
            if (Array.isArray(copyarr[i].items) && copyarr[i].items.length) {
                fn(copyarr[i].items)
                break
            }
            else {
                result = copyarr[0].link
                break
            }
        }
    }
    fn(arr)
    return result
}

// nav
export const nav = [
    { text: '首页', link: '/' },
    {
        text: '前端开发',
        items: [
            ...getNavOneRouter('vuejs', 'webSkill')
        ],
        activeMatch: '/web/'
    },
    {
        text: '后端开发',
        items: [
            ...getNavOneRouter('nodejs', 'nestjs')
        ],
        activeMatch: '/serve/'
    },
    {
        text: '兴趣分享',
        link: '/interest/cyberpunk.md',
        activeMatch: '/interest/'
    },
    {
        text: '面试题挑战',
        link: '/interview/202309.md'
    },
    // { text: '关于我', link: '/about/me.md' }
    {
        text: '文档翻译',
        items: [
            ...getNavOneRouter('vueTestUtile')
        ],
        activeMatch: '/docsTranslate/'
    }
]

export const sidebar = {
    // 后端node
    '/serve/nodejs/': nodejs,
    // 后端nest
    '/serve/nestjs/': nestjs,
    // 前端vue
    '/web/vue/': vuejs,
    // 前端技巧
    '/web/skill/': webSkill,
    // 装b | 吹水
    '/about/': about,
    // 面试题
    '/interview/': interview,
    // 兴趣分享 游戏
    '/interest/': interest,
    // vue test utile 翻译
    '/docsTranslate/vueTestUtile': vueTestUtile
}

