# 概述

欢迎使用 Vue Test Utils，Vue.js 的官方测试实用程序库！

这是针对 Vue 3 的 Vue Test Utils v2 的文档。

简而言之：

- [Vue 测试工具 1](https://github.com/vuejs/vue-test-utils/)针对[Vue 2](https://github.com/vuejs/vue/)。

- [Vue 测试工具 2](https://github.com/vuejs/test-utils/)的目标是[Vue 3](https://github.com/vuejs/core/)。

## 什么是 Vue Test Utils ?

`Vue Test Utils（VTU）`是一组实用函数，旨在简化`Vue.js`组件的测试。它提供了一些以隔离方式安装 Vue 组件并与之交互的方法。

让我们看个例子：

```js
import { mount } from "@vue/test-utils";

// The component to test
const MessageComponent = {
  template: "<p>{{ msg }}</p>",
  props: ["msg"],
};

test("displays message", () => {
  const wrapper = mount(MessageComponent, {
    props: {
      msg: "Hello world",
    },
  });

  // Assert the rendered text of the component
  expect(wrapper.text()).toContain("Hello world");
});
```

Vue 测试工具通常与测试运行程序一起使用。受欢迎的测试跑步者包括：

- [Vitest](https://vitest.dev/)，基于终端，具有实验性的浏览器 UI。
- [Cypress](https://www.cypress.io/)， 基于浏览器，支持 Vite，webpack。
- [Playwright](https://playwright.dev/docs/test-components)（实验），基于浏览器，支持 Vite。
- [WebdriverIO](https://webdriver.io/docs/component-testing/vue/)，基于浏览器，支持 Vite、Webpack、跨浏览器支持。

`Vue Test Utils`是一个最小且未绑定的库。对于更具特色、符合人体工程学和固执己见的东西，您可能需要考虑 Cypress 组件测试，它有一个热重载开发环境，或者测试库，它在进行断言时强调基于可访问性的选择器。这两个工具都在后台使用 Vue 测试工具，并公开相同的 API。

## 下一步怎么办？

要了解`Vue Test Utils`的实际操作，请阅读示例，在那里我们使用测试优先的方法构建了一个简单的 Todo 应用程序。

文档分为两个主要部分：

- **入门**，涵盖在测试 Vue 组件时将面临的常见用例。
- **Vue Test Utils in Depth**，探索该库的其他高级功能。

您还可以浏览完整的 API。

或者，如果你更喜欢通过视频学习，这里有很多讲座。
