# TypeScript 结构化类型系统与实现模拟标称类型系统

在`TypeScript`中存在下面这种“牛头不对马嘴”的类型注解，但神奇它又能正常运行的代码：

```ts
class Cat {
  eat() {}
}

class Dog {
  eat() {}
}

const getCat = (cat: Cat): string => {
  return "恭喜你获取一只猫";
};

getCat(new Dog()); // --- 不会报错
```

这里`getCat`方法明确了我要一只猫，但实际中给到给方法一只狗的时候，方法依旧不会报错，为什么`TypeScript`在这方面没办法做出准确的判断呢？这里就要引出`TypeScript`的类型系统特征：**_结构化类型系统_**。

## 结构化类型系统

回到一开始的例子，如果将例子中`Cat`类新增一个独特的方法，那么`TypeScript`的类型检查机制就会符合预期，方法需要猫的时候，必须传递符合`Cat`类才不会报错。

```ts
class Cat {
  eat() {}
  actingCute() {
    return "只有猫的卖萌才是卖萌！";
  }
}

class Dog {
  eat() {}
}

const getCat = (cat: Cat): string => {
  return "恭喜你获取一只猫";
};

getCat(new Dog()); // --- 报错
```

why? 其实`TypeScript`去比较类型的时候，并不使用类型的名称，它通过比较不同类型实际拥有的方法和属性，简单的说，它实际比较`Cat`类上的属性和方法，是否都存在于`Dog`类上。在一开始的例子中，`Cat`类和`Dog`类所实际拥有的方法和属性都一致，虽然不一样的类名，但其实相当于是结构相同只是名字不一样的类，`TypeScript`依然视为一样的结构，符合约束。 这就是结构化类型系统的特征，俗称`鸭子类型（Duck Typing）`。

> 鸭子类型（Duck Test）: 如果你看到一只鸟走起来像鸭子，游泳像鸭子，叫得也像鸭子，那么这只鸟就是鸭子。

那么此时往`Dog`类额外新增一个独特的方法，是否就能让`TypeScript`的类型检查符合预期？

```ts
class Cat {
  eat() {}
}

class Dog {
  eat() {}
  notActingCute() {}
}

const getCat = (cat: Cat): string => {
  return "恭喜你获取一只猫";
};

getCat(new Dog());
```

依旧不会报错，这是因为`TypeScript`的结构化类型系统认为`Dog`已经符合对`Cat`的完全实现，额外`notActingCute`的方法可以被认为是外部继承后新加入的方法，相当于是可以理解为`Dog`是`Cat`的子类。这就是结构化类型系统的核心理念，即基于类型结构进行判断类型兼容性。结构化类型系统在 C#、Python、Objective-C 等语言中都被广泛使用或支持。

严格来说，鸭子类型系统和结构化类型系统并不完全一致，结构化类型系统意味着基于完全的类型结构来判断类型兼容性，而鸭子类型则只基于运行时访问的部分来决定。也就是说，如果我们调用了走、游泳、叫这三个方法，那么传入的类型只需要存在这几个方法即可（而不需要类型结构完全一致）。但由于 TypeScript 本身并不是在运行时进行类型检查（也做不到），同时官方文档中同样认为这两个概念是一致的（One of TypeScript’s core principles is that type checking focuses on the shape that values have. This is sometimes called “duck typing” or “structural typing”.）。因此在这里，我们可以直接认为鸭子类型与结构化类型是同一概念。

## 结构化类型系统带来的坑

结构化类型系统会存在什么问题？还是从一个例子进行解析：

```ts
type CNY = number;
type HKD = number;

const oneValue: CNY = 100;
const twoValue: HKD = 100;

const doubleIncome = (value1: CNY, value2: CNY) => {
  return value1 + value2;
};

doubleIncome(oneValue, twoValue); // --> 成功
```

例子输出是现在有两次收款，两次都是获得 100 元，但不一样的是第一次获得是人民币，但第二次是港币。那么这个时候需要统计两次的收款总数。在生活常识中很自然就能明白人民币和港币不能直接相加，它们是不一样的汇率。但从`TypeScript`角度来说，它们是可以相加的，毕竟都符合`number`类型，既在结构化类型系统中，CNY 与 HKD 是一样的类型。 为此需要让`TypeScript`明白，有什么哪怕符合结构，但类型名称不一样它就不符合约束,既需要实现`标称类型系统`。

> **_标称类型系统（Nominal Typing）_**是一种类型检查机制，它基于类型的名称或标识符来判断类型是否相同。在标称类型系统中，两个类型即使具有相同的结构（即相同的属性和方法），如果它们的名称不同，那么它们就被认为是不同的类型。

## 标称类型系统

要在 `TypeScript` 中实现，其实也只需要为类型额外附加元数据即可，比如 CNY 与 HKD，我们分别附加上它们的单位信息即可，但同时又需要保留原本的信息（即原本的 `number` 类型）。

我们可以通过交叉类型的方式来实现信息的附加，创建一个工具类型，让 type 具有标识单位：

```ts
declare class TagProtector<T extends string> {
  protected __tag__: T;
}
type Nominal<T, U extends string> = T & TagProtector<U>;

type CNY = Nominal<number, "CNY">;
type HKD = Nominal<number, "HKD">;

const oneValue = 100 as CNY;
const twoValue = 100 as HKD;

const doubleIncome = (value1: CNY, value2: CNY) => {
  return (value1 + value2) as CNY;
};

doubleIncome(oneValue, oneValue); // --> 成功
doubleIncome(oneValue, twoValue); // --> 报错
```

在这里我们使用 `TagProtector` 声明了一个具有 `protected` 属性的类，使用它来携带额外的信息，并和原本的类型合并到一起，就得到了 `Nominal` 工具类型。这一实现方式本质上只在类型层面做了数据的处理，在运行时无法进行进一步的限制。我们还可以从逻辑层面入手进一步确保安全性，可以回想最上述的例子中，往`Cat`类中额外加入了`actingCute`方法。

```ts
class CNY {
  private _tag: void;
  constructor(public value: number) {}
}

class HKD {
  private _tag: void;
  constructor(public value: number) {}
}

const oneValue = new CNY(100);
const twoValue = new HKD(100);

const doubleIncome = (value1: CNY, value2: CNY) => {
  return value1.value + value2.value;
};

doubleIncome(oneValue, oneValue); // --> 成功
doubleIncome(oneValue, twoValue); // --> 报错
```

两种方式的本质都是通过额外属性实现了类型信息的附加，从而使得结构化类型系统将结构一致的两个类型也判断为不可兼容，在 `TypeScript` 中我们可以通过类型或者逻辑的方式来模拟标称类型，这两种方式其实并没有非常明显的优劣之分，基于类型实现更加轻量，你的代码逻辑不会受到影响，但难以进行额外的逻辑检查工作。而使用逻辑实现稍显繁琐，但你能够进行更进一步或更细致的约束。