# Nest.js 日志系统 与 如何集成 winston

`Nest` 附带一个默认的内部日志记录器实现，它在实例化过程中以及在一些不同的情况下使用，比如发生异常等等（例如系统记录）。这由 @nestjs/common 包中的 Logger 类实现。你可以全面控制如下的日志系统的行为：

- 完全禁用日志
- 指定日志系统详细水平（例如，展示错误，警告，调试信息等）
- 覆盖默认日志记录器的时间戳（例如使用 ISO8601 标准作为日期格式）
- 完全覆盖默认日志记录器
- 通过扩展自定义默认日志记录器
- 使用依赖注入来简化编写和测试你的应用
- 你也可以使用内置日志记录器，或者创建你自己的应用来记录你自己应用水平的事件和消息。

更多高级的日志功能，可以使用任何 Node.js 日志包，比如 Winston，来生成一个完全自定义的生产环境水平的日志系统。

## 基础配置

`Nest`的日志是可以设置关闭的，在应用构建中(`NestFactory.create()`)，只需要传递第二个参数（可选的，`Object`）设置`logger`为`false`即可。（默认为`true`）

```js{9,12}
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

declare const module: any;

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: false  // 关闭所有日志
    });
    app.setGlobalPrefix('api');
    await app.listen(3001);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();
```

它同时还支持设置显示等级，只设置一个字符串形式的 logger 属性数组以确定要显示的日志水平：

```js
// main.ts

//... 省略
const app = await NestFactory.create(AppModule, {
  logger: ["error", "warn"], //  log等级的日志将不会显示出来
});
//... 省略
```

等级优先级为 `error` > `warn` > `log` ， 即如果只设置了`logger: ['warn']` 的情况下，`error`依旧会打印出来。

## 在 Controller （控制器）中使用

使用的方法也极其简单，只需要`new logger`后，即可使用，同时在`new`的过程中，还可以传递一个 name 来标识是在哪个`controller`下输出的日志，它是**全局**的注入，所以这里并不需要在`**.model.ts`中去完成注入。

```js
export class UserController {
    private logger = new Looger(UserController.name) // 标识

    // 用法
    this.logger.warn()
    this.logger.log()
    this.logger.error()
}

```

## 集成 winston

一般官方内置的日志系统，多用于在开发中进行调试。 如果存在把日志写入到文件一类的操作，那么内置的会存在一定的局限性。 为此采用`winston`库就可以大大改善对日志的记录方式（有其他的库解决方案），它是一款强大的全面而且高度集成的日志库。

先进行一个安装，这里安装`winston`本体，以及与`Nest`的集成方案`nest-winston`；

```js
pnpm i nest-winston winston
```

如果要集成`winston`简单的说，就是去替换当前内置的日志系统（自定义日志），首先，先在`main.ts`处进行初始化日志的输出模式与替换;

```js
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { utilities, WinstonModule } from 'nest-winston';
declare const module: any;

async function bootstrap() {
    //配置winston
    const instance = winston.createLogger({
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.timestamp(),
                    utilities.format.nestLike(),
                ),
            }),
        ],
    });

    const app = await NestFactory.create(AppModule, {
        // 替换内置logger
        logger: WinstonModule.createLogger({
            instance,
        }),
    });
    app.setGlobalPrefix('api');
    await app.listen(3001);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();

```

然后就可以通过依赖注入的形式传递到每个模块中,需要注意的是，这里因为属于跨模块使用，所以需要在`app.modules.ts`注入的时候，同时也要把`exports`出来，并且还需要把`app.modules.ts`当成一个全局模块，不然`Nest.js`会不认识这个模块。

```js
// app.module.ts

@Global()
@Module({
    imports: [
        //省略
    ],
    providers: [Logger],
    exports: [Logger],
})

```

使用的情况，这里拿`user.controller.ts`举例;

```js
// user.controller.ts
export class UserController {
    constructor(
        private userService: UserService,
        @Inject(Logger) private readonly logger: Logger,
    ) { }
}
```

## 生成本地日志文件

有了上述集成了`winston`后，如果要生成当前日志到本地项目文件夹，还需要借助`winston-daily-rotate-file`库；

```js
pnpm i winston-daily-rotate-file
```

