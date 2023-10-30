# Stubs 以及 Shallow Mount

`Vue Test Utils`提供了一些用于`stubbing`组件和指令的高级功能。`stub`是指将自定义组件或指令的现有实现替换为完全不起任何作用的伪实现，这可以简化原本复杂的测试。让我们看一个例子。

## 截断单个子组件

一个常见的例子是，当您想在组件层次结构中显示很高的组件中测试某个东西时。

在本例中，我们有一个`＜App＞`来呈现消息，还有一个`FetchDataFromApi`组件来进行`API`调用并呈现其结果。

```js
const FetchDataFromApi = {
  name: "FetchDataFromApi",
  template: `
    <div>{{ result }}</div>
  `,
  async mounted() {
    const res = await axios.get("/api/info");
    this.result = res.data;
  },
  data() {
    return {
      result: "",
    };
  },
};

const App = {
  components: {
    FetchDataFromApi,
  },
  template: `
    <h1>Welcome to Vue.js 3</h1>
    <fetch-data-from-api />
  `,
};
```

我们不想在这个特定的测试中调用 API，我们只想断言消息是呈现的。在这种情况下，我们可以使用`use`，它出现在`global`挂载选项中。

```js
test("stubs component with custom template", () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        FetchDataFromApi: {
          template: "<span />",
        },
      },
    },
  });

  console.log(wrapper.html());
  // <h1>Welcome to Vue.js 3</h1><span></span>

  expect(wrapper.html()).toContain("Welcome to Vue.js 3");
});
```

请注意，模板显示`<span></span>`、`<fetch data from api/>`在哪里？我们用 stubs 替换了它——在这种情况下，我们通过传递模板来提供自己的实现。

您还可以获得一个默认的`stub`，而不是提供自己的：

```js
test("stubs component", () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        FetchDataFromApi: true,
      },
    },
  });

  console.log(wrapper.html());
  /*
    <h1>Welcome to Vue.js 3</h1>
    <fetch-data-from-api-stub></fetch-data-from-api-stub>
  */

  expect(wrapper.html()).toContain("Welcome to Vue.js 3");
});
```

这将`stub`整个渲染树中的所有`＜FetchDataFromApi/＞`组件，无论它们出现在哪个级别。这就是为什么它在全局挂载选项中。

:::tip 提示
要退出，您可以使用组件中的`key`或组件的名称。如果两者都在 global.stubs 中给定，则将首先使用`key`。
:::

## 截断所有的组件

有时，您可能想要截断所有的自定义组件。例如，您可能有这样一个组件：

```js
const ComplexComponent = {
  components: { ComplexA, ComplexB, ComplexC },
  template: `
    <h1>Welcome to Vue.js 3</h1>
    <ComplexA />
    <ComplexB />
    <ComplexC />
  `,
};
```

想象一下，每个`＜Complex＞`都会做一些复杂的事情，而您只对测试`＜h1＞`是否呈现了正确的问候语感兴趣。你可以这样做：

```js
const wrapper = mount(ComplexComponent, {
  global: {
    stubs: {
      ComplexA: true,
      ComplexB: true,
      ComplexC: true,
    },
  },
});
```

但这是一个很大的样板。`VTU`有一个浅安装选项，可以自动截断所有子组件：

```js
test("shallow stubs out all child components", () => {
  const wrapper = mount(ComplexComponent, {
    shallow: true,
  });

  console.log(wrapper.html());
  /*
    <h1>Welcome to Vue.js 3</h1>
    <complex-a-stub></complex-a-stub>
    <complex-b-stub></complex-b-stub>
    <complex-c-stub></complex-c-stub>
  */
});
```

:::tip 提示
如果您使用的是`VTU V1`，您可能会记得这是浅安装。这种方法仍然可用——这与写`shallow: true.`是一样。
:::

## 用于截断异常子组件

有时，您想要删除除特定组件外的所有自定义组件。让我们考虑一个例子:

