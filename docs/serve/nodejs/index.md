# 概述

ok,要写 Node.js 就要基本上对它有一个大体的概念性了解。

1. nodejs 并不是`JavaScript` 应用，也不是编程语言，因为编程语言使用的 JavaScript,Nodejs 是 JavaScript 的运行时。

2. Nodejs 是构建在 V8 引擎之上的，V8 引擎是由 C/C++编写的，因此我们的 JavaSCript 代码需要由 C/C++转化后再执行。

3. NodeJs 使用异步 I/O 和事件驱动的设计理念，可以高效地处理大量并发请求，提供了非阻塞式 I/O 接口和事件循环机制，使得开发人员可以编写高性能、可扩展的应用程序,异步 I/O 最终都是由 libuv 事件循环库去实现的。

4. NodeJs 使用 npm 作为包管理工具类似于 python 的 pip，或者是 java 的 Maven，目前 npm 拥有上百万个模块。 <a> www.npmjs.com/ </a>

5. nodejs 适合干一些 IO 密集型应用，不适合 CPU 密集型应用，nodejsIO 依靠 libuv 有很强的处理能力，而 CPU 因为 nodejs 单线程原因，容易造成 CPU 占用率高，如果非要做 CPU 密集型应用，可以使用 C++插件编写 或者 nodejs 提供的 cluster。(CPU 密集型指的是图像的处理 或者音频处理需要大量数据结构 + 算法)

## nodeJs 大致架构图

![架构图](../../assets/nodejs/jiagoutu.webp)

---

## npm

`npm` （全称 Node Package Manager）是 Node.js 的包管理工具，它是一个基于命令行的工具，用于帮助开发者在自己的项目中安装、升级、移除和管理依赖项。

### npm 命令

1. `npm init` 初始化一个新的 npm 项目，创建 package.json 文件
2. `npm install <package-name>` 简写为 `npm i <package-name>` 在没有写`<package-name>` 的时候为安装一组包，否则为安装指定的包，特别强调的是当额外添加`--save-dev` (简写为`-D`),则此次安装是天津到 package.json 文件中的开发依赖列表中， `-g` 则是全局安装。
3. `npm update <package-name>` 更新指定的包
4. `npm uninstall <package-name>` 卸载指定的包
5. `npm info <package-name>` 查看指定包的详细信息
6. `npm list` 简写为 `npm ls` 列出当前项目中安装的所有包 ，特别的，如果此刻输入的命名是 `npm ls -g` 它则是列出当前电脑中全局的包
7. `npm audit` 检查当前项目中的依赖项是否存在安全漏洞。
8. `npm publish` 发布自己开发的包到 npm 库中。
9. `npm login` 登录到 npm 账户。
10. `npm logout` 注销当前 npm 账户。
11. `npm link` 将本地模块链接到全局的 node_modules 目录下
12. `npm config list` 用于列出所有的 npm 配置信息。执行该命令可以查看当前系统和用户级别的所有 npm 配置信息，以及当前项目的配置信息（如果在项目目录下执行该命令）
13. `npm get registry` 用于获取当前 npm 配置中的 registry 配置项的值。registry 配置项用于指定 npm 包的下载地址，如果未指定，则默认使用 npm 官方的包注册表地址
14. `npm set registry npm config set registry <registry-url>` 命令，将 registry 配置项的值修改为指定的 `<registry-url>` 地址

## Package.Json 一些定义

1. `name` 项目名称，必须是唯一的字符串，通常采用小写字母和连字符的组合。
2. `version` 项目版本号，通常采用语义化版本号规范。
3. `description` 项目描述。
4. `main` 项目的主入口文件路径，通常是一个 JavaScript 文件。
5. `keywords` 项目的关键字列表，方便他人搜索和发现该项目。
6. `author` 项目作者的信息，包括姓名、邮箱、网址等。
7. `license` 项目的许可证类型，可以是自定义的许可证类型或者常见的开源许可证（如 MIT、Apache 等）。
8. `dependencies` 项目所依赖的包的列表，这些包会在项目运行时自动安装。
9. `devDependencies` 项目开发过程中所需要的包的列表，这些包不会随项目一起发布，而是只在开发时使用。
10. `peerDependencies` 项目的同级依赖，即项目所需要的模块被其他模块所依赖。
11. `scripts` 定义了一些脚本命令，比如启动项目、运行测试等。
12. `repository` 项目代码仓库的信息，包括类型、网址等。
13. `bugs` 项目的 bug 报告地址。
14. `homepage` 项目的官方网站地址或者文档地址。
