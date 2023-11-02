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

`Component.spec.js:`

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

### props

在组件挂载时设置`props`。

**格式**

```ts
props?: (RawProps & Props) | ({} extends Props ? null : never)
```

**详情**

`Component.vue`:

```vue
<template>
  <span>Count: {{ count }}</span>
</template>

<script>
export default {
  props: {
    count: {
      type: Number,
      required: true,
    },
  },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("props", () => {
  const wrapper = mount(Component, {
    props: {
      count: 5,
    },
  });

  expect(wrapper.html()).toContain("Count: 5");
});
```

### slots

设置`slots`的值。

**格式**

```ts
type Slot = VNode | string | { render: Function } | Function | Component

slots?: { [key: string]: Slot } & { default?: Slot }
```

**详情**

`slots`可以是字符串或任何有效的组件定义，可以从`.vue`文件导入，也可以内联提供。

`Component.vue`：

```vue
<template>
  <slot name="first" />
  <slot />
  <slot name="second" />
</template>
```

`Bar.vue`：

```vue
<template>
  <div>Bar</div>
</template>
```

`Component.spec.js`：

```js
import { h } from "vue";
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";
import Bar from "./Bar.vue";

test("renders slots content", () => {
  const wrapper = mount(Component, {
    slots: {
      default: "Default",
      first: h("h1", {}, "Named Slot"),
      second: Bar,
    },
  });

  expect(wrapper.html()).toBe("<h1>Named Slot</h1>Default<div>Bar</div>");
});
```

### global

**格式**

```ts
type GlobalMountOptions = {
  plugins?: (Plugin | [Plugin, ...any[]])[];
  config?: Partial<Omit<AppConfig, "isNativeTag">>;
  mixins?: ComponentOptions[];
  mocks?: Record<string, any>;
  provide?: Record<any, any>;
  components?: Record<string, Component | object>;
  directives?: Record<string, Directive>;
  stubs?: Stubs = Record<string, boolean | Component> | Array<string>;
  renderStubDefaultSlot?: boolean;
};
```