```js
const ComplexA = {
  template: "<h2>Hello from real component!</h2>",
};

const ComplexComponent = {
  components: { ComplexA, ComplexB, ComplexC },
  template: `
    <h1>Welcome to Vue.js 3</h1>
    <ComplexA />
    <ComplexB />
    <ComplexC />
  `,
};
```

通过使用浅安装选项，将自动`stubs`所有的子组件。如果我们想要显式地选择退出特定组件的`stubs`，我们可以在`stubs`中提供其名称，并将值设置为`false`。

```js
test("shallow allows opt-out of stubbing specific component", () => {
  const wrapper = mount(ComplexComponent, {
    shallow: true,
    global: {
      stubs: { ComplexA: false },
    },
  });

  console.log(wrapper.html());
  /*
    <h1>Welcome to Vue.js 3</h1>
    <h2>Hello from real component!</h2>
    <complex-b-stub></complex-b-stub>
    <complex-c-stub></complex-c-stub>
  */
});
```

## stubbing 一个异步组件

如果你想退出异步组件，那么有两种行为。例如，你可能有这样的组件:

```js
// AsyncComponent.js
export default defineComponent({
  name: "AsyncComponent",
  template: "<span>AsyncComponent</span>",
});

// App.js
const App = defineComponent({
  components: {
    MyComponent: defineAsyncComponent(() => import("./AsyncComponent")),
  },
  template: "<MyComponent/>",
});
```

第一种行为是使用组件中定义的键来加载异步组件。在这个例子中，我们使用了“`MyComponent`”键。在测试用例中不需要使用`async/await`，因为组件在解析之前已经被`stubb`了。

```js
test("stubs async component without resolving", () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        MyComponent: true,
      },
    },
  });

  expect(wrapper.html()).toBe("<my-component-stub></my-component-stub>");
});
```

第二种行为是使用异步组件的名称。在这个例子中，我们使用“`AsyncComponent`”来命名。现在需要使用`async/await`，因为需要解析`async`组件，然后可以通过`async`组件中定义的名称`stub`。

**确保在 async 组件中定义了一个名称!**

```js
test("stubs async component with resolving", async () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        AsyncComponent: true,
      },
    },
  });

  await flushPromises();

  expect(wrapper.html()).toBe("<async-component-stub></async-component-stub>");
});
```

## stub 指令

有时候指令会做一些非常复杂的事情，比如执行大量的`DOM`操作，这可能会在测试中导致错误(由于 JSDOM 不像整个`DOM`行为)。一个常见的例子是来自各种库的工具提示指令，它们通常严重依赖于测量`DOM`节点的位置/大小。

在本例中，我们有另一个`<App>`，它呈现带有工具提示的消息：

```js
// tooltip directive declared somewhere, named `Tooltip`

const App = {
  directives: {
    Tooltip,
  },
  template: '<h1 v-tooltip title="Welcome tooltip">Welcome to Vue.js 3</h1>',
};
```

我们不希望在这个测试中执行`Tooltip`指令代码，我们只想断言消息已经呈现。在这种情况下，我们可以使用存根，它出现在传递`vTooltip`的`global`挂载选项中。

```js
test("stubs component with custom template", () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        vTooltip: true,
      },
    },
  });

  console.log(wrapper.html());
  // <h1>Welcome to Vue.js 3</h1>

  expect(wrapper.html()).toContain("Welcome to Vue.js 3");
});
```

我们不希望在这个测试中执行`Tooltip`指令代码，我们只想断言消息已经呈现。在这种情况下，我们可以使用存根，它出现在传递`vTooltip`的全局挂载选项中。

```js
test("stubs component with custom template", () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        vTooltip: true,
      },
    },
  });

  console.log(wrapper.html());
  // <h1>Welcome to Vue.js 3</h1>

  expect(wrapper.html()).toContain("Welcome to Vue.js 3");
});
```

:::tip 提示
使用`vCustomDirective`命名方案来区分组件和指令的灵感来自于`<script setup>`中使用的相同方法
:::

