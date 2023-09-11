# 核心模块 node:path

node:path 模块提供了用于处理文件和目录的路径的实用工具。

```js
const path = require("node:path");
```

当然，`package.json` 中如果是 esm 规则`"type": "module"`则

```js
import path from "node:path";
```

## 什么是 POSIX

在使用`path`前要先理解不同平台的一个机制，比如经典就是 Windows 和 Mac (Posix)的区别：`posix（Portable Operating System Interface of UNIX`,posix 表示可移植操作系统接口，也就是定义了一套标准，遵守这套标准的操作系统有(unix,like unix,linux,macOs,windows wsl)，为什么要定义这套标准，比如在 Linux 系统启动一个进程需要调用 fork 函数,在 windows 启动一个进程需要调用 creatprocess 函数，这样就会有问题，比如我在 linux 写好了代码，需要移植到 windows 发现函数不统一，posix 标准的出现就是为了解决这个问题。

但是`Windows`因为历史原因，它并没有完全遵守`posix` 标准, Windows 在设计采用了和`posix`不同的路径表示规则(~~当前它现在也兼容了~~)。 譬如在`Windows`系统中，使用反斜杠（`\`）作为路径分隔符。这与 POSIX 系统使用的正斜杠（`/`）是不同的。

## path 对 Windows 与 POSIX 的差异化

node:path 模块的默认操作因运行 Node.js 应用程序的操作系统而异。 具体来说，当在 `Windows` 操作系统上运行时，`node:path` 模块将假定正在使用 `Windows` 风格的路径。
因此，在 `POSIX` 和 `Windows` 上使用 `path.basename()` 等一系列方法可能会产生不同的结果，譬如 mac 下的路径是'`/`'，而`Windows`则两者都可以兼容。所以 path 的方法中可以通过`path.win32` 和 `path.posix`来操作,比如现在就有需求要在 mac 电脑中去解析`Windows`的路径（ps. 现实的需求还是很魔幻的），那么就可以使用在 path 后面跟上对应的平台方法；

- 当使用 `Windows` 文件路径时，若要在任何操作系统上获得一致的结果，则使用 `path.win32`
- 当使用 `POSIX` 文件路径时，若要在任何操作系统上获得一致的结果，则使用 `path.posix`

## path.basename(path[, ext])

- path `<string>`
- ext `<string>` 可选的文件扩展名
- @return `<string>`

path.basename()方法是返回`path`的最后一部分，同时尾随的目录分隔符被忽略（说的是`'\'`或者`'/'`）, 可选参数`ext`则是返回的基础上在扩展名剔除`ext`，比如说 `path.basename(path,'.html')`，那么 path 的扩展名要是`.html`则会被剔除后返回，比如我们举个例子；

```js
//举个例子
path.basename("/filmReview/上帝的笔误.md"); // 返回 上帝的笔误.md
path.basename("/filmReview/上帝的笔误.md", ".md"); // 返回 上帝的笔误
```

当然就像之前所说的，mac（遵守 posix 的系统）并不能解析 Winodows 的路径，当使用 Windows 文件路径时，若要在任何操作系统上获得一致的结果，则使用 `path.win32`。

```js
path.win32.basename("D://filmReview//上帝的笔误.md"); // 返回 上帝的笔误.md
```

特别的，Windows 不区分大小写的方式处理文件名（包括文件扩展名），但`basename`不会如此，该方法还是会认为不同大小写的扩展名属于不同文件，比如说我们拿 index.html 与 index.HTML 举个例子，它们两个其实指同一个文件。

```js
path.win32.basename("D://filmReview//index.html", ".html"); // 返回index
path.win32.basename("D://filmReview//index.HTML", ".html"); // 返回index.HTML
```

::: warning 注意
若传进来的`path`不是字符串的话，该方法会报错。
:::

## path.dirname(path)

- path `<string>` 路径字符串

`path.dirname`方法和`path.basename` 方法为互补关系， path.basename()方法是返回`path`的最后一部分, 而 path.dirname()则返回`path`的目录名, 同时尾随的目录分隔符被忽略。

```js
path.dirname("/filmReview/上帝的笔误.md"); // 返回 filmReview
```

::: warning 注意
若传进来的`path`不是字符串的话，该方法会报错。
:::

## paath.extname(path)

- path `<string>` 路径字符串

`path.extname` 则返回传进来`path`路径字符串的文件的扩展名，它其实取是`path`的 U 最后一部分，从`.`字符到字符串的结尾，特别的，如果最后一部分没有`.`，或者除了 path 的基本名称的第一个字符之外没有`.`个字符，则返回空字符串。

```js
path.extname("index.md"); // 返回 .md

path.extname("lerna"); // 返回 空字符串

path.extname("koa2.js.app"); // 返回 .app

path.extname("nest."); // 返回 .

path.extname(".index"); //返回空

path.extname(".index.vue"); // 返回 .vue
```

::: warning 注意
若传进来的`path`不是字符串的话，该方法会报错。
:::

## path.join([...paths])

- ..paths 字符串序列，逗号隔开
  `path.join` 方法是通过解析传进来的 paths，然后拼接成一个路径, 如果是零长度的 paths 片段的话会被忽略，如果连接的路径字符串是零长度字符串，则将返回 '.'，表示当前工作目录。
- @return `<string>`

```js
path.join("/lerna", "index.md"); // 返回   /lerna/index.md
```

