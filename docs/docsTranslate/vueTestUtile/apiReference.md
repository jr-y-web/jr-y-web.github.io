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

## Wrapper

当您使用`mount`时，将返回一个带有许多用于测试的有用方法的`VueWrapper`。`VueWrapper`是组件实例的薄包装器。

注意，`find`等方法返回一个`DOMWrapper`，它是组件及其子组件中`DOM`节点的薄包装器。两者都实现了类似的`API`。

### attributes

返回 DOM 节点上的属性。

**格式**

```ts
attributes(): { [key: string]: string }
attributes(key: string): string
attributes(key?: string): { [key: string]: string } | string
```

**详情**

`Component.vue`：

```vue
<template>
  <div id="foo" :class="className" />
</template>

<script>
export default {
  data() {
    return {
      className: "bar",
    };
  },
};
</script>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("attributes", () => {
  const wrapper = mount(Component);

  expect(wrapper.attributes("id")).toBe("foo");
  expect(wrapper.attributes("class")).toBe("bar");
});
```

### classes

**格式**

```ts
classes(): string[]
classes(className: string): boolean
classes(className?: string): string[] | boolean
```

**详情**

返回元素上的类数组。

`Component.vue`：

```vue
<template>
  <span class="my-span" />
</template>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("classes", () => {
  const wrapper = mount(Component);

  expect(wrapper.classes()).toContain("my-span");
  expect(wrapper.classes("my-span")).toBe(true);
  expect(wrapper.classes("not-existing")).toBe(false);
});
```

### emitted

返回从组件发出的所有事件。

**格式**

```ts
emitted<T = unknown>(): Record<string, T[]>
emitted<T = unknown>(eventName: string): undefined | T[]
emitted<T = unknown>(eventName?: string): undefined | T[] | Record<string, T[]>
```

**详情**

参数存储在一个数组中，因此您可以验证每个事件发出了哪些参数。

`Component.vue`:

```vue
<script>
export default {
  created() {
    this.$emit("greet", "hello");
    this.$emit("greet", "goodbye");
  },
};
</script>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("emitted", () => {
  const wrapper = mount(Component);

  // wrapper.emitted() equals to { greet: [ ['hello'], ['goodbye'] ] }

  expect(wrapper.emitted()).toHaveProperty("greet");
  expect(wrapper.emitted().greet).toHaveLength(2);
  expect(wrapper.emitted().greet[0]).toEqual(["hello"]);
  expect(wrapper.emitted().greet[1]).toEqual(["goodbye"]);
});
```

### exists

验证元素是否存在。

**格式**

```ts
exists(): boolean
```

**详情**

您可以使用`querySelector`实现的相同语法。

`Component.vue`：

```vue
<template>
  <span />
</template>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("exists", () => {
  const wrapper = mount(Component);

  expect(wrapper.find("span").exists()).toBe(true);
  expect(wrapper.find("p").exists()).toBe(false);
});
```

### find

查找元素并返回`DOMWrapper`(如果找到的话)。

**格式**

```ts
find<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>
find<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>
find<T extends Element>(selector: string): DOMWrapper<T>
find(selector: string): DOMWrapper<Element>
find<T extends Node = Node>(selector: string | RefSelector): DOMWrapper<T>;
```

**详情**

您可以使用`querySelector`实现的相同语法。`find`基本上是`querySelector`的别名。此外，您还可以搜索元素引用。

`Component.vue`：

```vue
<template>
  <span>Span</span>
  <span data-test="span">Span</span>
  <span ref="span">Span</span>
</template>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("find", () => {
  const wrapper = mount(Component);

  wrapper.find("span"); //=> found; returns DOMWrapper
  wrapper.find('[data-test="span"]'); //=> found; returns DOMWrapper
  wrapper.find({ ref: "span" }); //=> found; returns DOMWrapper
  wrapper.find("p"); //=> nothing found; returns ErrorWrapper
});
```

