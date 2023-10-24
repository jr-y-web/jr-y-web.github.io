# 编写易于测试的组件

`Vue-Test-Utils`测试工具可以帮助您编写`Vue`组件的测试。然而，VTU 能做的只有这么多。

以下是编写更易于测试的代码以及编写有意义且易于维护的测试的建议列表。

以下列表提供了一般指导，在常见情况下可能会派上用场。

## 不测试实际详细信息

从用户的角度考虑输入和输出。大致来说，这是在为`Vue`组件编写测试时应该考虑的所有内容：

| 输入     | 示范                              |
| -------- | --------------------------------- |
| 交互点击 | 单击，...任何"人"的互动           |
| Props    | 组件接收的参数                    |
| 数据流   | 来自 API 调用、数据订阅的数据传入 |

| 输入                   | 示范                        |
| ---------------------- | --------------------------- |
| DOM 元素               | 呈现到文档的任何可观察节点  |
| Events                 | 已发出的事件（使用`$emit`） |
| 副作用（Side Effects） | 如`console.log`或 API 调用  |

_其他一切都是实现细节_

请注意，此列表不包括内部方法、中间状态甚至数据等元素。

经验法则是，测试不应该破坏重构，也就是说，当我们在不改变其行为的情况下改变其内部实现时。如果发生这种情况，测试可能依赖于实现细节。

例如，让我们假设一个基本的计数器组件，它具有一个递增计数器的按钮：

```vue
<template>
  <p class="paragraph">Times clicked: {{ count }}</p>
  <button @click="increment">increment</button>
</template>

<script>
export default {
  data() {
    return { count: 0 };
  },
  methods: {
    increment() {
      this.count++;
    },
  },
};
</script>
```

我们可以编写以下测试：

```js
import { mount } from "@vue/test-utils";
import Counter from "./Counter.vue";

test("counter text updates", async () => {
  const wrapper = mount(Counter);
  const paragraph = wrapper.find(".paragraph");

  expect(paragraph.text()).toBe("Times clicked: 0");

  await wrapper.setData({ count: 2 });

  expect(paragraph.text()).toBe("Times clicked: 2");
});
```

请注意，我们在这里是如何更新其内部数据的，我们还依赖于 CSS 类等细节（从用户的角度来看）。

::: tip 提示
请注意，更改数据或 CSS 类名都会导致测试失败。不过，该组件仍将按预期工作。这被称为假阳性。
:::

相反，以下测试尝试使用上面列出的输入和输出：

```js
import { mount } from "@vue/test-utils";

test("text updates on clicking", async () => {
  const wrapper = mount(Counter);

  expect(wrapper.text()).toContain("Times clicked: 0");

  const button = wrapper.find("button");
  await button.trigger("click");
  await button.trigger("click");

  expect(wrapper.text()).toContain("Times clicked: 2");
});
```

像[Vue 测试库](https://github.com/testing-library/vue-testing-library/)这样的库就是建立在这些原则之上的。如果你对这种方法感兴趣，一定要去看看。

## 构建更小、更简单的组件

一般的经验法则是，如果一个组件做得更少，那么测试就会更容易。

制作更小的组件将使它们更易于组合和理解。以下是简化组件的建议列表。

### 提取 API 调用

通常，您将在整个应用程序中执行多个 HTTP 请求。从测试的角度来看，HTTP 请求为组件提供输入，组件也可以发送 HTTP 请求。

:::tip
如果您不熟悉测试 API 调用，请参阅 Making HTTP requests 指南。
:::

### 提取复杂方法

有时，组件可能具有复杂的方法、执行繁重的计算或使用多个依赖项。

这里的建议是提取此方法并将其导入到组件中。通过这种方式，您可以使用 Jest 或任何其他测试运行程序孤立地测试该方法。

这还有一个额外的好处，那就是最终得到了一个更容易理解的组件，因为复杂的逻辑被封装在另一个文件中。

此外，如果复杂的方法很难设置或速度较慢，您可能需要对其进行模拟，以使测试更简单、更快。HTTP 请求的例子就是一个很好的例子——`axios`是一个相当复杂的库！

## 在编写组件之前编写测试

如果事先编写测试，就不会编写不稳定的代码！

我们的速成课程提供了一个例子，说明如何在编写代码之前编写测试，从而产生可测试的组件。它还可以帮助您检测和测试边缘案例。
