# 模块化

Node.js 模块化规范遵循两套规范，分别为`commonJS` 与 `esm`(Es6)规范。

- commonJS 规范： 该规范是自 nodejs 创建以来，一直使用的基于传统模块化的格式
- esm 规范： (Es6， 下文一律称呼为 Es6) 使用新的"import" 关键字来定义模块

## commonJS

CommonJS 是使用`module.export`来导出 JS 模块，举个例子现在导出一个 fn 方法:

```js
const fn = () => {
  // ...功能逻辑
};
module.export = {
  fn,
};
```

如何引入，则使用 require 来使用上述模块，举个例子它叫 index.ts：

```js
const fn = require("./index.ts");
```

## Es6

而 Es6 的导出模块则相对来说简略了不少， Es6 是使用 export 导出，方法就是将 export 放置在任意变量，函数或者类声明之前：

```js
// 导出函数
export const fn = () => {
  // ...功能逻辑
};

//导出变量
export const list = [];
```

其中，除了 export 关键词之外，每个声明都与正式形式完全一样，每个被导出的函数或者类都有名称，这是因为导出的函数声明与类声明必须要有名称，不能使用这种语法导出匿名。
同时，Es6 还提供`export default`来导出模块，它和正常在一个文件里面对某个方法或者变量的`export`导出的区别为：

- `export default` 是向外暴露成员，可以使用任意变量来接受，但是`export`只能用已导出的名称进行接收。必须严格按照导出时候的名称，来使用{ }按需接收。
- 在一个模块中 `export default` 只允许向外暴露一次,`export`则可以多次。

当然它们也可以混合使用：

```js
const fn = () => {
  // ...功能逻辑
};
export const list = [];

export default fn;
```

引入的时候则分开写即可：

```js
import fn, { list } from "./index";
```

特别的，在 import 引入的时候，能对引入的方法做一次重命名的操作，举个例子：

```js
import { fn as getFuntions } from "./index.ts";

// 导出的全部都统一为echarts
import * as echarts from "echarts";
```

这样 fn 方法就被重命名为 getFuntions, 另一个带`*`号则是代表导出的全部都为 xxx。

## Es6 与 commonJS 的区别

- commonJS 是基于运行时的同步加载，Es6 是基于编译时的异步加载
- commonJS 是可以修改值的，Es6 值并且不可修改（可读的）
- commonJS 不可以 tree shaking，Es6 支持 tree shaking
- commonjs 中顶层的 this 指向这个模块本身，而 ES6 中顶层 this 指向 undefined

::: warning
特别注意，commonJS 是可以引入`.json`文件的，但是 Es6 的 import 是不可以引入`.json`文件的，但这个问题大多数被当前框架所兼容，比如 vite 就兼容了引入`.json`文件，使得使用 vite 开发时候，可以直接`import data from './index.json'`。
:::

## node.js 核心模块

核心模块为 Node.js 提供了最基本的 Api,这些核心模块被编译为二进制分发，并在 Node.js 进程启动时自动加载，常用的核心模块如下：

- `buffer` 用于二进制数据的处理
- `events` 用于事件处理
- `fs` 用于与文件系统交互
- `http` 用于提供 http 服务器和客户端
- `net` 提供异步网络 api，用于创建基于流的 TCP 或 IPC 服务器和客户端
- `path` 用于处理文件和目录的路径
- `tls` 提供了基于 OpenSSL 构建的传输安全性(TLS)和
- `dgram` 提供了 UDP 数据报台接字的实现

后续将对这几个模块，进行大量的分析和学习