有时，我们需要指令功能的一部分(通常是因为一些代码依赖于它)。让我们假设我们的指令在执行时添加了带有工具提示的 CSS 类，这对我们的代码来说是很重要的行为。在这种情况下，我们可以将 true 与模拟指令实现交换

```js
test("stubs component with custom template", () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        vTooltip: {
          beforeMount(el: Element) {
            console.log("directive called");
            el.classList.add("with-tooltip");
          },
        },
      },
    },
  });

  // 'directive called' logged to console

  console.log(wrapper.html());
  // <h1 class="with-tooltip">Welcome to Vue.js 3</h1>

  expect(wrapper.classes("with-tooltip")).toBe(true);
});
```

我们刚刚用我们自己的指令实现交换了我们的指令实现!

:::warning
存根指令在功能组件或`<script setup>`上不起作用，因为 `withDirectives` 函数中缺少指令名。如果你需要模拟功能组件中使用的指令，可以考虑通过测试框架模拟指令模块。请参阅`https://github.com/vuejs/core/issues/6887]`获取解锁此类功能的建议
:::

## 默认插槽与`shallow`

因为`shallow`会取出组件的所有内容，所以在使用`shallow`时不会渲染任何`<slot>`。虽然在大多数情况下这不是问题，但在某些情况下这并不理想。

```js
const CustomButton = {
  template: `
    <button>
      <slot />
    </button>
  `,
};
```

你可以这样使用它：

```js
const App = {
  props: ["authenticated"],
  components: { CustomButton },
  template: `
    <custom-button>
      <div v-if="authenticated">Log out</div>
      <div v-else>Log in</div>
    </custom-button>
  `,
};
```

如果您使用的是`shallow`，则`slot`将不会被渲染，因为`<custom-button />`中的渲染函数被截断了。这意味着您将无法验证呈现的文本是否正确!

对于这个用例，您可以使用`config.renderstubdefaultlot`，它将渲染默认槽内容，即使`shallow`:

```js
import { config, mount } from "@vue/test-utils";

beforeAll(() => {
  config.global.renderStubDefaultSlot = true;
});

afterAll(() => {
  config.global.renderStubDefaultSlot = false;
});

test("shallow with stubs", () => {
  const wrapper = mount(AnotherApp, {
    props: {
      authenticated: true,
    },
    shallow: true,
  });

  expect(wrapper.html()).toContain("Log out");
});
```

由于这种行为是全局的，而不是逐个挂载，因此您需要记住在每次测试之前和之后启用/禁用它。

:::tip 提示
您也可以通过在测试设置文件中导入`config`，并将`renderstubdefaultlot`设置为`true`来全局启用此功能。不幸的是，由于技术限制，此行为不能扩展到默认插槽以外的插槽。
:::

## `mount`, `shallow` 和 `stubs`: 哪一个 和 什么时候？

根据经验，您的测试与软件的使用方式越相似，它们就越能给您带来信心。

使用`mount`的测试将呈现整个组件层次结构，这更接近于用户在真实浏览器中的体验。

另一方面，使用`shallow`的测试集中在特定的组件上。对于在完全隔离的情况下测试高级组件，`Shallow`非常有用。如果您只有一两个与测试无关的组件，请考虑将`mount`与存根结合使用，而不是使用`shallow`。存根越多，测试就越不像生产。

请记住，无论您是进行完全加载还是浅层呈现，好的测试都关注输入(`props`和用户交互，比如与`trigger`的交互)和输出(呈现的`DOM`元素和事件)，而不是实现细节。

因此，无论您选择哪种安装方法，我们都建议您牢记这些指导原则。

## 结论

- 使用`global.stubs`将组件或指令替换为虚拟组件或指令，以简化测试。
- 使用`shallow: true`(或`shallowMount`)来剔除所有子组件。
- 使用`global.renderstubdefaultlot`为`stubbed`组件呈现默认的`<slot>`。
