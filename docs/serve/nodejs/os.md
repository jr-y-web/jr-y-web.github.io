# 内置模版 node:os

os 算是一个甜点级别的知识了，`node:os`提供了与操作系统相关的实用方法和属性，比如说获取当前操作系统的类型和环境变量等。

```js
const os = require("node:os");
```

当然的，如果是 esm 模式下，则:

```js
import os from "node:os";
```

## os.Eol

`os.EOL`是返回操作系统特定的行尾标记。

- Posix 上是`\n`
- Windows 是 `\r\n`

## os.arch()

`os.arch()`方法是返回操作系统的 CPU 架构。可能的值根据操作系统的不同而不同，大体可能为 'arm'、'arm64'、'ia32'、'mips'、'mipsel'、'ppc'、'ppc64'、's390'、's390x'、以及 'x64'。 它与进程方法`process.arch`返回值一致。

```js
// 举个例子
console.log(os.arch); // log --->  arm64
```

## os.cpu()

`os.cpu()`方法是返回包含有关每个逻辑 CPU 内核的信息的对象数组，比如以现在我使用的`apple m2 pro`为例子：

```js
console.log(os.cpu());

/* ====> log
 [
  {
    model: "Apple M2 Pro",
    speed: 24,
    times: { user: 670080, nice: 0, sys: 521560, idle: 4614750, irq: 0 },
  },
  {
    model: "Apple M2 Pro",
    speed: 24,
    times: { user: 647830, nice: 0, sys: 400260, idle: 4764170, irq: 0 },
  },
  {
    model: "Apple M2 Pro",
    speed: 24,
    times: { user: 543610, nice: 0, sys: 323780, idle: 4951320, irq: 0 },
  },
  {
    model: "Apple M2 Pro",
    speed: 24,
    times: { user: 462280, nice: 0, sys: 265950, idle: 5095820, irq: 0 },
  },
  {
    model: "Apple M2 Pro",
    speed: 24,
    times: { user: 278310, nice: 0, sys: 86150, idle: 5471950, irq: 0 },
  },
  {
    model: "Apple M2 Pro",
    speed: 24,
    times: { user: 136570, nice: 0, sys: 45410, idle: 5656120, irq: 0 },
  },
  {
    model: "Apple M2 Pro",
    speed: 24,
    times: { user: 81140, nice: 0, sys: 24300, idle: 5734440, irq: 0 },
  },
  {
    model: "Apple M2 Pro",
    speed: 24,
    times: { user: 51280, nice: 0, sys: 13310, idle: 5777050, irq: 0 },
  },
  {
    model: "Apple M2 Pro",
    speed: 24,
    times: { user: 271990, nice: 0, sys: 79340, idle: 5485650, irq: 0 },
  },
  {
    model: "Apple M2 Pro",
    speed: 24,
    times: { user: 132760, nice: 0, sys: 42480, idle: 5663200, irq: 0 },
  },
  {
    model: "Apple M2 Pro",
    speed: 24,
    times: { user: 79980, nice: 0, sys: 22450, idle: 5737740, irq: 0 },
  },
  {
    model: "Apple M2 Pro",
    speed: 24,
    times: { user: 51290, nice: 0, sys: 12370, idle: 5778130, irq: 0 },
  },
];
 */
```

它分别对应的信息为；

- `model` cpu 的型号信息
- `speed` 处理速率（单位是兆赫）
- `times`
  - `user` CPU 在用户模式下花费的毫秒数。
  - `nice` CPU 在良好模式下花费的毫秒数。
  - `sys` CPU 在系统模式下花费的毫秒数。
  - `idle` CPU 在空闲模式下花费的毫秒数。
  - `irq` CPU 在中断请求模式下花费的毫秒数。

## os.platform()

返回标识为其编译 Node.js 二进制文件的操作系统平台的字符串。 该值在编译时设置。 可能的值为 'aix'、'darwin'、'freebsd'、'linux'、'openbsd'、'sunos'、以及 'win32'

## os.type()

`os.type()`是返回操作系统的名称，它在 Linux 上返回 'Linux'，在 macOS 上返回 'Darwin'，在 Windows 上返回 'Windows_NT'。

```js
console.log(os.type()); // log ---> ’Darwin‘
```

## os.version()

`os.version()`方法是返回当前操作系统的版本号

---

## os 实践

表面上，前端知道了操作系统的信息后，好像也没什么用，并不能做些什么。 但其实这里可以额外的结合进程做一些骚操作。 比如一些框架(`vite`)等，存在属性`open:true`后，能帮我们编译后开浏览器，其实原理就是结合了操作系统 os 以及借用了子进程的一些方法，对不同系统做不同的 shell 脚本。

```js
import { exec } from  'child_process';
import os from 'node:os';

const openBrowser = （url） => {
    if (os.platform() === 'darwin')  exec(`open ${url}`); // macOS
    if (os.platform() === 'win32')  exec(`start ${url}`);   // Windows
    else  exec(`xdg-open ${url}`); //linux | 其他
}

openBrowser('www.bilibili.com');
```

## 更多 api

`node:os` 用的比较少，这里只截取了大部分常用的 Api，更多还需要参考[官方文档](http://www.nodejs.com.cn/api/os.html)。
