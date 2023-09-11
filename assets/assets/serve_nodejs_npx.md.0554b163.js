import{_ as p,o as e,c as n,Q as a}from"./chunks/framework.01af844e.js";const u=JSON.parse('{"title":"npx 是什么","description":"","frontmatter":{},"headers":[],"relativePath":"serve/nodejs/npx.md","filePath":"serve/nodejs/npx.md"}'),t={name:"serve/nodejs/npx.md"},i=a('<h1 id="npx-是什么" tabindex="-1">npx 是什么 <a class="header-anchor" href="#npx-是什么" aria-label="Permalink to &quot;npx 是什么&quot;">​</a></h1><p>npx 是一个命令行工具，它是 npm 5.2.0 版本中新增的功能。它允许用户在不安装全局包的情况下，运行已安装在本地项目中的包或者远程仓库中的包。</p><p>npx 的作用是在命令行中运行 node 包中的可执行文件，而不需要全局安装这些包。这可以使开发人员更轻松地管理包的依赖关系，并且可以避免全局污染的问题。它还可以帮助开发人员在项目中使用不同版本的包，而不会出现版本冲突的问题。</p><p>npx 的优势</p><ul><li>避免全局安装：npx 允许你执行 npm package，而不需要你先全局安装它。</li><li>总是使用最新版本：如果你没有在本地安装相应的 npm package，npx 会从 npm 的 package 仓库中下载并使用最新版。</li><li>执行任意 npm 包：npx 不仅可以执行在 package.json 的 scripts 部分定义的命令，还可以执行任何 npm package。</li><li>执行 GitHub gist：npx 甚至可以执行 GitHub gist 或者其他公开的 JavaScript 文件。</li></ul><h2 id="npm-和-npx-区别" tabindex="-1">npm 和 npx 区别 <a class="header-anchor" href="#npm-和-npx-区别" aria-label="Permalink to &quot;npm 和 npx 区别&quot;">​</a></h2><p><code>npx</code> 测重于执行命令，执行某个模块命令，虽然会自动安装模块，但是重在执行某个命令 <code>npm</code> 测重于安装或者卸载某个模块的，重在安装，并不具备执行某个模块的功能</p><p>举个例子： 在早期 vue-cli 需要安装它的全局脚手架才可以初始化 cil 项目，但这样会存在几个问题</p><ul><li>cli 初始化的项目的依赖版本是固定，它并不会自动更新</li><li>它会占用当前电脑的磁盘空间</li></ul><p>但当现在使用<code>npx</code>后，它虽然也会自动安装 cil 的脚手架包，但是它会在处理完后删除当前 npx 包。</p><p>综上所述：npx 的运行规则和 npm 是一样的 本地目录查找.bin 看有没有 如果没有就去全局的 node_moduels 查找，如果还没有就去下载这个包然后运行命令，然后删除这个包。</p>',11),o=[i];function c(l,s,r,d,x,_){return e(),n("div",null,o)}const h=p(t,[["render",c]]);export{u as __pageData,h as default};
