# child_process 子进程

child_process 是 Node.js 核心模块，它提供了在 node.js 执行脚本以及`shell`命令的强大功能。 创建子进程共有 7 个 API，它们分别为：

- spawn 异步执行命令
- spawnSync 同步执行命令
- exec 执行命令
- execSync 同步执行命令
- execFile 执行可执行文件
- execFileSync 同步执行可执行文件
- fort 创建 node 子进程

::: tip 提示
在 node.js 中（后续包括 fs）一般的在方法后面带上`Sync`都是同步的行为，具体在使用异步或者同步需要根据不同场景下做出不同的使用。
:::

## exec & execSync

### exec

```js
exec(command, [options], callback);
```

exec 一般适用于简单的`shell`命令，因为它有返回大小的限制，它返回是一个`buffer`。方法对应参数分别为：

- `command` `<string>` 要运行的命令，参数以空格分离
- options `<Object>`
  - cwd `<string>` | `<URL>` 子进程的当前工作目录。 默认值: process.cwd()。
  - env `<Object>` 环境变量键值对。 默认值: process.env。
  - encoding `<string>` 默认值: 'utf8'
  - shell `<string>` 用于执行命令的 shell。 请参阅 shell 的要求和默认的 Windows shell。 默认值: Unix 上是 '/bin/sh'，Windows 上是 process.env.ComSpec。
  - signal `<AbortSignal>` 允许使用中止信号中止子进程。
  - timeout `<number>` 默认值: 0
  - maxBuffer `<number>` 标准输出或标准错误上允许的最大数据量（以字节为单位）。 如果超过，则子进程将终止并截断任何输出。 请参阅 maxBuffer 和 Unicode 的注意事项。 默认值: 1024 \* 1024。
  - killSignal `<string>` | `<integer>` 默认值: 'SIGTERM'
  - uid `<number>` 设置进程的用户标识（参见 setuid(2)）。
  - gid `<number>` 设置进程的群组标识（参见 setgid(2)）。
  - windowsHide `<boolean>` 隐藏通常在 Windows 系统上创建的子进程控制台窗口。 默认值: false。
- callback `<Function>` 当进程终止时使用输出调用。
  - error `<Error>` 报错
  - stdout `<string>` | `<Buffer>` 成功流
  - stderr `<string>` | `<Buffer>` 失败流

举一个例子，现在快速利用`exec`来快速实现一个`node -v`；

```js
import { exec } from "node:child_process";

exec("node -v", (err, stdout, stderr) => {
  if (err) return err;
  console.log(stdout.toString()); // log ---> v20.2.0
});
```

::: danger 特别提示  
使用`exec`或者`execSync`的时候，务必需要验证用户传进来的`shell`命令。
:::

### execSync

```js
execSync(command[, options])
```

`execSync`是`exec`的同步方法，它与`exec`的使用方法类似，无非少了回调函数，用上述例子快速使用`execSync`来实现一个`node -v`;

```js
console.log(execSync("node -v").toString()); // log ---> v20.2.0
```

只要是当前操作系统能支持的`shell`命令，`exec`与`execSync`都可以支持执行。

## spawn & spawnSync

`spawn`与`exec`的最大区别就是`spawn`没有限制上线，它更适合对一些复杂而去耗时的`shell`命令进行操作，虽然它有同步的用法，但一般会比较少用，毕竟 node.js 是单线程，如果`spawnSync`进程卡死，那将会导致整个进程堵塞。

### spawnSync

用法：

```js
spawnSync(command[, args][, options])
```

command 即为将要执行的`shell`命令，然后后面分别为参数和配置，因为该方法为同步方法，如果命名执行时间过于长的情况下，会导致整个进程堵塞。所以一般情况下都是使用`spwan`进行操作。

### spawn

用法：

```js
spawn(command[, args][, options])
```

`spawn`是异步的事件，但它对比`exec`通过回调函数获取异步结果有所不同，它更多类似于“发布订阅”的即时感，它需要通过监听`on`的`data`获取实时返回的数据，而当整个异步事件结束后，它会在`on`中暴露一个`close`的钩子函数来告诉开发者，这次的异步事件已经执行完毕。

```js
// index.js
const { stdout } = spawn("netstat"); // netstat 是获取当前网路信息

stdout.on("data", (reuslt) => {
  console.log(result, "这是一个实时返回的流");
});

stdout.on("close", () => {
  console.log("执行完毕");
});
```

当然的，`spawn`也是支持传递参数以及配置属性，`spawn`第二个参数为我们需要传递的参数，第三个为配置项

```js
const { stdout } = spawn("netstat", "-v", options);
```

具体支持的配置如下：

- command `<string>` 要运行的命令。
- args `<string[]>` 字符串参数列表。
- options `<Object>`
  - cwd `<string>` | `<URL>` 子进程的当前工作目录。
  - env `<Object>` 环境变量键值对。 默认值: process.env。
  - argv0 `<string>` 显式设置发送给子进程的 argv[0] 的值。 如果未指定，这将设置为 command。
  - stdio `<Array>` | `<string>` 子进程的标准输入输出配置（参见 options.stdio）。
  - detached `<boolean>` 准备子进程独立于其父进程运行。 具体行为取决于平台，参见 options.detached。
  - uid `<number>` 设置进程的用户标识（参见 setuid(2)）。
  - gid `<number>` 设置进程的群组标识（参见 setgid(2)）。
  - serialization `<string>` 指定用于在进程之间发送消息的序列化类型。 可能的值为 'json' 和 'advanced'。 有关更多详细信息，请参阅高级序列化。 默认值: 'json'。
  - shell `<boolean>` | `<string>` 如果是 true，则在 shell 内运行 command。 在 Unix 上使用 '/bin/sh'，在 Windows 上使用 process.env.ComSpec。 可以将不同的 shell 指 - 定为字符串。 请参阅 shell 的要求和默认的 Windows shell。 默认值: false （没有 shell）
  - windowsVerbatimArguments `<boolean>` 在 Windows 上不为参数加上引号或转义。 在 Unix 上被忽略。 当指定了 shell 并且是 CMD 时，则自动设置为 true。 默认值: false。
  - windowsHide `<boolean>` 隐藏通常在 Windows 系统上创建的子进程控制台窗口。 默认值: false。
  - signal `<AbortSignal>` 允许使用中止信号中止子进程。
  - timeout `<number>` 允许进程运行的最长时间（以毫秒为单位）。 默认值: undefined。
  - killSignal `<string>` | `<integer>` 当衍生的进程将被超时或中止信号杀死时要使用的信号值。 默认值: 'SIGTERM'。

::: danger 特别提示  
使用`spwan`或者`spwanSync`的时候，务必需要验证用户传进来的`shell`命令。
:::

## execFile && execFileSync