### findAll

与`find`类似，但返回一个`DOMWrapper`数组。

**格式**

```ts
findAll<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>[]
findAll<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>[]
findAll<T extends Element>(selector: string): DOMWrapper<T>[]
findAll(selector: string): DOMWrapper<Element>[]
```

**详情**

`Component.vue`：

```vue
<template>
  <span v-for="number in [1, 2, 3]" :key="number" data-test="number">
    {{ number }}
  </span>
</template>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import BaseTable from "./BaseTable.vue";

test("findAll", () => {
  const wrapper = mount(BaseTable);

  // .findAll() returns an array of DOMWrappers
  const thirdRow = wrapper.findAll("span")[2];
});
```

### findComponent

找到一个`Vue`组件实例并返回一个`Vue wrapper`。否则返回`ErrorWrapper`。

**格式**

```ts
findComponent<T extends never>(selector: string): WrapperLike
findComponent<T extends DefinedComponent>(selector: T | Exclude<FindComponentSelector, FunctionalComponent>): VueWrapper<InstanceType<T>>
findComponent<T extends FunctionalComponent>(selector: T | string): DOMWrapper<Element>
findComponent<T extends never>(selector: NameSelector | RefSelector): VueWrapper
findComponent<T extends ComponentPublicInstance>(selector: T | FindComponentSelector): VueWrapper<T>
findComponent(selector: FindComponentSelector): WrapperLike
```

**详情**

`findComponent`支持几种语法：

| 语法           |             例子              | 细节                                                |
| -------------- | :---------------------------: | --------------------------------------------------- |
| querySelector  | `findComponent('.component')	` | 匹配标准查询选择器。                                |
| Component name | `findComponent({name: 'a'})`  | 匹配 PascalCase, snake-case, camelCase 的类的命名法 |
| Component ref  | `findComponent({ref: 'ref'})` | 只能用于已挂载组件的直接子元素                      |
| SFC            |  `findComponent(Component)`   | 直接传递导入的组件                                  |

`Foo.vue`：

```vue
<template>
  <div class="foo">Foo</div>
</template>

<script>
export default {
  name: "Foo",
};
</script>
```

`Component.vue`：

```vue
<template>
  <Foo data-test="foo" ref="foo" class="foo" />
</template>

<script>
import Foo from "@/Foo";

export default {
  components: { Foo },
};
</script>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

import Foo from "@/Foo.vue";

test("findComponent", () => {
  const wrapper = mount(Component);

  // All the following queries would return a VueWrapper

  wrapper.findComponent(".foo");
  wrapper.findComponent('[data-test="foo"]');

  wrapper.findComponent({ name: "Foo" });

  wrapper.findComponent({ ref: "foo" });

  wrapper.findComponent(Foo);
});
```

:::warning 警告
如果组件中的`ref`指向`HTML`元素，`findComponent`将返回一个空的包装器。这是预期的行为。
:::

:::warning Css 选择器的用法
使用`findComponent`与`CSS`选择器可能会导致令人困惑的行为

考虑以下示例：

```js
const ChildComponent = {
  name: "Child",
  template: '<div class="child"></div>',
};
const RootComponent = {
  name: "Root",
  components: { ChildComponent },
  template: '<child-component class="root" />',
};
const wrapper = mount(RootComponent);
const rootByCss = wrapper.findComponent(".root"); // => finds Root
expect(rootByCss.vm.$options.name).toBe("Root");
const childByCss = wrapper.findComponent(".child");
expect(childByCss.vm.$options.name).toBe("Root"); // => still Root
```

这种行为的原因是`RootComponent`和`ChildComponent`共享相同的 DOM 节点，只有第一个匹配的组件被包含到每个唯一的 DOM 节点以上。
:::

