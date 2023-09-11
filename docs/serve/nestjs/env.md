# Nest.js 环境变量配置

在前端项目中，经常需要使用到项目当前的环境变量。同理的在 Nest.js 中也可以使用环境变量，而且 Nest.js 已经集成了这一块的配置。 要使用环境变量的话，需要安装`@nestjs/config`依赖库。

```js
pnpm i @nestjs/config
```

现在创建一个`.env`的环境变量配置文件，随便写入一些信息：

```js
DB = "mysql";
DB_HOST = "127:0:0:3060";
```

然后，只需要在对应的模块中引入`@nestjs/config`的`ConfigModule`，同时注入到`imports`中，即可完成对环境变量功能的装载。（envFilePath 为环境变量的文件名，框架会自动去根目录查找）

```js
// 拿user.module.ts为例
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { ConfigModule } from "@nestjs/config";
@Module({
  controllers: [
    UserController,
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
  ],
  providers: [UserService],
})
export class UserModule {}
```

获取环境变量，只需要在对应的`model`中的`controller`中引入`@nestjs/config`的`ConfigServe`即可，那么后面就可以在类中`constructor`初始化即可。

```js {9,14}
// user.controller.ts
import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private configService: ConfigService,
    ) { }

    @Get()
    getUser(): any {
        console.log(this.ConfigService.get('DB'))  // log --> mysql
        return this.userService.getUser();
    }

    @Post('/add')
    addUser(): any {
        return this.userService.addUser();
    }
}
```

当然的，这里稍微一般来说，使用枚举会显得代码专业很多，创建一个枚举类，把环境变量的键写入到枚举中，然后改写上述的例子；

```js
//emum/config.emum
export enum configEmum {
    DB = 'DB',
    DB_HOST = 'DB_HOST',
}
```

然后引入即可完成使用

```js
import { configEmum } from "../emum/config.emum";
this.configService.get(configEmum.DB);
```

## 环境变量的全局使用

当然的，现在这个环境变量还**只是**局部使用，比如说有另一个叫 game 的模块，`game.controller`无法引入`ConfigService`来获取环境变量，因为它没有在`game.moduel.ts`引入`ConfigModule`进行模块注入，所以如果想要全局，我们需要在根模块(`app.module.ts`)中引入`ConfigModule`，同时`ConfigModule.forRoot`把里面的变量`isGlobal`置为`true`，那么这个时候环境变量将可以在任意模块中引入`ConfigService`进行获取。

```js {10}
import { Module } from "@nestjs/common";
import { UserController } from "./user/user.controller";
import { UserModule } from "./user/user.module";
import { UserService } from "./user/user.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
```

## 根据不同的环境，使用不同的环境变量

要想实现不同环境模式使用不同的环境变量，那必然需要在运行阶段传入特定的 key 让代码知道该用什么环境变量，这里采用`cross-env`库进行操作。

```js
pnpm i cross-env
```

然后就可以在`package.json`命令中写入环境变量参数

```json
    "scripts": {
        "start:dev": "cross-env NODE_ENV=development nest build --webpack --webpackPath webpack-hmr.config.js --watch",
        "start:prod": "cross-env NODE_ENV=production node dist/main",
    },
```

ok，那么现在可以通过`process.env.NODE_ENV`来获取当前的环境，举个例子创建`.env.development`与`.env.production`

```js {2,4}
// 拿app.module.ts 举例
const envFilePath = `.env.${process.env.NODE_ENV || "development"}`;
// log  --->   根据上述配置，start:dev会log.env.development, prod 则是 .env.production
console.log(process.env.NODE_ENV);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

## 合并环境变量

假设现在有好几个环境，那么不同环境中就要写不同的环境变量，但当有一些变量是每个环境中都是一样的情况该如何？ Nestjs 这里集成了默认配置的设置 load（它接受一个回调函数，回调函数需要键值对），它会在原有使用的环境变量中，叠加设置的环境变量参数。如果当前的环境变量参数有叠加的环境变量参数，那么它会忽视掉叠加的环境变量参数。 这里同时引入`dotenv`库来解析`.env`文件。

```js {4, 11}
// app.moduel.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as dotenv from "dotenv";
const envFilePath = `.env.${process.env.NODE_ENV || "development"}`;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      load: [() => dotenv.config({ path: ".env" })], // 假设.env有DB_hrl ,其他环境变量文件没有，那么它就会叠加到当前环境变量。反之则忽略。
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

## 测试

搞错数据库是一个顶级大问题，日常工作中难免有概率错改环境配置文件里面的参数，为了防止这种这种 Nest 支持在传进环境变量中校验环境变量是否正常，官方这里推荐是使用`joi`库来操作。

```js
pnpm i joi
```

然后还是找到`ConfigModule.forRoot`，这里其中有`validationSchema`属性，举个例子，用最上述的`.env`文件为例子，项目所使用的环境变量必须是`mysql`或者`mongodb`，那么就可以这样设置：

```js
// app.momdule.ts
@Module({
    imports: [
        UserModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath,
            load: [() => dotenv.config({ path: '.env' })],
            validationSchema: joi.object({
                DB: joi.string().valid('mysql', 'mongodb').default('mysql'),
            }),
        }),
    ],
    controllers: [UserController],
    providers: [UserService],
})

```

上述例子断言了环境参数 DB 必须是字符串，且是`mysql`或者`mongodb` ，默认是`mysql`， 当然 joi 也有很多判断方式，比如`joi.number`等等，这需要查阅 [joi](https://joi.dev/api/?v=17.9.1) 的官方文档。
