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

`ParseUUIDPipe`作用是用来校验参入参数是否为`UUID`的内置管道，如果传入参数不是`UUID`它将会报错。

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
