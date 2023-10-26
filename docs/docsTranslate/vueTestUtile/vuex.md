# 测试 `vuex`

`Vuex`只是一个实现细节;使用`Vuex`测试组件不需要特殊处理。也就是说，有一些技术可以使您的测试更容易阅读和编写。我们来看看这些。

本指南假设您熟悉`Vuex`。`Vuex 4`是与`Vue.js 3`一起工作的版本。阅读这里的文档。

## 简单的例子

下面是一个简单的 Vuex 存储，以及一个依赖于 Vuex 存储的组件:

```js
import { createStore } from "vuex";

const store = createStore({
  state() {
    return {
      count: 0,
    };
  },
  mutations: {
    increment(state: any) {
      state.count += 1;
    },
  },
});
```

存储只是存储一个计数，并在`increment`增量变化时增加该计数。这是我们将要测试的组件:

```js
const App = {
  template: `
    <div>
      <button @click="increment" />
      Count: {{ count }}
    </div>
  `,
  computed: {
    count() {
      return this.$store.state.count;
    },
  },
  methods: {
    increment() {
      this.$store.commit("increment");
    },
  },
};
```

## 测试真实的`vuex store`

为了完全测试该组件和`Vuex`存储是否正常工作，我们将单击`<button>`并断言计数增加。在你的`Vue`应用程序中，通常在`main.js`中，你像这样安装`Vuex`:

```js
const app = createApp(App);
app.use(store);
```

这是因为 Vuex 是一个插件。通过调用`app.use`并传入插件来应用插件。

`Vue Test Utils`也允许你安装插件，使用`global.plugins`安装选项。

```js
import { createStore } from "vuex";

const store = createStore({
  state() {
    return {
      count: 0,
    };
  },
  mutations: {
    increment(state: any) {
      state.count += 1;
    },
  },
});

test("vuex", async () => {
  const wrapper = mount(App, {
    global: {
      plugins: [store],
    },
  });

  await wrapper.find("button").trigger("click");

  expect(wrapper.html()).toContain("Count: 1");
});
```

安装插件后，我们使用`trigger`来单击按钮并断言`count`增加。这种测试涵盖了不同系统之间的交互(在本例中是组件和存储)，被称为集成测试。

## 使用 Mock Store 进行测试

相反，单元测试可以分别隔离和测试组件和存储。如果您有一个具有复杂存储的大型应用程序，这将非常有用。对于这个用例，你可以使用`global.mocks`模拟你感兴趣的存储部分:

```js
test("vuex using a mock store", async () => {
  const $store = {
    state: {
      count: 25,
    },
    commit: jest.fn(),
  };

  const wrapper = mount(App, {
    global: {
      mocks: {
        $store,
      },
    },
  });

  expect(wrapper.html()).toContain("Count: 25");
  await wrapper.find("button").trigger("click");
  expect($store.commit).toHaveBeenCalled();
});
```

这不是使用一个真正的`Vuex.store`，并通过`global.plugins,`安装它。插件中，我们创建了自己的模拟存储，只实现了组件中使用的`Vuex`部分(在本例中是状态和提交函数)。

虽然单独测试`store`似乎很方便，但请注意，如果您破坏了`Vuex.store`，它不会给您任何警告。如果您想模拟`Vuex.store`，还是使用一个`store`，请仔细考虑，并了解利弊。以上翻译结果来自有道神经网络翻译（YNMT）· 通用场景

## 隔离测试 `Vuex`

您可能希望完全隔离地测试您的`Vuex`的`mutations`或`actions`，特别是在它们很复杂的情况下。你不需要`Vue Test Utils`，因为`Vue store`只是普通的`JavaScript`。下面是在没有`Vue test Utils`的情况下测试增量突变的方法:

```js
test("increment mutation", () => {
  const store = createStore({
    state: {
      count: 0,
    },
    mutations: {
      increment(state) {
        state.count += 1;
      },
    },
  });

  store.commit("increment");

  expect(store.state.count).toBe(1);
});
```

## 预设 Vuex 状态

有时候，让`Vuex`存储处于特定的测试状态是很有用的。除了全局，您还可以使用一个有用的技术。`mock`的目的是创建一个函数，该函数包装`createStore`并接受一个参数作为初始状态的种子。在本例中，我们扩展了`increment`来接受一个额外的参数，该参数将被添加到`state.count`中。如果没有提供，我们就增加`state`。 `state.count` 增 1.

