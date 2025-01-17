# 快速定义 DTO 的方法

`Nest.js`的更新 DTO 以及创建 DTO，以及参数是体类经常会出现重复的情况，会造成编写一些重复的代码，而且这些工作是我们经常使用的，这里就列举了一些快速的办法，提供日后的参考。

## 继承

毫无疑问，因为实体以及 DTO 都是属于 class，那么继承就是最常用的办法，这里可以结合 Ts 的方法快速的创建定义 DTO。当前也可以直接继承类，不过现实中一般挺少会使用这种情况。

### PartialType

该 Ts 类型方法可以将当前的参数全部变为可选，用于该继承需要源类的全部参数，且每一个参数都不是必备。

```ts
import { PartialType } from "@nestjs/mapped-types";
import { CreateAaaDto } from "./create-aaa.dto";

export class UpdateAaaDto extends PartialType(CreateAaaDto) {
  // 额外可以添加属性
}
```

:::warning 注意
但注意，因为 PartialType 是将全部属性转为可选属性，所以 DTO 中`class-validator`的装饰器`@IsNotEmpty`将不起作用。
:::

### PickType

上述的情况一般都挺少出现的，一般来说只需要继承个别的属性。最简单的例子就是添加数据以及修改数据，修改数据的 DTO 往往会多一个 id 属性，且只能改一些特定的属性，所以这个时候就需要 PickType 属性上场了，它的作用是用于继承某个类中的一些特定的属性（毕竟现在是拿类当作类型继承）。

```ts
import { PartialType, PickType } from "@nestjs/mapped-types";
import { CreateAaaDto } from "./create-aaa.dto";

export class UpdateAaaDto extends PickType(CreateAaaDto, ["age", "email"]) {
  id: string;
}
```

### OmitType

OmitType 则和 PickType 相反，它是剔除这个类某些属性，其余全部继承。

```ts
import { OmitType, PartialType, PickType } from "@nestjs/mapped-types";
import { CreateAaaDto } from "./create-aaa.dto";

export class UpdateAaaDto extends OmitType(CreateAaaDto, [
  "name",
  "hoobies",
  "sex",
]) {}
```

### IntersectionType

IntersectionType 则是将多个类型合并。

```ts
import { IntersectionType } from "@nestjs/mapped-types";
import { CreateAaaDto } from "./create-aaa.dto";
import { XxxDto } from "./xxx.dto";

export class UpdateAaaDto extends IntersectionType(CreateAaaDto, XxxDto) {}
```
