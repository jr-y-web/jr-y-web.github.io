# Ts 巩固一下 Ts 的基础

`TypeScript`简单吗？简单啊，无非就是 js 用法，然后额外对参数对方法写上对应的类型注解。难吗？也难，类型写完只是第一步，如果写的精妙，用最少的类型注解维护更健壮的代码，需要熟练掌握它的语法，为此基础格外的重要。

## 基础

### 原始类型

除了最常见的 `number` / `string` / `boolean` / `null` / `undefined，` ECMAScript 2015（ES6）、2020 (ES11) 又分别引入了 2 个新的原始类型：`symbol` 与 `bigint`:

```ts
const values: number = 1;
const name: string = "字符串";
const start: boolean = true;
const undef: undefined = undefined;
const nul: null = null;
const obj: object = { name, age, male };
const bigintVar1: bigint = 9007199254740991n;
const bigintVar2: bigint = BigInt(9007199254740991);
const symbolVar: symbol = Symbol("unique");
```

和`JS`一样，`undefined`与`null`这两个的特殊性也值得一说，前者表面了`这里没有值，没有定义`，后者则是`定义了，但这里有值，是空值`，

### viod

`viod`并非是一个类型，它是用来描述函数在`return`后的类型，或者有没有`return`，所以额外也非常简单明了；

```ts
function getData(): void {
  // 逻辑，这里没有return东西，所以为void
}
```

### 数组 & 对象

在说明数组和对象如何定义之前，应该先快速了解一下`interface`。 `interface`是一种定义对象形状（即结构）的方式。它允许你定义一个合约，任何实现了该接口的对象都必须遵循这个合约，也就是要包含接口中定义的所有属性和方法，并且这些属性和方法的类型也必须符合接口中的定义。

```ts
interface a {
  name: string;
  age: number;
}
```

那么定义对象的时候，我们完全可以利用 interface 来抽离这块结构的定义：

```ts
interface a {
  name: string;
  age: number;
}
const obj: a = {
  name: "k",
  age: 12,
};
```

数组我们这里可以使用泛型或者简写来处理，还是利用上面的例子，假设我们现在要对数组对象中进行定义，数组每一项都含有 name 和 age 字段：

```ts
interface a {
  name: string;
  age: number;
}

const list1: Array<a> = [
  { name: "ddd", age: 1 },
  { name: "aaa", age: 2 },
];

const list2: a[] = [
  { name: "ddd", age: 1 },
  { name: "aaa", age: 2 },
];
```

### 字面量

字面量就非常简单的理解了，既该变量只能等于这个;

```ts
let saviorName: "alterEgo" = "alterEgo";

saviorName = "infos"; // error，它已经声明了字面量了
```

### any 与 unknown && never

`any`是`ts`给予开发者最后的怜悯，相当于外挂，当使用了`any`后,`ts`就再也不检测了,所以`TypeScript`也经常被戏称为`anyScript`。

```ts
let a: any = 1;

a = "dada";
a = "success";
```

:::warning 注意
想要使用好`TypeScript`就要尽可能的让自己远离`any`
:::

`unknown`与`any`类似，但和`any`最根本的区别是，`unknown`只能赋予自身或者`any`类型定义的参数，简单的说`any`是彻底放弃了治疗，但`unknown`并没有。这一点也体现在对 `unknown` 类型的变量进行属性访问时：

```ts
let unknownVar: unknown;

unknownVar.foo(); // 报错：对象类型为 unknown
```

所以它更多是配合类型断言来使用：

```ts
let unknownVar: unknown;

(unknownVar as { foo: () => {} }).foo();
```

`never`则是一个非常特殊的类型，为所有的类型的最底层类，它代表是“什么都没有”。

## 类型工具

`TypeScript`提供了一些类型工具可以让我们快速的进行类型的定义，方便我们快速的创建以及抽离。

### 联合类型 与 交叉类型

简单的说，联合类型就是“或”，交叉类型就是“且”，

```ts
interface a {
  name: string;
}

interface b {
  age: number;
}

const obj: a | b = { name: "ddd" }; // success 因为是联合类型，满足任意一个即可

const items: a & b = { age: 22 }; // error 它是交叉类型，必须两个类型借口都需要满足
```

### 索引类型