当然特别的，这里还支持`..` 和 `./` 的骚操作，举个例子,有下面例子可见，在拼接/c 的末端中，额外的让它返回上层，所以它最终就会输出/a/b

```js
path.join("/a", "/b", "/c", "../"); // 返沪/a/b
```

## path.resolve([...paths])

- ...paths `<string>` 路径或路径片段的序列
- @return `<string>`

`path.resolve`是将路径或者路径片段（逗号隔开）解析成一个**绝对路径**。 如果传入了多个绝对路径，那么只会返回尾部（最右边）的绝对路径。
特别的，它还具体以下规则：

1. 如果在处理完后传进来的参数`paths`后还不是一个绝对路径，那么它会返回当前处理的**工作目录**
2. 零长度的`path`会被无视
3. 如果没有传入 path 片段,即`path.resolve()`就是返回**当前工作目录的绝对路径**
4. 生成的路径被规范化，并删除尾部斜杠，即 path.resolve('./index.js/') ==> 工作目录/index.js
5. 给定的路径序列从右到左处理，每个后续的 path 会被追加到前面，直到构建绝对路径。 例如，给定路径片段的序列：/foo、/bar、baz，调用 path.resolve('/foo', '/bar', 'baz') 将返回 /bar/baz，因为 'baz' 不是绝对路径，而 '/bar' + '/' + 'baz' 是。

举个例子，注意当前为`mac`，windows 的路径会有不同。

```js
// 比如说传入了多个绝对路径
path.resolve("/a", "/b", "/games"); // 返回 /games

// 比如脚手架经常看到的  绝对路径 + 相对路径
path.resolve(__dirname, "./nest.js"); // 返回   工作目录/nest.js

// 当然要达到上述的相同结果，直接只传入一个相对路径也是行的
path.resolve("./nest.js"); // 返回   工作目录/nest.js

path.resolve(__dirname, "src"); // 返回 工作目录/src
```

## path.sep

`path.sep` 是提供特定平台的路径片段分割符

- Windows 上是 `\`
- Posix 上是 `/`

举个例子：

```js
// mac
path.sep; // --->  '/'

// Window
path.sep; // ----> '\'
```

## path.delimiter

提供特定于平台的路径定界符：

- `;` 用于 windows
- `:` 用于 POSIX

举个例子：

```js
console.log(path.delimiter); // 打印  --->  mac 是 :  ， windows 是
```

下面是官方案列:

- 在 POSIX 上

```js
console.log(process.env.PATH);
// 打印: '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'

process.env.PATH.split(path.delimiter);
// 返回: ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']
```

- 在 Windows 上

```js
console.log(process.env.PATH);
// 打印: 'C:\Windows\system32;C:\Windows;C:\Program Files\node\'

process.env.PATH.split(path.delimiter);
// 返回: ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Program Files\\node\\']
```

## path.isAbsolute(path)

- path `<string>`
- @return `<boolen>`

`path.isAbsolute` 方法确定`path`是否为绝对路径，如果给定的`path`是零长度的字符串，则直接返回 fasle

```js
// 举个例子
path.isAbsolute("/film"); // true
path.isAbsolute("film"); // false
path.isAbsolute("./film"); // false
path.isAbsolute("film/"); // false
```

## path.parse(path)

- path `<string>`
- @return `Object`

`path.parse` 与 `path.format` 正好为互补关系, `path.parse`方法根据传入的 path 字符串解析成一个**路径对象**，同时尾随的目录分隔符被忽略。

什么是路径对象？ 路径对象是指路径的各个组成部分，对象有`root`、 `dir` 、 `base` 、`ext`、`name`

```js
path.parse('/lerna/blog/config/index.md')

// 上述log 为
{
  root: '/',
  dir: '/lerna/blog/config',
  base: 'index.md',
  ext: '.md',
  name: 'index'
}
```

分别对应的含义为：

- `root` 路径根目录，即`/`
- `dir` 文件所在的目录，即`/`
- `base` 文件名
- `ext` 文件扩展名
- `naem` 去除扩展名后的文件名

## path.format(pathObject)

`path.format` 与 `path.parse` 正好为互补关系, `path.format` 是将路径对象转化为路径字符串。

```js
path.format({
  root: "/",
  dir: "/lerna/blog/config",
  base: "index.md",
  ext: ".md",
  name: "index",
});
// log  ---- >  /lerna/blog/config/index.md
```

特别的，它还存在**一个属性优先于另一个属性**的规则；

- 如果有对象里面有`dir`则会无视掉`root`
- 如果有 base，则会无视掉`ext`于`name`

```js
// 举个例子
path.format({
  root: "/user", // 我乱写的加一个
  dir: "/lerna/blog/config",
  base: "index.md",
}); //  log ----> /lerna/blog/config/index.md

path.format({
  dir: "/lerna/blog/config",
  base: "index.md",
  ext: ".mp4",
  name: "我乱起一个文件名",
}); // log  ----> /lerna/blog/config/index.md
```

## path.relative(from, to)

- from `<string>` 起点路径字符串
- to `<string>` 终点路径字符串
- @return `<string>`

`path.relative` 方法是根据工作目录解析传入的`form`起点路径到`to`终点路径的相对路径， 如果`from`和`to`都解析为相同的路径，则返回零长度字符串,如果零长度字符串作为 from 或 to 传入，则将使用当前工作目录而不是零长度字符串。

```js
path.relative("/a/b/test/aaa", "/a/b/blog/bbb"); // log -> ../../blog/bbb
```
