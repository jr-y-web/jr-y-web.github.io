<template>
    <Layout />
</template>
  
<script setup>
import DefaultTheme from "vitepress/theme";
const { Layout } = DefaultTheme;
import { watch, nextTick, onMounted } from "vue";
import "gitalk/dist/gitalk.css";
import Gitalk from "gitalk";
import { useRouter } from "vitepress";

let { route } = useRouter(); // 页面路由对象

onMounted(() => {
    watch(
        () => route.path, // 监听路由变化，重新挂载评论组件
        () => {
            nextTick(() => {
                if (typeof window !== undefined) {
                    const content_div = document.querySelector(".content-container"); // 查找页面内容DOM节点，此节点只有layout为Page（默认layout属性）的md文档才有
                    if (content_div) {
                        const before_s_div = document.getElementById("gitalk-page-container") // 获取页面评论组件DOM节点
                        if (before_s_div) {  //判断是否已有评论组件节点，有则删除，重新创建。
                            content_div.removeChild(before_s_div)
                        }
                        const s_div = document.createElement("div"); // 创建节点
                        s_div.setAttribute("id", "gitalk-page-container"); // 设置id
                        content_div.appendChild(s_div); // querySelector的节点可自己根据自己想加载的地方设置
                        const gitment = new Gitalk({
                            proxy: 'https://vercel.prohibitorum.top/github_access_token',
                            id: route.data.title, // 可选，推荐设置为页面标题，因为会作为标签传给Github issues，且issues标签有长度限制。
                            owner: "jr-y-web", // GitHub repository 所有者
                            repo: "zeroneTalk", // GitHub repositor
                            clientID: "1fc22a84d635f390d433", // 自己的clientID
                            clientSecret: "78084f7fb43f5d7136177556246e5784040bde13", // 自己的clientSecret
                            admin: ["jr-y-web"], // GitHub repository 所有者
                            labels: ["Gitalk"], // GitHub issue 的标签
                            createIssueManually: true, //如果当前页面没有相应的 isssue 且登录的用户属于 admin，则会自动创建 issue。如果设置为 true，则显示一个初始化页面，创建 issue 需要点击 init 按钮。
                        });
                        gitment.render("gitalk-page-container");
                    }
                }
            })
        },
        { immediate: true }
    );
});
</script>
  