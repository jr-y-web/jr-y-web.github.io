# 异步行为

您可能已经注意到本指南的其他部分在调用`wrapper`上的一些方法时使用了`await`，例如`trigger`和`setValue`。这是怎么回事？

您可能知道`Vue`是被动更新的：当您更改值时，`DOM`会自动更新以反映最新的值。`Vue`异步执行这些更新。相比之下，像`Jest`这样的测试运行程序是同步运行的。这可能会在测试中产生一些令人惊讶的结果。

让我们看看一些策略，以确保`Vue`在运行测试时按预期更新`DOM`。

## 一个简单的例子-使用触发器更新

让我们重新使用事件处理中的`<Counter>`组件，只需进行一次更改；我们现在在`template`中呈现`count`。

```js
const Counter = {
  template: `
    <p>Count: {{ count }}</p>
    <button @click="handleClick">Increment</button>
  `,
  data() {
    return {
      count: 0,
    };
  },
  methods: {
    handleClick() {
      this.count += 1;
    },
  },
};
```

让我们写一个测试来验证`count`是否在增加：

```js
test("increments by 1", () => {
  const wrapper = mount(Counter);

  wrapper.find("button").trigger("click");

  expect(wrapper.html()).toContain("Count: 1");
});
```

令人惊讶的是，这次失败了！原因是尽管计数增加了，但`Vue`在下一个事件循环勾选之前不会更新`DOM`。因此，断言（`expect（）`…）将在`Vue`更新`DOM`之前调用。

:::tip 提示
如果您想了解更多关于这个核心 JavaScript 行为的信息，请阅读事件循环及其宏任务和微任务。
:::

撇开实现细节不谈，我们如何解决这个问题？`Vue`实际上为我们提供了一种等待 DOM 更新的方式：`nextTick`。

```js
import { nextTick } from "vue";

test("increments by 1", async () => {
  const wrapper = mount(Counter);

  wrapper.find("button").trigger("click");
  await nextTick();

  expect(wrapper.html()).toContain("Count: 1");
});
```

现在测试将通过，因为我们确保下一个“`tick`”已经执行，并且在断言运行之前`DOM`已经更新。

由于`await` `nextTick()` 很常见，`Vue Test Utils`提供了一个快捷方式。导致`DOM`更新的方法，如`trigger`和`setValue`返回`nextTick`，因此您可以直接等待它们：

```js
test("increments by 1", async () => {
  const wrapper = mount(Counter);

  await wrapper.find("button").trigger("click");

  expect(wrapper.html()).toContain("Count: 1");
});
```

## 解决其他异步行为

`nextTick`有助于确保在继续测试之前在`DOM`中反映反应数据的一些更改。然而，有时您可能希望确保其他与`Vue`无关的异步行为也完成。

一个常见的例子是返回`Promise`的函数。也许你用`jest.mock` `mock`了你的`axios HTTP`客户端：

```js
jest.spyOn(axios, "get").mockResolvedValue({ data: "some mocked data!" });
```

在这种情况下，`Vue`不知道未解析的`Promise`，因此调用`nextTick`将不起作用——您的断言可能会在解析之前运行。对于这样的场景，`Vue Test Utils`公开`flushPromises`，这会导致所有未完成的承诺立即得到解决。

让我们看一个例子：

```js
import { flushPromises } from "@vue/test-utils";
import axios from "axios";

jest.spyOn(axios, "get").mockResolvedValue({ data: "some mocked data!" });

test("uses a mocked axios HTTP client and flushPromises", async () => {
  // some component that makes a HTTP called in `created` using `axios`
  const wrapper = mount(AxiosComponent);

  await flushPromises(); // axios promise is resolved immediately

  // after the line above, axios request has resolved with the mocked data.
});
```

:::tip 提示
如果您想了解有关在组件上测试请求的更多信息，请务必查看《生成 HTTP 请求》指南。
:::

## 测试异步 `setup`

如果要测试的组件使用异步`setup`，则必须将该组件装入`Suspendse`组件中（就像在应用程序中使用它时一样）。

例如，此异步组件：

```js
test("Async component", async () => {
  const TestComponent = defineComponent({
    components: { Async },
    template: "<Suspense><Async/></Suspense>",
  });

  const wrapper = mount(TestComponent);
  await flushPromises();
  // ...
});
```

::: warning 注意
若要访问`Async`组件的底层 vm 实例，请使用`wrapper.findComponent（Async）`的返回值。由于在这种情况下定义并安装了新组件，因此`mount（TestComponent）`返回的包装器包含其自己的（空）`vm`。
:::

## 结论

- `Vue`异步更新`DOM`；测试运行程序以同步方式执行代码。
- 使用`await nextTick()`确保在测试继续之前 DOM 已经更新。
- 可能更新`DOM`的函数（如`trigger`和`setValue`）返回`nextTick`，因此需要`await`它们。
- 使用`Vue Test Utils`中的 f`lushPromises`来解决来自非`Vue`依赖项（如 API 请求）的任何未解决的异步。
- 使用`Suspense`可以在异步测试函数中测试具有异步`setup`组件。
