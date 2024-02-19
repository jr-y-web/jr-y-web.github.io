# 管道 Pipe

管道是具有 `@Injectable()` 装饰器的类。管道应实现 `PipeTransform` 接口。

管道有两个典型的应用场景:

- **转换**：管道将输入数据转换为所需的数据输出(例如，将字符串转换为整数)。
- **验证**：对输入数据进行验证，如果验证成功继续传递; 验证失败则抛出异常。

在这两种情况下, 管道 `参数(arguments)` 会由 `控制器(controllers)`的路由处理程序 进行处理。`Nest` 会在调用这个方法之前插入一个管道，管道会先拦截方法的调用参数,进行转换或是验证处理，然后用转换好或是验证好的参数调用原方法。

简单的说，管道是对输入到控制器上的参数进行一个**转化**与**校验**的一种场景。

:::tip 优先级
它在请求**前**拦截器之后，控制器之前
:::

![生命周期](../../assets/nodejs/nestLifeCycle.png)

:::warning 注意
管道在异常区域内运行。这意味着当抛出异常时，它们由核心异常处理程序和应用于当前上下文的 `异常过滤器` 处理。当在 `Pipe` 中发生异常，`controller` 不会继续执行任何方法。这提供了用于在系统边界验证从外部源进入应用程序的数据的一种最佳实践。
:::

## 内置管道

`Nest`自带九个内置管道：

- ValidationPipe
- ParseIntPipe
- ParseFloatPipe
- ParseBoolPipe
- ParseArrayPipe
- ParseUUIDPipe
- ParseEnumPipe
- DefaultValuePipe
- ParseFilePipe

它们都具有非常明显的语意化，能很直白从命名中知道对应管道的作用。

### ParseIntPipe

`ParseIntPipe`作用是把参数转化为整数的内置管道

```ts
class controller {
  @Get()
  getList(@Query("page", ParseIntPipe) page: string) {
    return page + 1.1; // 这样page就转化为整数类型
  }
}

// 举个例子 getList(2.2) ---> 3
```

### ParseFloatPipe

`ParseFloatPipe`作用是把参数转化为`float`类型的内置管道。

```ts
class controller {
  @Get()
  getList(@Query("page", ParseIntPipe) page: string) {
    return page + 1; // 这样page就转化为float类型
  }
}

// 举个例子 getList(1.2) ---> 2.2
```

### ParseBoolPipe

`ParseBoolPipe`作用是把参数转化为`boolean`类型的内置管道。

```ts
class controller {
  @Get()
  getList(@Query("page", ParseIntPipe) page: string) {
    return page + 1; // 这样page就转化为float类型
  }
}

// 举个例子 getList(1.2) ---> true
```

### DefaultValuePipe

`DefaultValuePipe`作用是把接口中如果没有传递参数，则把默认值转化为这个参数。

```ts
class controller {
  @Get()
  getList(@Query("page", new DefaultValuePipe("1")) page: string) {
    return page; // 如果当前接口的page参数没有传递则返回1，否则page则是传递的值
  }
}
```

### ParseUUIDPipe

`ParseUUIDPipe`作用是用来校验传入参数是否为`UUID`的内置管道，如果传入参数不是`UUID`它将会报错。

```ts
class controller {
  @Get()
  getUUID(@Query("uuid", ParseUUIDPipe) uuid: string) {
    return uuid; // 不符合UUID格式将会报错
  }
}
```

### ParseEnumPipe

`ParseEnumPipe`是用来校验传值是否满足对应枚举的情况，它最大的作用是来限制参数的传递范围。

```ts
// 举个例子
enum valueF {
  A = 1
  B = 2
  C = 3
}
class controller {
  @Get()
  getList(@Query("value", new ParseEnumPipe(valueF)) value: valueF) {
    return value  // 如果传递的value 不满足枚举valueF则会报错，即value必须为 A B C
  }
}
```

### ParseArrayPipe

`ParseArrayPipe`是用来把传入的参数转换为数组的内置管道。

它相对来说比较特殊，需要安装一个包，这两个包也是`Nest`项目中非常常使用的的，它是`class-transformer`，它的作用将是把普通对象转换为对应 class 实例的包。

```bash
pnpm i -D class-transformer
```

ok,安装成功后，就可以使用`ParseArrayPipe`了;

```ts
class controller {
  @Get()
  getList(@Query("value", ParseArrayPipe) value: any) {
    return value; // 假设传递的值为1,2,3  ---> 那么return的结果则是[1,2,3]
  }
}
```

当然，也可以自定义分隔符。

```ts
class controller {
  @Get()
  getList(
    @Query(
      "value",
      new ParseArrayPipe({
        separator: "..", // 分隔符由,改变为..
      })
    )
    value: any
  ) {
    return value; // 假设传递的值为1..2..3  ---> 那么return的结果则是[1,2,3]
  }
}
```

## ValidationPipe 管道验证传入参数

`ValidationPipe`可以从字面意思理解为校验管道，校验传入参数是否满足定义要求，如果不满足则直接报错返回给前端，后续逻辑不会再进行。要使用`ValidationPipe`还需要借助两个包，一个是`class-transformer`与`class-validator`。

```bash
pnpm i -D class-transformer class-validator
```

然后用法还是老样子，在路由参数处添加；

```ts
class TypeItem {
  name: string;
  password: string;
}

class controller {
  @Get()
  getList(
    @Query("item", new ValidationPipe())
    item: TypeItem
  ) {
    return item;
  }
}
```

当然现在`ValidationPipe`是还未生效的，那么此刻有需求需要传入参数重，`name` 与 `password` 的 d 的长度做一定限制，并且需要是字符串，`ValidationPipe`如何进行处理？ 这里因为我们安装了`class-validator`它能让实体类上写上装饰器来限制传入参数的要求。用法也非常简单;

```ts
import { IsString, Length } from "class-validator";
class TypeItem {
  @IsString()
  @Length(1, 10)
  name: string;

  @IsString()
  @Length(6, 10)
  password: string;
}

class controller {
  @Get()
  getList(
    @Query("item", new ValidationPipe())
    item: TypeItem
  ) {
    return item;
  }
}
```

这样如果传入的长度不符合上述实体类定义，逻辑将报错，无法执行。

当然可以更为方便的，直接在全局中使用`new ValidationPipe()`，就可以省略很多代码，

```ts
// main.ts
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        });
    );
```

特别的`ValidationPipe`还可以接受参数，如上述`whitelist`为 `true` 时，`Nest`将过滤掉实体中不存在的字段。 比如实体只有`name`，那么后端获取参数上下文时，将忽略掉其他参数（既获取不了），大大增加了后端的安全性，防止前端传入太多的垃圾数据。
