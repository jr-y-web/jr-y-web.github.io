# process 进程

`process` 是提供有关当前 Node.js 进程的信息并对其进行控制的 API,并且挂载到`globalThis`下面的全局 API，所以它不需要引入，它是一个全局的 Object。

## process.arch

`process.arch`为返回操作系统 CPU 架构的名称，它根据不同的操作系统而返回不同，可能的值为：'arm'、'arm64'、'ia32'、'mips'、'mipsel'、'ppc'、'ppc64'、's390'、's390x'、以及 'x64'。它与`os.arch`返回一致。

```js
// apple m2pro
console.log(process.arch); // log --->  arm64
```

## process.execPath

`process.execPath`是返回启动 Node.js 进程的可执行文件的绝对路径名，注意的是符号链接（如果有）会被解析

```js
cosnole.log(process.execPath); // log ---> /usr/local/bin/node
```

## process.argv

这算是用的最多的一个 API 方法之一，`process.argv` 返回是一个数组，数组的第一项为`process.execPath` (Node 的执行文件路径), 第二项则是当前执行的文件路径，其他元素则是任何其他命令参数。

```js
// 举个例子  index.js
console.log(process.argv)

// 启动
node index.js -v   // log --> [ '/usr/local/bin/node', '/Users/alterego/Desktop/blog/index.js', '-v' ]
```

## process.cwd()

`process.cwd()`方法也算是使用最多的 Api 之一，它是返回当前进程的工作目录，多数是获取工作目录后，再拼接某个文件路径名（比如 src）。

```js
console.log(process.cwd()); // log ---> /Users/alterego/Desktop/blog
```

## process.env

`process.env`是返回当前用户的环境变量的对象，用于读取操作系统所有的环境变量，也可以修改和查询环境变量。特别的，它的更改并不会真正影响到原本环境变量中（直白的说它是不带指针的）。

```js
// 举个例子 process.env.USER 在环境变量是alterego
process.env.USER = "岚"; // --- 执行后，只是当前环境变量才更改为岚，本体环境变量还是alterego
```

## 更多 Api

`process` 运用面非常的广泛，这里只截取了大部分常用的 Api，更多还需要参考[官方文档](http://www.nodejs.com.cn/api/process.html)。