您可以在每个测试的基础上配置所有的全局选项，也可以为整个测试套件配置。[请参阅此处了解如何配置项目范围的默认值](https://test-utils.vuejs.org/api/#config-global)。

#### global.components

将组件全局注册到挂载的组件。

**详情**

`Component.vue`:

```vue
<template>
  <div>
    <global-component />
  </div>
</template>

<script>
import GlobalComponent from "@/components/GlobalComponent";

export default {
  components: {
    GlobalComponent,
  },
};
</script>
```

`GlobalComponent.vue`:

```vue
<template>
  <div class="global-component">My Global Component</div>
</template>
```

`Component.spec.js`:

```js
import { mount } from "@vue/test-utils";
import GlobalComponent from "@/components/GlobalComponent";
import Component from "./Component.vue";

test("global.components", () => {
  const wrapper = mount(Component, {
    global: {
      components: {
        GlobalComponent,
      },
    },
  });

  expect(wrapper.find(".global-component").exists()).toBe(true);
});
```

#### global.config

配置 Vue 的应用程序全局配置。

**格式**

```ts
config?: Partial<Omit<AppConfig, 'isNativeTag'>>
```

#### global.directives

将指令全局注册到挂载的组件。

**格式**

```ts
directives?: Record<string, Directive>
```

**详情**

`Component.spec.js`:

```js
import { mount } from "@vue/test-utils";

import Directive from "@/directives/Directive";

const Component = {
  template: "<div v-bar>Foo</div>",
};

test("global.directives", () => {
  const wrapper = mount(Component, {
    global: {
      directives: {
        Bar: Directive, // Bar matches v-bar
      },
    },
  });
});
```

#### global.mixins

将 `mixin` 全局注册到挂载的组件。

**格式**

```ts
mixins?: ComponentOptions[]
```

**详情**

`Component.spec.js`:

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("global.mixins", () => {
  const wrapper = mount(Component, {
    global: {
      mixins: [mixin],
    },
  });
});
```

#### global.mocks

模拟全局实例属性。可以用来模拟`this.$store`, `this.$router`等

**格式**

```ts
mocks?: Record<string, any>
```

**详情**

:::warning 警告
这是为了模拟第三方插件注入的变量，而不是`Vue`的本地属性，如`$root`， `$children`等。
:::

`Component.vue`:

```vue
<template>
  <button @click="onClick" />
</template>

<script>
export default {
  methods: {
    onClick() {
      this.$store.dispatch("click");
    },
  },
};
</script>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("global.mocks", async () => {
  const $store = {
    dispatch: jest.fn(),
  };

  const wrapper = mount(Component, {
    global: {
      mocks: {
        $store,
      },
    },
  });

  await wrapper.find("button").trigger("click");

  expect($store.dispatch).toHaveBeenCalledWith("click");
});
```

#### global.plugins

在挂载的组件上安装插件。

**格式**

```ts
plugins?: (Plugin | [Plugin, ...any[]])[]
```

**详情**

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

import myPlugin from "@/plugins/myPlugin";

test("global.plugins", () => {
  mount(Component, {
    global: {
      plugins: [myPlugin],
    },
  });
});
```

要使用带有选项的插件，可以传递一个选项数组。

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("global.plugins with options", () => {
  mount(Component, {
    global: {
      plugins: [Plugin, [PluginWithOptions, "argument 1", "another argument"]],
    },
  });
});
```

#### global.provide

通过`inject`提供要在`setup`函数中接收的数据。

**格式**

```ts
provide?: Record<any, any>
```

**详情**

`Component.vue`：

```vue
<template>
  <div>Theme is {{ theme }}</div>
</template>

<script>
import { inject } from "vue";

export default {
  setup() {
    const theme = inject("Theme");
    return {
      theme,
    };
  },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("global.provide", () => {
  const wrapper = mount(Component, {
    global: {
      provide: {
        Theme: "dark",
      },
    },
  });

  console.log(wrapper.html()); //=> <div>Theme is dark</div>
});
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

const ThemeSymbol = Symbol();

mount(Component, {
  global: {
    provide: {
      [ThemeSymbol]: "value",
    },
  },
});
```

#### global.renderStubDefaultSlot

即使在使用 shallow 或 shallowMount 时，也会呈现默认的插槽内容。

**格式**

```ts
renderStubDefaultSlot?: boolean
```

**详情**

默认为`false`。

`Component.vue`

```vue
<template>
  <slot />
  <another-component />
</template>

<script>
export default {
  components: {
    AnotherComponent,
  },
};
</script>
```

`AnotherComponent.vue`

```vue
<template>
  <p>Another component content</p>
</template>
```

`Component.spec.js`

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("global.renderStubDefaultSlot", () => {
  const wrapper = mount(ComponentWithSlots, {
    slots: {
      default: "<div>My slot content</div>",
    },
    shallow: true,
    global: {
      renderStubDefaultSlot: true,
    },
  });

  expect(wrapper.html()).toBe(
    "<div>My slot content</div><another-component-stub></another-component-stub>"
  );
});
```

由于技术限制，此行为不能扩展到默认插槽以外的插槽。

#### global.stubs

在挂载的组件上设置全局存根。

**格式**

```ts
stubs?: Record<any, any>
```

**详情**

默认情况下，它会存根`Transition`和`TransitionGroup`。

`Component.vue`:

```vue
<template>
  <div><foo /></div>
</template>

<script>
import Foo from "@/Foo.vue";

export default {
  components: { Foo },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("global.stubs using array syntax", () => {
  const wrapper = mount(Component, {
    global: {
      stubs: ["Foo"],
    },
  });

  expect(wrapper.html()).toEqual("<div><foo-stub></div>");
});

test("global.stubs using object syntax", () => {
  const wrapper = mount(Component, {
    global: {
      stubs: { Foo: true },
    },
  });

  expect(wrapper.html()).toEqual("<div><foo-stub></div>");
});

test("global.stubs using a custom component", () => {
  const CustomStub = {
    name: "CustomStub",
    template: "<p>custom stub content</p>",
  };

  const wrapper = mount(Component, {
    global: {
      stubs: { Foo: CustomStub },
    },
  });

  expect(wrapper.html()).toEqual("<div><p>custom stub content</p></div>");
});
```

### shallow

从组件中取出所有子组件。

**格式**

```ts
shallow?: boolean
```

**详情**

默认为`false`

`Component.vue`

```vue
<template>
  <a-component />
  <another-component />
</template>

<script>
export default {
  components: {
    AComponent,
    AnotherComponent,
  },
};
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('shallow', () => {
  const wrapper = mount(Component, { shallow: true })

  expect(wrapper.html()).toEqual(
    `<a-component-stub></a-component-stub><another-component></another-component>`
  )
}
```

:::tip 提示
`shallowMount()`是使用`shallow: true`挂载组件的别名。
:::

## Wrapper 方法

当您使用`mount`时，将返回一个带有许多用于测试的有用方法的`VueWrapper`。`VueWrapper`是组件实例的薄包装器。

注意，`find`等方法返回一个`DOMWrapper`，它是组件及其子组件中`DOM`节点的薄包装器。两者都实现了类似的`API`。
