# API 参考

## mount

创建一个`wrapper`，其中包含要测试的挂载和呈现的 Vue 组件。注意，当使用`Vitest`模拟日期/计时器时，它必须在`vi.setSystemTime`之后调用。

**格式**

```ts
interface MountingOptions<Props, Data = {}> {
  attachTo?: HTMLElement | string;
  attrs?: Record<string, unknown>;
  data?: () => {} extends Data
    ? any
    : Data extends object
    ? Partial<Data>
    : any;
  props?: (RawProps & Props) | ({} extends Props ? null : never);
  slots?: { [key: string]: Slot } & { default?: Slot };
  global?: GlobalMountOptions;
  shallow?: boolean;
}

function mount(Component, options?: MountingOptions): VueWrapper;
```

**详情**

`mount`是`Vue Test Utils`暴露的主要方法。它创建了一个`Vue 3`应用程序，用于保存和呈现正在测试的组件。作为回报，它创建一个`wrapper`来针对组件进行操作和断言。

```js
import { mount } from "@vue/test-utils";

const Component = {
  template: "<div>Hello world</div>",
};

test("mounts a component", () => {
  const wrapper = mount(Component, {});

  expect(wrapper.html()).toContain("Hello world");
});
```

注意，mount 接受第二个参数来定义组件的状态配置。

**示例:安装组件道具和 Vue App 插件**

```js
const wrapper = mount(Component, {
  props: {
    msg: "world",
  },
  global: {
    plugins: [vuex],
  },
});
```

**options.global**

在组件`state`中，你可以通过`MountingOptions.global`配置前面提到的 Vue 3 应用。这对于提供组件期望可用的模拟值非常有用。

:::tip 提示
如果你发现自己不得不为许多测试设置通用的 App 配置，那么你可以使用导出的配置对象为整个测试套件设置配置(`config`)。
:::

### attachTo

指定要挂载组件的节点。这在使用`renderToString`时不可用。

**格式**

```ts
attachTo?: HTMLElement | string
```

**详情**

可以是有效的 CSS 选择器，也可以是连接到文档的`Element`。

`Component.vue:`

```vue
<template>
  <p>Vue Component</p>
</template>
```

`Component.spec.js:`

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

document.body.innerHTML = `
  <div>
    <h1>Non Vue app</h1>
    <div id="app"></div>
  </div>
`;

test("mounts on a specific element", () => {
  const wrapper = mount(Component, {
    attachTo: document.getElementById("app"),
  });

  expect(document.body.innerHTML).toBe(`
  <div>
    <h1>Non Vue app</h1>
    <div id="app"><div data-v-app=""><p>Vue Component</p></div></div>
  </div>
`);
});
```

### attrs

为组件设置 HTML 属性。

**格式**

```ts
attrs?: Record<string, unknown>
```

**详情**

`Component.spec.js:`

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("attrs", () => {
  const wrapper = mount(Component, {
    attrs: {
      id: "hello",
      disabled: true,
    },
  });

  expect(wrapper.attributes()).toEqual({
    disabled: "true",
    id: "hello",
  });
});
```

注意，设置一个已定义的 prop 总是胜过一个属性:

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("attribute is overridden by a prop with the same name", () => {
  const wrapper = mount(Component, {
    props: {
      message: "Hello World",
    },
    attrs: {
      message: "this will get overridden",
    },
  });

  expect(wrapper.props()).toEqual({ message: "Hello World" });
  expect(wrapper.attributes()).toEqual({});
});
```

### data

覆盖组件的默认数据。一定是一个函数。

**格式**

```ts
data?: () => {} extends Data ? any : Data extends object ? Partial<Data> : any
```

**详情**

`Component.vue`

```vue
<template>
  <div>Hello {{ message }}</div>
</template>

<script>
export default {
  data() {
    return {
      message: "everyone",
    };
  },
};
</script>
```

**Component.spec.js:**

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("data", () => {
  const wrapper = mount(Component, {
    data() {
      return {
        message: "world",
      };
    },
  });

  expect(wrapper.html()).toContain("Hello world");
});
```
