# 泛型全解

“没玩过泛型也好意思说你用`TypeScript`”？

## 基本概念

泛型在`TypeScript`中属于最核心的功能，基本上一些高阶技巧都围绕着它来转，它拔高了`TypeScript`的上限，那么什么是泛型？这里就打一个最基础的例子，假设有一个函数，需要根据它传入什么类型，然后再加以返回相同的类型，那么不用泛型的情况下，是怎么写的呢？

```ts
const fn = (x: number | string | object): number | string | object => {};
return x;
```

这里我只列举了三种情况，但万一这个 x 的格式千千万万呢？比如具体到这个 x 是对象，那么里面含有 y、z 等等属性需要做不同情况的返回呢？那么显然，并不能一一书写出来，为此泛型就是这个时候派上用场。

```ts
interface typedatqa {
  name: string;
  age: number;
}

const fn = <T>(x: T): T => {
  return x;
};

const data1 = fn<typedatqa>({
  name: "1",
  age: 22,
});

const data2 = fn<number>(2);
```

这里可以简单的理解一下，所谓泛型既我们把类型当作参数一样传入到类型注解中（这里的 T 是随便定义的，也可以定义为 U、K...），当然上述例子可能并不能很好的揭开泛型的作用，一步步来。

## 从类型别名初探泛型

用法也非常简单，格式如下：

```ts
type fnType<T> = T ｜ number | string
```

当然，在类型别名中使用泛型，更多是结合索引签名类型来使用，比如现在需要根据传入的泛型 T，让这个类型的对象的键都属于 `string` 类型：

```ts
type allObjString<T> = {
  [key in keyof T]: string;
};

interface a {
  name: 1;
  age: "22";
}

const obj1: allObjString<a> = {
  name: "1",
  age: "22",
}; // --> success 符合定义要求

const obj2: allObjString<a> = {
  name: "1",
  age: 44,
}; // --> error 不符合定义要求
```

就如上述例子，通过传入的泛型参数，结合`keyof`把该键输出出来后，又使用`in`遍历，然后再定义全部为字符串类型。概念有点难懂，但只要理解了，泛型就是一个类型参数，现在我们把类型定义当作了函数一般，而泛型就是这个这个类型方法的参数。

当然，泛型的用途远不至这点程度，它还能实现更为高阶的技巧。在`js`中三目运算符应该都使用试过过，根据是否满足当前条件，调用`:`前或者后的逻辑，因为前面多次强调了泛型是一个参数，自然我们也可以使用三目运算符，来达到更强劲的技巧。

```ts
type resultType<T extends number> = T extends 200 | 201 | 203
  ? "success"
  : "error";

const v1: resultType<2> = "success"; // ---> error // 虽然满足传入泛型是数字类型，但根据判断它不是字面量200 | 201 | 203，所以根据三目运算符执行后面，既必须只能等于`error`
const v2: resultType<203> = "success"; // ---> success  满足全部条件
const v3: resultType<"203"> = "error"; //---> error  不满足，直接报错
```

从上述就多少窥探出泛型的强大之处。

## 多泛型关联

不仅可以同时传入多个泛型参数，还可以让这几个泛型参数之间也存在联系。我们可以先看一个简单的场景，条件类型下的多泛型参数：

```ts
type Conditional<Type, Condition, TruthyResult, FalsyResult> =
  Type extends Condition ? TruthyResult : FalsyResult;

//  "passed!"
type Result1 = Conditional<"linbudu", string, "passed!", "rejected!">;

// "rejected!"
type Result2 = Conditional<"linbudu", boolean, "passed!", "rejected!">;
```

这个例子表明，多泛型参数其实就像接受更多参数的函数，其内部的运行逻辑（类型操作）会更加抽象，表现在参数（泛型参数）需要进行的逻辑运算（类型操作）会更加复杂。

上面我们说，多个泛型参数之间的依赖，其实指的即是在后续泛型参数中，使用前面的泛型参数作为约束或默认值：

```ts
type ProcessInput<
  Input,
  SecondInput extends Input = Input,
  ThirdInput extends Input = SecondInput
> = number;
```

这里的内部类型操作并不是重点，我们直接忽略即可。从这个类型别名中你能获得哪些信息？

