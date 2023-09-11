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
}

// node.js
export const nodejs: Array<TypeRouter> = [
    {
        text: '基础性知识', items: [
            { text: '概述', link: '/serve/nodejs/index.md' },
            { text: 'npm install 原理', link: '/serve/nodejs/install.md' },
            { text: 'npm run 原理', link: '/serve/nodejs/run.md' },
            { text: 'npx 作用', link: '/serve/nodejs/npx.md' },
            {
                text: '模块化',
                link: '/serve/nodejs/modularity.md'
            },
        ]
    },
    {
        text: '核心模块',
        items: [
            { text: 'path', link: '/serve/nodejs/path.md' }
        ]
    }
]

// nest.js
export const nestjs: Array<TypeRouter> = [
    { text: 'Nest.js 环境变量配置', link: '/serve/nestjs/env.md' }
]

// vue.js
export const vuejs: Array<TypeRouter> = [
    { text: 'Vue 项目中如何在打包时清除 console 和 debugger', link: '/web/vue/clearDebuggerAndLog' }
]

// webSkill  
export const webSkill: Array<TypeRouter> = [
    { text: 'visibilitystate 检测页面是否处于焦点状态', link: '/web/skill/visibilitystate.md' }
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
    vuejs: {
        text: 'Vue.js 笔记',
        router: vuejs
    },
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
        ]
    },
    {
        text: '后端开发',
        items: [
            ...getNavOneRouter('nodejs', 'nestjs')
        ]
    },
    {
        text: '面试题挑战',
        link: '/interview/202309.md'
    },
    { text: '关于我', link: '/about/me.md' }
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
    '/interview/': interview
}