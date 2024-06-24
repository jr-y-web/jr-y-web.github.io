# 模块

模块是具有`@Module`装饰器的类，`@Module`装饰器提供了元数据，Nest 用它来组织应用程序结构。 简单的说，它就是程序功能的一个基本单位，每个 Nest 应用程序至少有一个模块，即根模块(`app.moduel`)。根模块是 Nest 开始安排应用程序树的地方。

`@Moduel`装饰器一般接受四个属性来描述该模块的功能，它分别为控制器`controller`、服务`providers`、 import`导入`、导出`exports`:

- providers 由 Nest 注入器实例化的提供者，并且可以至少在整个模块中共享
- controller 必须创建的一组控制器
- imports 导入模块的列表，这些模块导出了此模块中所需提供者
- exports 由本模块提供并应在其他模块中可用的提供者的子集

## 基本的功能模块

就如概述所说模块的程序的功能的一个基本单位，既如果一个控制器`controller`以及服务`providers`都是这个“功能程序”的，它就应该移动到同一个模块下（既被装饰器`@Moduel`修饰，以及同一个文件夹下）。举个例子，现在创建一个猫 Cat 模块：

```ts
// cat/cat.modudel.ts

import { Module } from "@nestjs/common";
import { CatsController } from "./cats.controller";
import { CatsService } from "./cats.service";

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

:::tip 提示
当然也可以直接使用`Nest.js`强大的 cli 工具快速创建模块。 `nest g mo <模块名>`
:::

当然模块是创建了，

## 模块导出

模块与模块之前是可以相互导入的，举个例子现在有猫 Cat 模块，同时有动物 zoon 模块，zoon 模块想要在某处功能中复用猫模块的服务 CatsService。 那么只需要在猫 cat 模块中，设定让猫 cat 模块支持导出，然后在动物 zoon 模块进行引入，那么就完成了对猫模块的注入。

导出服务：

```ts
// cat.modudel.ts
@Module({
    ...,
    exports: [CatsService]  // 导出模块
})
```

注入其他服务:

```ts
// zoon.modudel.ts
import { CatsModule } from  './cat/cat.modeul'

@Module({
    ...,
    import: [CatsModule]  // 注入其他模块
})
```

那么这个时候动物 zoone 模块就可以使用注入模块的服务。

比较有趣的是，这里对于 zoon 模块来说，它还可以以类似“中间人”的操作，导出`CatsModule`模块，只需要同时`import`某模块后再导出对应的模块。

```ts
// zoon.modudel.ts
import { CatsModule } from  './cat/cat.modeul'

@Module({
   ...,
   import: [CatsModule],  // 注入其他模块
   exports: [CatsModule]  // 中间人导出别人的模块
})
```

## 全局模块

如何这个模块不断的被其他模块引入，又不想重复写相同重复的代码，那么可让模块为全局模块。只需要该模块装饰器`@Moduel`上额外的加上装饰器`@Global`即可，添加后其他模块想要注入该模块的服务就不需要在 import 中引入。

```ts
// cat/cat.modudel.ts

import { Module, Global } from "@nestjs/common";
import { CatsController } from "./cats.controller";
import { CatsService } from "./cats.service";

@Global() // 现在cat模块是全局模块
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

:::tip 提示
使一切全局化并不是一个好的解决方案。 全局模块可用于减少必要模板文件的数量。 imports 数组仍然是使模块 API 透明的最佳方式。
:::

## 动态模块

模块是支持传递参数的，如果想让某模块支持参数传递就需要改写成类“工厂函数”模式，官方在`@nestjs/common`包中提供了`DynamicModule`类型方便我们对动态函数的格式进行约束和 ts 提示，这里对函数的命名有一定的约定，它可以分为`register`, `forRoot`, `forFeature`。当然上述都是同步的情况，如果是异步则只需要在后面加上`Async`即可。

- register 用一次注册一次
- forRoot 只注册一次，用多次，一般在 AppModule 引入
- forFeature 用了 forRoot 之后，用 forFeature 传入局部配置，一般在具体模块里 imports

举个例子，还是拿猫 cat 模块进行操作，猫模块接收来自使用方的一个参数：

```ts
import { DynamicModule } from "@nestjs/common";
import { CatsController } from "./cats.controller";
import { CatsService } from "./cats.service";

export class CatsModule {
  static register (options):  DynamicModule {
    moduel: CatsModule,
    controllers: [CatsController],
    providers: [
         {
          provide: 'INIT_CONFIG',
          useValue: options,
        },
        CatsService
    ]
  }
}
```

那么这个时候就可以在服务 CatsService 中使用被注入的参数信息。

```ts
// 假设现在有一个模块 import: [CatsModule.register({name: '布尔喵'})]

// cats.service.ts  (cat的服务)
@Controller("cats")
export class CatsController {
  constructor(@Inject("INIT_CONFIG") private init_config) {
    console.log(this.init_config); // --> 根据上述就会打印出{name: '布尔喵'}
  }
}
```