索引类型指的不是某一个特定的类型工具，它其实包含三个部分：索引签名类型、索引类型查询与索引类型访问。目前很多社区的学习教程并没有这一点进行说明，实际上这三者都是独立的类型工具。唯一共同点是，它们都通过索引的形式来进行类型操作，但索引签名类型是声明，后两者则是读取。该知识点非常重要，它贯穿后后续泛型的构成，

#### 索引签名类型

如果一个对象里面的 value 都是属于字符串，需要一个个定义吗？少的还可以，但一旦多起来，比如有 100，定义 100 个肯定不现实，为此`TypeScript`提供了能快速定义这种情况的工具类，既索引签名类型：

```ts
interface allStringItems {
  [key: string]: string;
}

const axitem: allStringItems = {
  a: "1",
  6: "2", // ---> 因为访问对象任何obj[key]中的key都会转化为字符串，所以满足接口的定义
};

const bxItem: allStringItems = {
  a: 67, //--> error 报错，类型定义了对象里面任何value都需要字符串
};
```

当然，如果具体到某个 value 的类型是`number`类型的话，这里可以在接口定义完全，但这个时候，必须都要符合`[key: string]`的类型定义，这里可以用一个简单的交叉类型进行注解：

```ts
interface itmsObj {
  age: number;
  [key: string]: string | number;
}

const a: itmsObj = { age: 12 }; // 这个时候当我们使用age进行一些操作的时候，ts就会自动推导number类型下的方法
```

#### 索引类型查询

严谨地说，它可以将对象中的所有键转换为对应字面量类型，然后再组合成联合类型。注意，这里并不会将数字类型的键名转换为字符串类型字面量，而是仍然保持为数字类型字面量。 更为通俗的说，它能把`interface`(接口)通过遍历转化为字面量并且加以联合类型定义。

```ts
interface DataValueType {
  name: "a";
  value: "b";
}

const c: keyof DataValueType = "name"; // ---> 现在当前参数只能是字面量'name'或'value'
```

用`js`的大白话可以概括为：

```js
Object.keys(Foo).join(" | ");
```

#### 索引类型访问

在`js`中，可以通过`obj[key]`来快速访问对象的值。在 ts 类型中，一样也可以这样快速的访问对应类型的定义；

```ts
interface ax {
  name: "a";
}

const b: ax["name"] = "a"; // 现在变量b只能等于'a'
```

当然现在也可以接口索引类型查询来处理：

```ts
interface DataValueType {
  name: "a";
  value: "b";
}

const c: DataValueType[keyof DataValueType] = "a"; // ---> 变量c只能等于'a'或者'c'
```

### typeof

`ts`提供了两种`typeof`，这里的两种并不是意味着有两种写法，而是 ts 会智能的知道，你想要使用什么 typeof，当你在逻辑上使用 typeof，那么它就会返回对应的类型给你，但如果是在类型定义的情况下使用，那么它就会返回类型的 typeof；

```ts
const str = "linbudu";

const obj = { name: "linbudu" };

const nullVar = null;
const undefinedVar = undefined;

const func = (input: string) => {
  return input.length > 10;
};

type Str = typeof str; // "linbudu"
type Obj = typeof obj; // { name: string; }
type Null = typeof nullVar; // null
type Undefined = typeof undefined; // undefined
type Func = typeof func; // (input: string) => boolean
```

### in 与 instanceof

先说`in`，它可以通过 `key in object` 的方式来判断 `key` 是否存在于 `object` 或其原型链上（返回 `true` 说明存在）。

```ts
interface Foo {
  foo: string;
  fooOnly: boolean;
  shared: number;
}

interface Bar {
  bar: string;
  barOnly: boolean;
  shared: number;
}

function handle(input: Foo | Bar) {
  if ("foo" in input) {
    input.fooOnly;
  } else {
    input.barOnly;
  }
}
```

这里核心是“遍历”，那么扯到遍历，当然我们也可以在定义中使用，比如现在有一个接口，现在我还想生成一个接口，但是我想某个 key 的类型变换一下（当然继承也是可以完成的）：

```ts
interface ax {
  name: "a";
  age: number;
}

type bx<T> = {
  [key in keyof T]: string;
};

const obj: bx<ax> = {
  name: "2e",
  age: "12",
};
```
