# 控制器

控制器（`controller`）是负责处理传入的`请求`以及向客户端返回`响应`。控制器（`controller`）一般是由很多路由(前端习惯性称为接口)组成，根据请求类型(`get`、`post`、`patch`...)和路由名分发到各个服务，并且处理服务返回的结果或者数据，同时响应给客户端。

控制器(`controller`)的结构为：

```ts
@Controller("cats")
export class CatController {
  // ... 路由组成
}
```

当然可以通过`nest.js`的 cli 工具可以快速的创建控制器（`controller`）：

```bash
nest g co <控制器名称>
```

可以看到控制器（`controller`）是被装饰器`@Controller()`所修饰的类，能接收一个参数，该参数会以路径的方式映射到 url 中。比如上述的`@Controller("cats")`，假设当前`nest.js`服务的地址为`localhost:3000`，那么不设置全局前缀的前提下，访问`localhost:3000/cats`即可访问该控制器（`controller`）的路由。

:::warning 注意
`Nest.js`是由模块、控制器、服务组成，控制器要生效必须需要在对应模块的`controllers`数组注入或者模块在另一个模块的`import`完成注入。

```ts
@Module({
  controllers: [controllers],
  providers: [],
})
```

:::

## 路由

“路由”不严谨的说就是前后端联调中所说“接口”，要想访问指定的路由，只要访问特定的控制器前缀以及对应路由名即可（如果有指定的话）。举个例子现在搓一个获取“猫咪列表”的`get`的路由：

```ts
import { Get, Controller } from "@nest/common";

@Controller("cats")
export class CatController {
  @Get()
  getCats() {
    return "This is route getCats";
  }
}
```

然后启动`nest.js`的服务，在 url 中输入（假设服务启动后的端口为 3000）`localhost:3000/cats`就可以发现页面输出打印的信息。 当然这是没有给路由一个“前缀”（或者命名更恰当）的情况，控制器`自上往下`找到能匹配的路由，找到后就使用改路由的逻辑并且返回给客户端，所以上述才能通过控制器的前缀就访问内部的接口。这种设计往往是不友好的，因为后续可能会存在`:id`等等类型的路由，为此`@Get`等请求类型的装饰器支持传入一个字符串来确定该路由的前缀。

```ts
import { Get, Controller } from "@nest/common";

@Controller("cats")
export class CatController {
  @Get("list")
  getCats() {
    return "This is route getCats";
  }
}
```

现在访问`localhost:3000/cats/list`才能正确的访问该`get`请求。

路由还支持通配符，只不过这个可能会比较少用，列入把`@Get('list')` 改为 `@Get('li*s')`, 那么现在 `li*s`将匹配`li_s`、`liinfs`等等，字符 ? 、+ 、 \* 以及 () 是它们的正则表达式对应项的子集。连字符（-） 和点（.）按字符串路径逐字解析。

:::tip 提示
控制器（`controller`）当返回基本类型(`String`、`Boolean`、`Number`)的时候，它是不会做任何处理的，`Nest.js`只返回值。 但当返回类型是一个数组或者对象时，`Nest.js`就会去序列化成`JSON`，`Nest.js`这样做的目的是为了开发更加简单和方便，开发者只关心返回值，其他交给`Nest.js`。
:::

### REST API

REST API（Representational State Transfer Application Programming Interface）是一种遵循 REST 架构风格的应用程序编程接口。REST 是一种设计网络应用程序的模式，它强调简单性、可扩展性和可读性，利用现有的 HTTP 协议标准，使得 Web 服务更加结构化和可预见。

