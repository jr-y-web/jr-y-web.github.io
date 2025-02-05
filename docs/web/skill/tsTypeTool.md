# TypeScript 内置类型工具函数

`TypeScript`提供了非常多的内置类型工具函数，这里对该内置工具函数做一次收集，并且全面解析它的实现原理。

## `Partial<T>`

`Partial`的作用是将传入的类型，通通都变为可选，实现原理也非常简单，是利用了签名索引类型、以及`in`实现得到：

```ts
type Partial<T> = {
  [key in keyof T]?: T[key];
};
```

## `Required<T>`

`Required`的作用是将传入的类型，都转化为必选，原理与`Partial`类型，区别在于后面需要添加`-?`，它代表了如果有可选`?`，就去掉它，以此实现必选。

```ts
type Required = {
  [key in keyof T]-?: T[key];
};
```

## `Readonly<T>`

`Readonly`从单词就能理解是将全部属性都变为只读，也非常简单，只需要加一个`readonly`的修饰符即可。

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

## `Record<T,U>`

`Record`是根据传入的泛型生成一个对象类型，其中 T 是健类型，U 是值类型，它的实现方式为：

```ts
type Record<T extends keyof any, U> = {
  [key in T]: U;
};
```

需要注意`Record`的 T 能传一个类型也可以是联合类型：

```ts
// 键名均为字符串，键值类型未知
type Record1 = Record<string, unknown>;
// 键名均为字符串，键值类型任意
type Record2 = Record<string, any>;
// 键名为字符串或数字，键值类型任意
type Record3 = Record<string | number, any>;
···
```

## `Pick<T,U>`

`Pick`是根据 U 从 T 中选中的属性生成一个对象类型，这里概念可能不太能理解，直接从实现原理入手：

```ts
interface a {
  name: string;
  age: number;
  work: string | null;
}

type Pick<T, U extends keyof T> = {
  [key in U]: T[key];
};

type UserNameAndAge = Pick<User, "name" | "age">;
// 等同于 { name: string; age: number; }
```

## `Exclude<T，U>`

`Exclude`是根据 U 剔除掉 T 中的类型：

```ts
interface a {
  name: string;
  age: number;
  work: string | null;
}

type Exclude<T, U> = T extends U ? never : T;

type T = string | number | boolean;
type StringOrNumber = Exclude<T, boolean>;
// 等同于 string | number
```

## `Extract<T,U>`

`Extract`是从类型 T 中提取可以赋值给 U 的类型。

```ts
type Exclude<T, U> = T extends U ? T : U;

type T = string | number | boolean;
type StringOrNumber = Extract<T, string | number>;
// 等同于 string | number
```

## `Omit<T,U>`

从类型 T 中排除指定的属性 K。

```ts
interface a {
  name: string;
  age: number;
  work: string | null;
}

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

这里可以发现`Omit`的实现原理利用了`Pick`与`Exclude`。

## `NonNullable<T>`

排出类型 T 中的`null`与`undefined`：

```ts
type NonNullable<T> = T extends null | undefined ? never : T;
```

## `ReturnType<T>`

获取函数类型 T 的返回值类型。

原理：

```ts
type FunctionType = (...args: any) => any;
type ReturnType<T extends FunctionType> = T extends (...args: any) => infer R
  ? R
  : any;
```

用法：

```ts
function getUser() {
  return { name: "Alice", age: 30 };
}

type User = ReturnType<typeof getUser>;
// 等同于 { name: string; age: number; }
```

万一这玩意是一个异步函数呢？或者整个函数并没有返回任何东西的情况，`ReturnType`究竟会得到什么？

### 先说它是异步函数的情况

`ReturnType` 仍然可以获取异步函数的返回值类型，但需要注意异步函数的返回值类型是 `Promise<T>`，其中 Y 是实际的返回值类型:

```ts
async function getUser() {
  return { name: "Alice", age: 30 };
}

// 使用 ReturnType 提取返回值类型
type UserReturnType = ReturnType<typeof getUser>;
// UserReturnType 类型为 Promise<{ name: string; age: number }>
```

当然，也可以借助`Awaited`直接进行接口，拿到 Y 的类型：

```ts
type User = Awaited<ReturnType<typeof getUser>>;
// User 类型为 { name: string; age: number }
```

### 没有返回任何的值的情况

如果函数没有显式返回值（即返回 void），ReturnType 会推断出 void 类型，特别需要注意的是如果函数返回 undefined 或没有 return 语句，ReturnType 也会推断出 void 类型。

```ts
function doNothing() {
  return undefined;
}

// 使用 ReturnType 提取返回值类型
type DoNothingReturnType = ReturnType<typeof doNothing>;
// DoNothingReturnType 类型为 void
```

---

下面是一些不常用的，实现方案就略

## `Capitalize<T>`

作用: 将字符串类型 T 的首字母转换为大写。

```ts
type Greeting = "hello";
type CapitalizeGreeting = Capitalize<Greeting>;
// 等同于 'Hello'
```

## `Uncapitalize<T>`

作用: 将字符串类型 T 的首字母转换为小写。

```ts
type Greeting = "Hello";
type UncapitalizeGreeting = Uncapitalize<Greeting>;
// 等同于 'hello'
```

## `Lowercase<T>`

`Lowercase`将字符串类型 T 转换为小写。

```ts
type Greeting = "HELLO";
type LowercaseGreeting = Lowercase<Greeting>;
// 等同于 'hello'
```

## `Uppercase<T>`

`Uppercase`是将字面量字符串转化为大学的类型。

```ts
type Greeting = "hello";
type UppercaseGreeting = Uppercase<Greeting>;
// 等同于 'HELLO'
```

## `InstanceType<T>`

获取构造函数类型 T 的实例类型。

```ts
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

type UserInstance = InstanceType<typeof User>;
// 等同于 User
```

## `ThisType<T>`

用于指定上下文对象的类型，通常与 this 一起使用。

```ts
interface User {
  name: string;
  greet(): void;
}

const user: User & ThisType<User> = {
  name: "Alice",
  greet() {
    console.log(`Hello, ${this.name}`);
  },
};
```