:::tip 在使用 CSS 选择器时，`WrapperLike`类型
当使用`wrapper.findComponent('.foo')`时，`VTU`将返回`WrapperLike`类型。这是因为函数组件需要一个`DOMWrapper`，否则需要一个`VueWrapper`。通过提供正确的组件类型，您可以强制返回`VueWrapper`：

```ts
wrapper.findComponent(".foo"); // returns WrapperLike
wrapper.findComponent<typeof FooComponent>(".foo"); // returns VueWrapper
wrapper.findComponent<DefineComponent>(".foo"); // returns VueWrapper
```

:::

### findAllComponents

**格式**

```ts
findAllComponents<T extends never>(selector: string): WrapperLike[]
findAllComponents<T extends DefinedComponent>(selector: T | Exclude<FindAllComponentsSelector, FunctionalComponent>): VueWrapper<InstanceType<T>>[]
findAllComponents<T extends FunctionalComponent>(selector: string): DOMWrapper<Element>[]
findAllComponents<T extends FunctionalComponent>(selector: T): DOMWrapper<Node>[]
findAllComponents<T extends never>(selector: NameSelector): VueWrapper[]
findAllComponents<T extends ComponentPublicInstance>(selector: T | FindAllComponentsSelector): VueWrapper<T>[]
findAllComponents(selector: FindAllComponentsSelector): WrapperLike[]
```

**详情**

类似于`findComponent`，但可以找到所有与查询匹配的`Vue`组件实例。返回一个`VueWrapper`数组。

:::warning 警告
在`findAllComponents`中不支持`ref`语法。所有其他查询语法都是有效的。
:::

`Component.vue`：

```vue
<template>
  <FooComponent v-for="number in [1, 2, 3]" :key="number" data-test="number">
    {{ number }}
  </FooComponent>
</template>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("findAllComponents", () => {
  const wrapper = mount(Component);

  // Returns an array of VueWrapper
  wrapper.findAllComponents('[data-test="number"]');
});
```

:::warning CSS 选择器的用法
当与`CSS`选择器一起使用时，`findAllComponents`的行为与`findComponent`相同。
:::

### get

获取一个元素，如果找到，返回一个`DOMWrapper`。否则，它将抛出一个错误。

**格式**

```js
get<K extends keyof HTMLElementTagNameMap>(selector: K): Omit<DOMWrapper<HTMLElementTagNameMap[K]>, 'exists'>
get<K extends keyof SVGElementTagNameMap>(selector: K): Omit<DOMWrapper<SVGElementTagNameMap[K]>, 'exists'>
get<T extends Element>(selector: string): Omit<DOMWrapper<T>, 'exists'>
get(selector: string): Omit<DOMWrapper<Element>, 'exists'>
```

**详情**

它类似于 `find`，但 `get` 会抛出错误，而不是返回 `ErrorWrapper`。

一般来说，除非你确定某个元素不存在，否则应始终使用 `get`。在这种情况下，请使用 `find`。

`Component.vue`：

```vue
<template>
  <span>Span</span>
</template>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("get", () => {
  const wrapper = mount(Component);

  wrapper.get("span"); //=> found; returns DOMWrapper

  expect(() => wrapper.get(".not-there")).toThrowError();
});
```

### getComponent

获取一个`Vue`组件实例，如果找到，则返回一个`VueWrapper`。否则会抛出错误。

**格式**

```ts
getComponent<T extends ComponentPublicInstance>(selector: new () => T): Omit<VueWrapper<T>, 'exists'>
getComponent<T extends ComponentPublicInstance>(selector: { name: string } | { ref: string } | string): Omit<VueWrapper<T>, 'exists'>
getComponent<T extends ComponentPublicInstance>(selector: any): Omit<VueWrapper<T>, 'exists'>
```

**详情**

它类似于`findComponent`，但是`getComponent`抛出而不是返回`ErrorWrapper`。

**语法**