细节部分这里可以参考[阮一峰老师的 RESTful API 最佳实践](http://ruanyifeng.com/blog/2018/10/restful-api-best-practices.html)。

这里可以简单概述几个点：

1. api 的命名必须为名词，诸如`getlist`, `seeList`等这些都是不符合规范的。
2. 报错的`code`码有明确的含义。
3. 请求类型应该根据路由的作用而做更精细的细分。

比如:

- Get 获取/加载资源
- Post 创建资源
- Put 更新资源
- Delete 删除资源
- Patch 更新资源，通常泛指更新一部分

## 获取参数

前端向后端发起接口请求必然会携带参数，`Nest.js`这里提供了非常多开箱即用的装饰器，来快速的获取`request`或其中的内容。比如下面例子中获取`request`：

```ts
import { Get, Controller, Request } from "@nest/common";

@Controller("cats")
export class CatController {
  @Get("list")
  getCats(@Request() req) {
    return "This is route getCats";
  }
}
```

当然一般拿`request`都是获取其中传入的参数或者一些特定的内容，这里不必`req.body`获取传入参数等操作, `Nest.js`有相当简单且方便的装饰器：

### 参数的类型推断

`Nest`的参数类型推断和前端的有一定的区别，它是使用类来做为`DTO`(数据传输格式),为什么不和前端一样使用`interface`，`Nest`的官方文档是这样说明的，“首先（如果您使用 TypeScript），我们需要确定 DTO（数据传输对象）模式。DTO 是一个对象，它定义了如何通过网络发送数据。我们可以通过使用 TypeScript 接口（Interface）或简单的类（Class）来定义 DTO 模式。有趣的是，我们在这里推荐使用类。为什么？类是 JavaScript ES6 标准的一部分，因此它们在编译后的 JavaScript 中被保留为实际实体。另一方面，由于 TypeScript 接口在转换过程中被删除，所以 Nest 不能在运行时引用它们。这一点很重要，因为诸如管道（Pipe）之类的特性为在运行时访问变量的元类型提供更多的可能性。”

这也是后续知识面需要额外习惯的一点（特别是`TypeOrm`），这里定义传入数据格式使用类来代替`interface`。

具体用法只需要在装饰器修饰的参数后`: dto`类型定义即可。

举个例子：

```ts
@Body() body: bodyDto
```

### @Query 装饰器

`@Query`主要获取路由中`?`后的参数，比如现在路由为`localhost:3000/cats/list?type=布偶猫`，需要获取参数 type:

```ts
import { Get, Controller, Query } from "@nest/common";
import { queryDto } from "./dto/create.dto"; // 假设在 create.dto.ts 有 queryDto

@Controller("cats")
export class CatController {
  @Get("list")
  getCats(@Query() query: queryDto  //确定dto) {
    return "This is route getCats" + `as ${query.type}`; // ---> This is route getCats as 布偶猫
  }
}
```

也可以往`@Query()`装饰器传入一个字符串来快捷匹配`query`内的参数:

```ts
import { Get, Controller, Query } from "@nest/common";
import { queryDto } from "./dto/create.dto"; // 假设在 create.dto.ts 有 queryDto

@Controller("cats")
export class CatController {
  @Get("list")
  getCats(@Query("type") type: queryDto) {
    return "This is route getCats" + `as ${type}`; // ---> This is route getCats as 布偶猫
  }
}
```

### @Param() 装饰器

有时候路由需要支持动态参数，比如`/cats/list/1`，需要获取后面的`1`,那么这个时候就可以使用 `@Param()`装饰器。

```ts
import { Get, Controller, Query } from "@nest/common";
import { paramDto } from "./dto/create.dto";

@Controller("cats")
export class CatController {
  @Get("list/:id")
  getCats(@Param() Param: paramDto) {
    return "This is route getCats" + `as ${Param.id}`; // ---> This is route getCats as 1
  }
}
```

同样的装饰器也可以传入一个字符串快速的匹配参数。

```ts
import { Get, Controller, Query } from "@nest/common";

@Controller("cats")
export class CatController {
  @Get("list/:id")
  getCats(@Param("id") id) {
    return "This is route getCats" + `as ${id}`; // ---> This is route getCats as 1
  }
}
```

### @Body() 装饰器

`@Body()`装饰器算是最经常使用的（毕竟前后端联调没可能把参数都是 url 传参），这里为了高效的类型推断，需要对`@Body()`修饰的参数给予一个类（上述参数的类型推断有说明原因），使用方法也非常简单,假设现在请求载荷为`{name: '白'}`：

```ts
import { Get, Controller, Query, Body } from "@nest/common";
import { bodyDto } from "./dto/body.dto";

@Controller("cats")
export class CatController {
  @Get("list")
  getCats(@Body() body: bodyDto) {
    return "This is route getCats" + `as ${body.name}`; // ---> This is route getCats as 白
  }
}
```

如果同时需要接收`param`动态参数呢？ 那么只需要加上逗号`,`，在后面再定义即可。假设现在请求载荷为`{name: '白'}`, 动态参数为`/cats/list/1`：

```ts
import { Get, Controller, Query, Body } from "@nest/common";
import { bodyDto } from "./dto/body.dto";

@Controller("cats")
export class CatController {
  @Get("list/:id")
  getCats(@Body() body: bodyDto, @Query('id') : id) {
    return "This is route getCats" + `as ${body.name} - ${id}`; // ---> This is route getCats as 白 - 1
  }
}
```

## 状态码

`Nest.js`默认**非**`post`请求响应的状态码为`200`，`post`响应为`201`。但它支持根据实际需求进行自定义的返回（原则上尽量不改，遵循框架约束）。这里只需要使用`@HttpCode`装饰器，它一样也是在`@nest/common`导出，它接受一个数值类型，这个数值就是需要自定义返回的状态码。

```ts
import { Get, Controller, Query, HttpCode } from "@nest/common";
import { queryDto } from "./dto/create.dto";

@Controller("cats")
@HttpCode(203) // 让它响应的code为203
export class CatController {
  @Get("list")
  getCats(@Query() query: queryDto) {
    return "This is route getCats" + `as ${query.type}`; // ---> This is route getCats as 布偶猫
  }
}
```

## 自定义请求头类型

当需要自定义请求头的时候，就需要使用`@Header`装饰器，该装饰器一样从`@nest/common`引入。

```ts
import { Get, Controller, Query, Header } from "@nest/common";
import { queryDto } from "./dto/create.dto";

@Controller("cats")
@Header("Cache-Control", "none")
export class CatController {
  @Get("list")
  getCats(@Query() query: queryDto) {
    return "This is route getCats" + `as ${query.type}`; // ---> This is route getCats as 布偶猫
  }
}
```

## 重定向

当需要把该路由重定向到另一个 url 中，这时候就需要使用`@Redirect`装饰器，该装饰器接受两个参数，第一个参数为 url(string),需要指定该路由重定向去哪里。另一个参数为 startCode 状态码，它是可选的，不传的时候默认为 301。

```ts
import { Get, Controller, Query, Header } from "@nest/common";
import { queryDto } from "./dto/create.dto";

@Controller("cats")
@Redirect("http://nestjs.com", 303)
export class CatController {
  @Get("list")
  getCats(@Query() query: queryDto) {
    return "This is route getCats" + `as ${query.type}`; // ---> This is route getCats as 布偶猫
  }
}
```

有时候，需要根据逻辑的情况自定义重定向。那么这个时候只要满足`type = {url: string, startCode: number}`复写重定向即可。

```ts
import { Get, Controller, Query, Header } from "@nest/common";
import { queryDto } from "./dto/create.dto";

@Controller("cats")
@Redirect("http://nestjs.com", 303)
export class CatController {
  @Get("list")
  getCats(@Query() query: queryDto) {
    return {
      url: "http://nestjs.com/${query.id}",
      startCode: 301,
    }; //复写 @Redirect
  }
}
```