```js
const createVuexStore = (initialState) =>
  createStore({
    state: {
      count: 0,
      ...initialState,
    },
    mutations: {
      increment(state, value = 1) {
        state.count += value;
      },
    },
  });

test("increment mutation without passing a value", () => {
  const store = createVuexStore({ count: 20 });
  store.commit("increment");
  expect(store.state.count).toBe(21);
});

test("increment mutation with a value", () => {
  const store = createVuexStore({ count: -10 });
  store.commit("increment", 15);
  expect(store.state.count).toBe(5);
});
```

通过创建一个接受初始状态的`createVuexStore`函数，我们可以很容易地设置初始状态。这允许我们测试所有的边缘情况，同时简化我们的测试。

[`Vue`测试手册](https://lmiller1990.github.io/vue-testing-handbook/testing-vuex.html)中有更多测试`Vuex`的示例。注意:这些例子属于`Vue.js 2`和`Vue Test Utils v1`。想法和概念是相同的，`Vue`测试手册将在不久的将来为`Vue.js 3`和`Vue`测试`Utils 2`更新。

## 使用组合 API 进行测试

当使用`Composition API`时，通过`useStore`函数访问`Vuex`。点击这里了解更多。

如`Vuex`文档中所述，`useStore`可以与一个可选且唯一的注入键一起使用。

它是这样的：

```js
import { createStore } from "vuex";
import { createApp } from "vue";

// create a globally unique symbol for the injection key
const key = Symbol();

const App = {
  setup() {
    // use unique key to access store
    const store = useStore(key);
  },
};

const store = createStore({
  /* ... */
});
const app = createApp({
  /* ... */
});

// specify key as second argument when calling app.use(store)
app.use(store, key);
```

为了避免在每次使用`useStore`时重复传递关键参数，`Vuex`文档建议将该逻辑提取到一个`helper`函数中，并重用该函数而不是默认的`useStore`函数。点击这里了解更多。使用`Vue Test Utils`提供存储的方法取决于组件中使用`useStore`函数的方式。

### 测试使用`useStore`而不是使用注入 Key 的组件

如果没有注入键，存储数据就可以通过全局的提供安装选项注入到组件中。注入的存储库的名称必须与组件中的名称相同。“`store`”。

**提供无键 userstore 的示例**

```js
import { createStore } from "vuex";

const store = createStore({
  // ...
});

const wrapper = mount(App, {
  global: {
    provide: {
      store: store,
    },
  },
});
```

### 测试使用带有注入键的`useStore`的组件

当使用带有注入密钥的存储时，以前的方法将不起作用。存储实例不会从`useStore`返回。为了访问正确的存储，需要提供标识符。

它需要是在组件的设置函数中传递给`useStore`或在`setup`函数中传递到`useStore`的确切键。由于`JavaScript`符号是唯一的，无法重新创建，因此最好从实际存储中导出密钥。

您可以使用带有正确密钥的`global.provide`来注入存储，也可以使用`global.plugins`来安装存储并指定密钥：

**使用 global.provide 提供 Key 以及 useStore**

```js
// store.js
export const key = Symbol();
```

```js
// app.spec.js
import { createStore } from "vuex";
import { key } from "./store";

const store = createStore({
  /* ... */
});

const wrapper = mount(App, {
  global: {
    provide: {
      [key]: store,
    },
  },
});
```

**使用 global.plugins 提供 Keyed 以及 useStore**

```js
// store.js
export const key = Symbol();
```

```js
// app.spec.js
import { createStore } from "vuex";
import { key } from "./store";

const store = createStore({
  /* ... */
});

const wrapper = mount(App, {
  global: {
    // to pass options to plugins, use the array syntax.
    plugins: [[store, key]],
  },
});
```

## 结论

- 使用`global.plugins`将`Vuex`作为插件安装
- 使用`global.mocks`模拟全局对象，如`Vuex`，用于高级用例
- 考虑单独测试复杂的`Vuex`的`mutations`和`actions`
- 用一个函数包装 createStore，该函数使用一个参数来设置特定的测试场景