| 语法           |             例子              | 细节                                                |
| -------------- | :---------------------------: | --------------------------------------------------- |
| querySelector  | `findComponent('.component')	` | 匹配标准查询选择器。                                |
| Component name | `findComponent({name: 'a'})`  | 匹配 PascalCase, snake-case, camelCase 的类的命名法 |
| Component ref  | `findComponent({ref: 'ref'})` | 只能用于已挂载组件的直接子元素                      |
| SFC            |  `findComponent(Component)`   | 直接传递导入的组件                                  |

`Foo.vue`：

```vue
<template>
  <div class="foo">Foo</div>
</template>

<script>
export default {
  name: "Foo",
};
</script>
```

`Component.vue`:

```vue
<template>
  <Foo />
</template>

<script>
import Foo from "@/Foo";

export default {
  components: { Foo },
};
</script>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

import Foo from "@/Foo.vue";

test("getComponent", () => {
  const wrapper = mount(Component);

  wrapper.getComponent({ name: "foo" }); // returns a VueWrapper
  wrapper.getComponent(Foo); // returns a VueWrapper

  expect(() => wrapper.getComponent(".not-there")).toThrowError();
});
```

### html

返回元素的`HTML`。

默认情况下，输出使用`js-beautify`进行格式化，以使快照更具可读性。使用`raw: true`选项接收未格式化的 `html` 字符串。

**格式**

```ts
html(): string
html(options?: { raw?: boolean }): string
```

**详情**

`Component.vue`：

```vue
<template>
  <div>
    <p>Hello world</p>
  </div>
</template>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("html", () => {
  const wrapper = mount(Component);

  expect(wrapper.html()).toBe("<div>\n" + "  <p>Hello world</p>\n" + "</div>");

  expect(wrapper.html({ raw: true })).toBe("<div><p>Hello world</p></div>");
});
```

### isVisible

验证元素是否可见。

**格式**

```ts
isVisible(): boolean
```

**详情**

:::warning 警告
`isVisible()`只有在使用`attachTo`将包装器附加到 `DOM` 时才能正常工作。
:::

```js
const Component = {
  template: `<div v-show="false"><span /></div>`,
};

test("isVisible", () => {
  const wrapper = mount(Component);

  expect(wrapper.find("span").isVisible()).toBe(false);
});
```

### props

返回传递给 Vue 组件的`props`。

**格式**

```ts
props(): { [key: string]: any }
props(selector: string): any
props(selector?: string): { [key: string]: any } | any
```

**详情**

`Component.vue`：

```js
export default {
  name: "Component",
  props: {
    truthy: Boolean,
    object: Object,
    string: String,
  },
};
```

```vue
<template>
  <Component truthy :object="{}" string="string" />
</template>

<script>
import Component from "@/Component";

export default {
  components: { Component },
};
</script>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("props", () => {
  const wrapper = mount(Component, {
    global: { stubs: ["Foo"] },
  });

  const foo = wrapper.getComponent({ name: "Foo" });

  expect(foo.props("truthy")).toBe(true);
  expect(foo.props("object")).toEqual({});
  expect(foo.props("notExisting")).toEqual(undefined);
  expect(foo.props()).toEqual({
    truthy: true,
    object: {},
    string: "string",
  });
});
```

:::tip 提示
根据经验，针对传递的道具(`DOM`更新、发出的事件等)的效果进行测试。这将使测试比简单地断言通过了一个道具更强大。
:::

### setData

更新组件内部数据。

**格式**

```js
setData(data: Record<string, any>): Promise<void>
```

**详情**

`setData`不允许设置组件中没有定义的新属性。

:::warning 警告
另外，请注意`setData`并不修改组合 API `setup()`数据。
:::

`Component.vue`：

```vue
<template>
  <div>Count: {{ count }}</div>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
    };
  },
};
</script>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("setData", async () => {
  const wrapper = mount(Component);
  expect(wrapper.html()).toContain("Count: 0");

  await wrapper.setData({ count: 1 });

  expect(wrapper.html()).toContain("Count: 1");
});
```