然后回到配置`winston`的`main.ts`中，创建一个`DailyRotateFile`配置；

```js
// 省略
import "winston-daily-rotate-file";

async function bootstrap() {
  //配置winston
  const instance = winston.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          utilities.format.nestLike()
        ),
      }),
      new winston.transports.DailyRotateFile({
        dirname: process.cwd() + "/log", // 文件到哪个目录
        filename: "alterEgo_log-%DATE%.log", // 输出日志文件名
        datePattern: "YYYY-MM-DD",
        zippedArchive: true, // 是否压缩
        maxSize: "20m",
        maxFiles: "7d",
        level: "warn", // 不同 level 会划分到不同文件
      }),
      new winston.transports.DailyRotateFile({
        dirname: process.cwd() + "/logs", // 文件到哪个目录
        filename: "Err_alterEgo_log-%DATE%.log", // 输出日志文件名
        datePattern: "YYYY-MM-DD",
        zippedArchive: true, // 是否压缩
        maxSize: "20m",
        maxFiles: "7d",
        level: "error",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.simple()
        ),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance,
    }),
  });

  // 省略
}
```

其中，`DailyRotateFile`支持的属性分别为：
| 属性名 | 作用 |  
| ------------- | :-----------: |
| dirname | 文件输出到哪个目录下的文件夹 |
| filename | 日志文件名，其中 %DATE% 为时间 |  
| datePattern | 时间格式 |
| zippedArchive | 是否需要压缩，默认为 false |
| maxSize | 单个日志文件大小上限，超出则会换成另一个文件 |
| maxFiles | 日志最大保留时间 |
| level | 当前配置的日志写入等级(比如如果是 error，warn 与 info 将不会写入到文件中) |
| format | 自定义输出模式 |

现在，只要使用到`logger`的时候就会根据`level`记录到本地项目中。

## 结合异常过滤器来记录日志

一般来说接口的报错往往都需要记录到本地的日志当中，但在各个接口活着服务中，写上`try.. catch`的代码会让代码看起来非常的不美观，`Nest`中生命周期的最后一环就是过滤器，其中内置的异常层负责处理整个应用程序中的所有抛出的异常。当捕获到未处理的异常时，最终用户将收到友好的响应，所以不必去写`try.. catch`，当报错的时候交给异常过滤器捕获，然后在其写入日志即可。

先在 src 创建`filter/http-exception.filter.ts`, 它存在则固定的写法，方法必须含有`catch`方法，并且需要被`@Catch`装饰器修饰；

```js
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";

@Catch(HttpException)
export class HttpExceptionFiltern implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {}
}
```

其中, `host`中有`switchToHttp`方法，它返回当前报错的上下文信息，`exception`是`nest`的原生报错应该返回的信息，ok 有了这一点，就可以很简单设置返回内容，以及生存本地错误日志，稍微再改造一下这个异常过滤器，把`logger`依赖注入过来。

```js
//  http-excetion-filter.ts

import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    LoggerService,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFiltern implements ExceptionFilter {
    constructor(private logger: LoggerService) { }   // 注入looger
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();

        this.logger.error({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        });

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}


```

然后再`main.ts`把`logger`注入到异常过滤器

```js
app.useGlobalFilters(new HttpExceptionFiltern(logger));
```

### 完成代码：

```js

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { utilities, WinstonModule } from 'nest-winston';
import 'winston-daily-rotate-file';
import { HttpExceptionFiltern } from './filters/http-exception.filter';

declare const module: any;

async function bootstrap() {
    //配置winston
    const instance = winston.createLogger({
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.timestamp(),
                    utilities.format.nestLike(),
                ),
            }),
            new winston.transports.DailyRotateFile({
                dirname: process.cwd() + '/logs', // 文件到哪个目录
                filename: 'Err_alterEgo_log-%DATE%.log', // 输出日志文件名
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true, // 是否压缩
                maxSize: '20m',
                maxFiles: '7d',
                level: 'error',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.simple(),
                ),
            }),
        ],
    });

    const logger = WinstonModule.createLogger({
        instance,
    });
    const app = await NestFactory.create(AppModule, {
        logger,
    });
    app.useGlobalFilters(new HttpExceptionFiltern(logger));
    app.setGlobalPrefix('api');

    await app.listen(3001);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();

```
