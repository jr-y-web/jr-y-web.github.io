# Nestjs 连接 mysql 数据库

`Nestjs`官方为了方便开发者操作数据库，所以集成了`TypeOrm`库，让开发者面对数据库的操作时能像正常开发操作`object`一样简单。 那么一开始还是一样需要先安装包；

```js
// npm or cnpm or yarn or pnpm
pnpm i @nestjs/typeorm typeorm mysql2
```

::: tip 提示
这里要用 `mysql2` 而不是 `mysql` , `mysql2`是 `mysql` 模块的替代品，该模块使用 Promise 和回调函数（callback）两种方式来实现异步操作，因此在性能和可维护性上都具有优势。此外，mysql2 模块还新增了支持多语句查询、预处理语句等功能，提供了更丰富的 API，使用起来更方便。 用人话就食`mysql2`在`node`环境下越快越爽。
:::

## 连接前置

既然需要连接`mysql`那必然需要操作系统中有`mysql`，这里可以在本地安装`mysql`也可以通过`docker`进行运行`mysql`镜像。 通过`docker destkop`快速启动了`mysql`服务后，然后在`docker destkop`的`terminal`中使用`root`进行登陆`mysql`。

```js
mysql - uroot - p;
```

或者另起一个本机的终端，通过`docker`命令进去到`mysql`镜像再进行登陆；

```js
docker exec -it <docker-name> mysql -u root -p
```

ok,如果没有报错，那么说明`mysql`镜像已经成功启动。

## 环境变量配置

在一般情况下，数据库的端口会随着环境的变化而变化, 所以就需要根据不同环境传递不同的参数配置，同时为了后期维护性，健值一律通过枚举形式写入。 [Nestjs 配置环境变量](./env.md)

环境变量：

```js
DB_HOST = "localhost";
DB_PORT = 3306;
DB_USERNAME = "root";
DB_PASSWORD = "*****";
DB_DATABASE = "nestjs";

DB_SYNCHRONIZE = true;
DB_TYPE = "mysql";
```

枚举表：

```js
// config.emum
export enum configEmum {
    DB = 'DB',
    DB_HOST = 'DB_HOST',
    DB_TYPE = 'DB_TYPE',
    DB_PORT = 'DB_PORT',
    DB_USERNAME = 'DB_USERNAME',
    DB_PASSWORD = 'DB_PASSWORD',
    DB_DATABASE = 'DB_DATABASE',
    DB_ENTITIES = 'DB_ENTITIES',
    DB_SYNCHRONIZE = 'DB_SYNCHRONIZE',
    LOGGING = 'LOGGING',
}

```

## TypeOrm 接入

首先在`Nest.js`项目中的`app.module.ts`引入`TypeOrmModule`，并且做为模块写入到`imports`中,同时它与`ConfigModule`一样，拥有`forRoot`与`forRootAsync`方法注册，在一般情况下，数据库的端口会随着环境的变化而变化，所以此时一般的做法是通过异步的`forRootAsync`的方式写入配置（当前如果静态也可以）, 使用`forRootAsync`的情况下，还需要把参数注入到`TypeOrmModule`中，不然`useFactory`将无法拿到参数，这算是固定写法了，不需要计较太多；

```js
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { configEmum } from './emum/config.emum';
@Module({
    // ... 省略其他
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) =>
                ({
                    type: configService.get(configEmum.DB_TYPE),  // 数据库类型
                    host: configService.get(configEmum.DB_HOST),  // 数据库地址
                    port: configService.get(configEmum.DB_PORT),  // 数据库端口
                    username: configService.get(configEmum.DB_USERNAME),  // 用户名
                    password: configService.get(configEmum.DB_PASSWORD),  // 密码
                    database: configService.get(configEmum.DB_DATABASE),   // 库名称
                    entities: [],
                    synchronize: configService.get(configEmum.DB_SYNCHRONIZE),
                    logging: ['error'],
                }) as TypeOrmModuleOptions,
        })
    ]
    // ... 省略其他
})
```

ok,如果此刻终端没有报错，说明数据库连接成功。

## 安全性

库搞错，是一个爆炸的事情，这里可以使用官方推荐的测试库`joi`来防止当前不小心写错库和端口的情况；

```js
pnpm i joi
```

还是在`app.moduel.ts`中，在`ConfigModule`配置上进行校验,那么此刻它就会校验环境变量的参数；

```js
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath,
            load: [() => dotenv.config({ path: '.env' })],
            validationSchema: joi.object({
                DB_TYPE: joi.string().valid('mysql', 'mongDB').default('mysql'),
                DB_PORT: joi.number().default(3306),
                DB_HOST: joi.string(),
                DB_USERNAME: joi.string().required(),
                DB_PASSWORD: joi.string().required(),
                DB_DATABASE: joi.string().required(),
                DB_SYNCHRONIZE: joi.boolean().default(false),
            }),
        }),
    ]
})
```