:::warning
在调用`setData`时应该使用`await`，以确保 Vue 在做出断言之前更新 `DOM`。
:::

### setProps

更新组件`props`。

**格式**

```ts
setProps(props: Record<string, any>): Promise<void>
```

**详情**

`Component.vue`:

```vue
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  props: ["message"],
};
</script>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("updates prop", async () => {
  const wrapper = mount(Component, {
    props: {
      message: "hello",
    },
  });

  expect(wrapper.html()).toContain("hello");

  await wrapper.setProps({ message: "goodbye" });

  expect(wrapper.html()).toContain("goodbye");
});
```

:::warning
在调用`setProps`时应该使用`await`，以确保`Vue`在做出断言之前更新`DOM`。
:::

### setValue

为 `DOM` 元素设置一个值。包括:

- `<input>`
  - `type ="checkbox"`和`Type ="radio"`被检测到并将具有元素。检查设置。
- `<select>`
  - `<option>` 检测具有元素并且选择

**格式**

```ts
setValue(value: unknown, prop?: string): Promise<void>
```

**详情**

`Component.vue`:

```vue
<template>
  <input type="text" v-model="text" />
  <p>Text: {{ text }}</p>

  <input type="checkbox" v-model="checked" />
  <div v-if="checked">The input has been checked!</div>

  <select v-model="multiselectValue" multiple>
    <option value="value1"></option>
    <option value="value2"></option>
    <option value="value3"></option>
  </select>
</template>

<script>
export default {
  data() {
    return {
      text: "",
      checked: false,
      multiselectValue: [],
    };
  },
};
</script>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("setValue on checkbox", async () => {
  const wrapper = mount(Component);

  await wrapper.find('input[type="checkbox"]').setValue(true);
  expect(wrapper.find("div")).toBe(true);

  await wrapper.find('input[type="checkbox"]').setValue(false);
  expect(wrapper.find("div")).toBe(false);
});

test("setValue on input text", async () => {
  const wrapper = mount(Component);

  await wrapper.find('input[type="text"]').setValue("hello!");
  expect(wrapper.find("p").text()).toBe("Text: hello!");
});

test("setValue on multi select", async () => {
  const wrapper = mount(Component);

  // For select without multiple
  await wrapper.find("select").setValue("value1");
  // For select with multiple
  await wrapper.find("select").setValue(["value1", "value3"]);
});
```

:::warning 警告
在调用`setValue`时应该使用`await`，以确保`Vue`在做出断言之前更新`DO`M`。
:::

### trigger

触发`DOM`事件，`click`与`submit`、`keyup`。

**格式**

```ts
interface TriggerOptions {
  code?: String
  key?: String
  keyCode?: Number
  [custom: string]: any
}

trigger(eventString: string, options?: TriggerOptions | undefined): Promise<void>
```

**详细**

`Component.vue`：

```vue
<template>
  <span>Count: {{ count }}</span>
  <button @click="count++">Click me</button>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
    };
  },
};
</script>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("trigger", async () => {
  const wrapper = mount(Component);

  await wrapper.find("button").trigger("click");

  expect(wrapper.find("span").text()).toBe("Count: 1");
});
```

请注意，`trigger`接受第二个参数，将选项传递给被触发的`Event`:

```js
await wrapper.trigger("keydown", { keyCode: 65 });
```

:::warning 警告
在调用`trigger`时应该使用`await`，以确保`Vue`在做出断言之前更新 DOM。
:::

:::warning 警告
有些事件，比如点击一个复选框来改变它的 v 模型，只有在测试使用`attachTo: document.body`的情况下才会起作用。否则，不会触发变更事件，v-model 值也不会发生变化。
:::

### unmount

从`DOM`中卸载应用程序。

**格式**

```js
unmount(): void
```

**详情**

它只适用于从挂载返回的根 VueWrapper。用于测试后的手动清理。

`Component.vue`：

```vue
<script>
export default {
  unmounted() {
    console.log("unmounted!");
  },
};
</script>
```

`Component.spec.js`：

```js
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

