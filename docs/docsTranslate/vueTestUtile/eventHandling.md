# 事件处理

`Vue`组件通过道具和调用`$emit`来发出事件来相互交互。在本指南中，我们将了解如何使用`emitted()`函数验证事件是否正确发出。

这篇文章也可以从一个[短视频](https://www.youtube.com/watch?v=U_j-nDur4oU&list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA&index=14)进行学习。

## 计算器组件

这里有一个简单的`<Counter>`组件。它有一个按钮，单击该按钮时，会增加内部计数变量并发出其值：

```js
const Counter = {
  template: '<button @click="handleClick">Increment</button>',
  data() {
    return {
      count: 0,
    };
  },
  methods: {
    handleClick() {
      this.count += 1;
      this.$emit("increment", this.count);
    },
  },
};
```

为了完全测试这个组件，我们应该验证是否发出了具有最新计数值的增量事件。

## 断言已发出的事件

为此，我们将依赖`emitted()`方法。它返回一个对象，该对象包含组件发出的所有事件以及数组中的参数。让我们看看它是如何工作的：

```js
test("emits an event when clicked", () => {
  const wrapper = mount(Counter);

  wrapper.find("button").trigger("click");
  wrapper.find("button").trigger("click");

  expect(wrapper.emitted()).toHaveProperty("increment");
});
```

> 如果您以前没有看过 trigger()，请不要担心。它用于模拟用户交互。您可以在 Forms 中了解更多信息。

首先要注意的是，`emitted()`返回一个对象，其中每个键都与一个发出的事件相匹配。在这种情况下，`increment`。

此测试假如要通过。我们确保发出了具有适当名称的事件。

## 断言事件的参数

这很好，但我们可以做得更好！在这种情况下，我们需要检查是否发出了正确的论点`this.$emit（'crement'，this.count）`被调用。

我们的下一步是断言事件包含`count`值。我们通过将一个参数传递给`emitted()`来实现这一点。

```js
test("emits an event with count when clicked", () => {
  const wrapper = mount(Counter);

  wrapper.find("button").trigger("click");
  wrapper.find("button").trigger("click");

  // `emitted()` accepts an argument. It returns an array with all the
  // occurrences of `this.$emit('increment')`.
  const incrementEvent = wrapper.emitted("increment");

  // We have "clicked" twice, so the array of `increment` should
  // have two values.
  expect(incrementEvent).toHaveLength(2);

  // Assert the result of the first click.
  // Notice that the value is an array.
  expect(incrementEvent[0]).toEqual([1]);

  // Then, the result of the second one.
  expect(incrementEvent[1]).toEqual([2]);
});
```

让我们回顾并分解`emitted()`的输出。这些键中的每一个都包含测试期间发出的不同值：

```js
// console.log(wrapper.emitted('increment'))
[
  [1], // first time it is called, `count` is 1
  [2], // second time it is called, `count` is 2
];
```

## 断言复杂事件

想象一下，现在我们的`<Counter>`组件需要发射一个带有附加信息的对象。例如，我们需要告诉任何侦听`@increment`事件的父组件`count`是偶数还是奇数：

```js{12-14}
const Counter = {
  template: `<button @click="handleClick">Increment</button>`,
  data() {
    return {
      count: 0
    }
  },
  methods: {
    handleClick() {
      this.count += 1

      this.$emit('increment', {
        count: this.count,
        isEven: this.count % 2 === 0
      })
    }
  }
}
```

正如我们之前所做的，我们需要在`＜button＞`元素上触发`click`事件。然后，我们使用`emitted(“crement”)`来确保发射正确的值。

```js
test("emits an event with count when clicked", () => {
  const wrapper = mount(Counter);

  wrapper.find("button").trigger("click");
  wrapper.find("button").trigger("click");

  // We have "clicked" twice, so the array of `increment` should
  // have two values.
  expect(wrapper.emitted("increment")).toHaveLength(2);

  // Then, we can make sure each element of `wrapper.emitted('increment')`
  // contains an array with the expected object.
  expect(wrapper.emitted("increment")[0]).toEqual([
    {
      count: 1,
      isEven: false,
    },
  ]);

  expect(wrapper.emitted("increment")[1]).toEqual([
    {
      count: 2,
      isEven: true,
    },
  ]);
});
```

测试复杂的事件有效载荷（如对象）与测试简单的值（如数字或字符串）没有什么不同。

## Composition API

如果您正在使用`Composition API`，那么您将调用`context.emitt()`而不是此`$emit()`。`emitted()`从两者捕获事件，因此您可以使用此处描述的相同技术来测试组件。

## 结论

- 使用`emitted()`访问`Vue`组件发出的事件。
- `emitted(eventName)`返回一个数组，其中每个元素表示一个发出的事件。
- 参数以与发出的顺序相同的顺序存储在数组中的`emitted(eventName)[index]`中
