# Slots

`Vue-Test-Utile`为使用插槽(`slots`)测试组件提供了一些有用的功能。

## 简单的例子

您可能有一个通用的`＜layout＞`组件，该组件使用默认槽来呈现某些内容。例如：

```js
const Layout = {
  template: `
    <div>
      <h1>Welcome!</h1>
      <main>
        <slot />
      </main>
      <footer>
        Thanks for visiting.
      </footer>
    </div>
  `,
};
```

您可能需要编写一个测试来确保呈现默认的插槽内容。`VTU`为此提供插槽(`slots`)安装选项：

```js
test("layout default slot", () => {
  const wrapper = mount(Layout, {
    slots: {
      default: "Main Content",
    },
  });

  expect(wrapper.html()).toContain("Main Content");
});
```

它通过了！在本例中，我们将一些文本内容传递到默认插槽。如果您想更具体一点，并验证默认插槽内容是否在`＜main＞`中呈现，您可以更改断言：

```js
test("layout default slot", () => {
  const wrapper = mount(Layout, {
    slots: {
      default: "Main Content",
    },
  });

  expect(wrapper.find("main").text()).toContain("Main Content");
});
```

## 具名插槽

您可能有更复杂的`＜layout＞`组件，其中包含一些命名插槽。例如：

```js
const Layout = {
  template: `
    <div>
      <header>
        <slot name="header" />
      </header>

      <main>
        <slot name="main" />
      </main>
      <footer>
        <slot name="footer" />
      </footer>
    </div>
  `,
};
```

`VTU`也支持这一点。你可以写一个测试如下。请注意，在这个示例中，我们将`HTML`而不是文本内容传递到插槽。

```js
const Layout = {
  template: `
   <div>
     <header>
       <slot name="header" />
     </header>

     <main>
       <slot name="main" />
     </main>
     <footer>
       <slot name="footer" />
     </footer>
   </div>
 `,
};
```

```js
test("layout full page layout", () => {
  const wrapper = mount(Layout, {
    slots: {
      header: "<div>Header</div>",
      main: "<div>Main Content</div>",
      footer: "<div>Footer</div>",
    },
  });

  expect(wrapper.html()).toContain("<div>Header</div>");
  expect(wrapper.html()).toContain("<div>Main Content</div>");
  expect(wrapper.html()).toContain("<div>Footer</div>");
});
```

## 多个插槽(`slots`)

您也可以传递一组插槽：

```js
test("layout full page layout", () => {
  const wrapper = mount(Layout, {
    slots: {
      default: ['<div id="one">One</div>', '<div id="two">Two</div>'],
    },
  });

  expect(wrapper.find("#one").exists()).toBe(true);
  expect(wrapper.find("#two").exists()).toBe(true);
});
```

## 高级用法

您还可以将渲染函数、带有模板的对象，甚至从`vue`文件导入的 SFC 传递到插槽安装选项：

```js
import { h } from "vue";
import Header from "./Header.vue";

test("layout full page layout", () => {
  const wrapper = mount(Layout, {
    slots: {
      header: Header,
      main: h("div", "Main Content"),
      sidebar: { template: "<div>Sidebar</div>" },
      footer: "<div>Footer</div>",
    },
  });

  expect(wrapper.html()).toContain("<div>Header</div>");
  expect(wrapper.html()).toContain("<div>Main Content</div>");
  expect(wrapper.html()).toContain("<div>Footer</div>");
});
```

有关更多示例和用例，请参阅[测试](https://github.com/vuejs/test-utils/blob/9d3c2a6526f3d8751d29b2f9112ad2a3332bbf52/tests/mountingOptions/slots.spec.ts#L124-L167)。

## 具名插槽

还支持具名插槽绑定:

```js
const ComponentWithSlots = {
  template: `
    <div class="scoped">
      <slot name="scoped" v-bind="{ msg }" />
    </div>
  `,
  data() {
    return {
      msg: "world",
    };
  },
};

test("scoped slots", () => {
  const wrapper = mount(ComponentWithSlots, {
    slots: {
      scoped: `<template #scoped="scope">
        Hello {{ scope.msg }}
        </template>
      `,
    },
  });

  expect(wrapper.html()).toContain("Hello world");
});
```

对槽内容使用字符串模板时，如果未使用包装`<template#scoped=“scopeVar”>`标记明确定义，则在评估槽时，槽作用域将作为`params`对象可用。

```js
test("scoped slots", () => {
  const wrapper = mount(ComponentWithSlots, {
    slots: {
      scoped: `Hello {{ params.msg }}`, // no wrapping template tag provided, slot scope exposed as "params"
    },
  });

  expect(wrapper.html()).toContain("Hello world");
});
```

## 结论

- 使用插槽安装选项可以测试使用`＜slot＞`的组件是否正确呈现内容。
- 内容可以是字符串、呈现函数或导入的 SFC。
- 默认插槽使用默认名称，命名插槽使用正确名称。
- 还支持 scoped 插槽和`#`简写。