test("unmount", () => {
  const wrapper = mount(Component);

  wrapper.unmount();
  // Component is removed from DOM.
  // console.log has been called with 'unmounted!'
});
```

## Wrapper properties

### vm

**格式**

```ts
vm: ComponentPublicInstance;
```

**详情**

Vue 应用实例。您可以访问所有实例方法和实例属性。

请注意，vm 仅在 VueWrapper 上可用。

:::tip 提示
根据经验，针对传递的道具(`DOM`更新、发出的事件等)的效果进行测试。这将使测试比简单地断言通过了一个道具更强大。
:::

## enableAutoUnmount

**格式**

```ts
enableAutoUnmount(hook: (callback: () => void) => void);
disableAutoUnmount(): void;
```

**详情**

`enableAutoUnmount`允许自动销毁`Vue`包装器。销毁逻辑作为回调传递给钩子函数。常用的用法是将`enableAutoUnmount`与测试框架提供的拆包辅助函数一起使用，比如`afterEach`:

```ts
import { enableAutoUnmount } from "@vue/test-utils";

enableAutoUnmount(afterEach);
```

如果您只希望在测试套件的特定子集中使用此行为，并且希望显式禁用此行为，那么`disableAutoUnmount`可能会很有用。

## flushPromises

**格式**

```js
flushPromises(): Promise<unknown>
```

**详情**

`flushPromises`刷新所有已解析的承诺处理程序。这有助于确保诸如承诺或`DOM`更新之类的异步操作在对它们进行断言之前已经发生。

请查看发出 HTTP 请求以查看[flushPromises 的实际示例](https://test-utils.vuejs.org/guide/advanced/http-requests.html)。

## config

### config.global

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

**详情**

您可以为整个测试套件配置安装选项，而不是在每个测试的基础上配置安装选项。默认情况下，每次挂载组件时都将使用这些选项。如果需要，您可以在每个测试的基础上覆盖您的默认值。

**例子**

例如，全局模拟`vue-i18n`中的`$t`变量和一个组件:

`Component.vue`：

```vue
<template>
  <p>{{ $t("message") }}</p>
  <my-component />
</template>

<script>
import MyComponent from "@/components/MyComponent";

export default {
  components: {
    MyComponent,
  },
};
</script>
```

`Component.spec.js`：

```js
import { config, mount } from "@vue/test-utils";
import { defineComponent } from "vue";

const MyComponent = defineComponent({
  template: `<div>My component</div>`,
});

config.global.stubs = {
  MyComponent,
};

config.global.mocks = {
  $t: (text) => text,
};

test("config.global mocks and stubs", () => {
  const wrapper = mount(Component);

  expect(wrapper.html()).toBe("<p>message</p><div>My component</div>");
});
```

:::tip 提示
请记住，此行为是全局的，而不是逐个挂载。您可能需要在每次测试之前和之后启用/禁用它。
:::

## components

### RouterLinkStub

当你不想模拟或包含一个完整的路由时，用来存根`Vue`的`router-link`的组件。

你可以使用这个组件在呈现树中找到`router-link`组件。

**使用**

在挂载选项中设置为存根:

```js
import { mount, RouterLinkStub } from "@vue/test-utils";

const wrapper = mount(Component, {
  global: {
    stubs: {
      RouterLink: RouterLinkStub,
    },
  },
});

expect(wrapper.findComponent(RouterLinkStub).props().to).toBe("/some/path");
```

配合插槽使用:

`RouterLinkStub`组件支持插槽内容，并且会为它的插槽道具返回非常基本的值。如果您需要在测试中使用更具体的`slot prop`值，请考虑使用真正的`router`，这样您就可以使用真正的`router-link`组件。或者，你也可以通过从`test-utils`包中复制实现来定义自己的`RouterLinkStub`组件。