这个工具类型接受 1-3 个泛型参数。
第二、三个泛型参数的类型需要是首个泛型参数的子类型。
当只传入一个泛型参数时，其第二个泛型参数会被赋值为此参数，而第三个则会赋值为第二个泛型参数，相当于均使用了这唯一传入的泛型参数。
当传入两个泛型参数时，第三个泛型参数会默认赋值为第二个泛型参数的值。
多泛型关联在一些复杂的工具类型中非常常见，我们会在后续的内置类型讲解、内置类型进阶等章节中再实战，这里先了解即可。

## 对象类型中的泛型

最为常见还是定义接口返回类型的时候使用：

```ts
interface pormiseResovel<T> {
  data: T[];
  start: number;
  msg: string;
}

const data: pormiseResovel<{ name: string; age: number }> = {
  msg: "1",
  start: 200,
  data: [{ name: "1", age: 2 }],
};
```

当然，嵌套是可以发生多层级的。

```ts
interface IPaginationRes<TItem = unknown> {
  data: TItem[];
  page: number;
  totalCount: number;
  hasNextPage: boolean;
}

function fetchUserProfileList(): Promise<
  IRes<IPaginationRes<IUserProfileRes>>
> {}
```

但还是万变不离其宗，只需要深入理解就是泛型就是一个类型参数即可。

## 函数中的泛型

先说格式：

```ts
function fn<T>(x: T): T {
  return x;
}
```

当然，使用箭头函数也是可以的：

```ts
const fn = <T>(x: T): T => {
  return x;
};
```

从例子上来说，很清晰就能知道，我们是根据传入的泛型是什么，对应返回什么类型出去。

我们为函数声明了一个泛型参数 T，并将参数的类型与返回值类型指向这个泛型参数。这样，在这个函数接收到参数时，T 会自动地被填充为这个参数的类型。这也就意味着你不再需要预先确定参数的可能类型了，而在返回值与参数类型关联的情况下，也可以通过泛型参数来进行运算。

在基于参数类型进行填充泛型时，其类型信息会被推断到尽可能精确的程度，如这里会推导到字面量类型而不是基础类型。这是因为在直接传入一个值时，这个值是不会再被修改的，因此可以推导到最精确的程度。而如果你使用一个变量作为参数，那么只会使用这个变量标注的类型（在没有标注时，会使用推导出的类型）。

最后来一个很经典的函数泛型的例子，比如现在我们有需求如下，一个函数接受一个长度为 2 的一维数组，数组的两项类型各不同，函数最终 return 是将这两个数组项的位置互换，使用`ts`进行定义该如何书写：

```ts
const fn = <T, U>([x, y]: [T, U]): [U, T] => {
  return [y, x];
};

const a = fn<1, string>([1, "2"]); // --->  a的类型为[string, 1]
```

## 在数组中使用泛型

这个就非常的简单了，直接上写法：

```ts
interface listType {
  name: string;
  age: number;
}
const lsit: Array<listType> = [{ name: "1", age: 2 }];
```

## 在类中使用泛型

Class 中的泛型和函数中的泛型非常类似，只不过函数中泛型参数的消费方是参数和返回值类型，Class 中的泛型消费方则是属性、方法、乃至装饰器等。同时 Class 内的方法还可以再声明自己独有的泛型参数。我们直接来看完整的示例：

```ts
class Queue<TElementType> {
  private _list: TElementType[];

  constructor(initial: TElementType[]) {
    this._list = initial;
  }

  // 入队一个队列泛型子类型的元素
  enqueue<TType extends TElementType>(ele: TType): TElementType[] {
    this._list.push(ele);
    return this._list;
  }

  // 入队一个任意类型元素（无需为队列泛型子类型）
  enqueueWithUnknownType<TType>(element: TType): (TElementType | TType)[] {
    return [...this._list, element];
  }

  // 出队
  dequeue(): TElementType[] {
    this._list.shift();
    return this._list;
  }
}
```

其中，enqueue 方法的入参类型 TType 被约束为队列类型的子类型，而 enqueueWithUnknownType 方法中的 TType 类型参数则不会受此约束，它会在其被调用时再对应地填充，同时也会在返回值类型中被使用。
