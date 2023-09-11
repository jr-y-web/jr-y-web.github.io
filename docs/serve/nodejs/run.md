# npm run 原理

当在终端输入任何`npm run <行为命令>`的时候，npm 其实是去读取 package.json 的 script 对应脚本的命名，它遵寻下面规则：

- 先从当前项目的 node_modules/.bin 去查找可执行命令
- 如果没找到就去全局的 node_modules 去找可执行命令
- 如果还没找到就去环境变量查找
- 再找不到就进行报错

如果成功找到，一般.bin 文件会存在三个同名但不同后缀的文件,因为 node.js 是跨平台的，所以可执行命名兼容各个平台;

- sh 文件是给 Linux unix Macos 使用
- cmd 给 windows 的 cmd 使用
- ps1 给 windows 的 powerShell 使用

## npm 生命周期

npm 的生命周期分为在 xx 命令之前和在 xx 命令之后，创建生命周期也非常简单，只需要在`package.json`的 script 中的命名前面加上`pre`（在之前） 与 `post`（在之后），这里来单元测试 test 命名举个例子：

```json
  "script" : {
    "test" : "node test" ,
    "pretest": "在执行test命令之前",
    "posttest": "在执行test命令之后"
  }
```
