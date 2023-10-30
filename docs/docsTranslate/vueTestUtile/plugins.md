# 插件

插件将全局级功能添加到`Vue Test Utils`的`API`中。这是使用自定义逻辑、方法或功能扩展`Vue Test Utils API`的正式方式。

插件的一些用例:

- 混叠现有的公共方法
- 将匹配器附加到`Wrapper`实例
- 将功能附加到`wrapper`

## `Wrapper`插件

### 使用插件

通过调用`config.plugins.VueWrapper.install()`方法安装插件。这必须在你呼叫`mount`之前完成。

`install()`方法将接收一个`WrapperAPI`实例，其中包含该实例的公共和私有属性。

```js
// setup.js file
import { config } from "@vue/test-utils";

// locally defined plugin, see "Writing a Plugin"
import MyPlugin from "./myPlugin";

// Install a plugin onto VueWrapper
config.plugins.VueWrapper.install(MyPlugin);
```

你可以选择性地传入一些选项:

```js
config.plugins.VueWrapper.install(MyPlugin, { someOption: true });
```

你的插件应该安装一次。如果您正在使用`Jest`，这应该在`Jest`配置的`setupFiles`或`setupFilesAfterEnv`文件中。

有些插件在导入时会自动调用`config.plugins.VueWrapper.install()`。如果他们同时扩展多个接口，这是很常见的。按照您正在安装的插件的说明操作。

查看`Vue`社区指南或`awesome-vue`获取社区贡献的插件和库的集合。

### 编写插件

`Vue Test Utils`插件只是一个接收挂载的`Vue wrapper`或`DOMWrapper`实例并可以对其进行修改的函数。

**基本插件**

下面是一个简单的插件，可以为映射包装器添加方便的别名。`wrapper.element`到`wrapper.$el`。

```js
// setup.js
import { config } from "@vue/test-utils";

const myAliasPlugin = (wrapper) => {
  return {
    $el: wrapper.element, // simple aliases
  };
};

// Call install on the type you want to extend
// You can write a plugin for any value inside of config.plugins
config.plugins.VueWrapper.install(myAliasPlugin);
```

在您的项目中，您将能够在挂载后使用插件。

```js
// component.spec.js
const wrapper = mount({ template: `<h1>🔌 Plugin</h1>` });
console.log(wrapper.$el.innerHTML); // 🔌 Plugin
```

**数据测试插件 ID**

下面的插件将`findbytestd`方法添加到`VueWrapper`实例中。这鼓励使用依赖于`Vue`组件上仅测试属性的选择器策略。

```vue
<template>
  <MyForm class="form-container" data-testid="form">
    <MyInput data-testid="name-input" v-model="name" />
  </MyForm>
</template>
```

**使用**

`MyComponent.vue`

```vue
<template>
  <MyForm class="form-container" data-testid="form">
    <MyInput data-testid="name-input" v-model="name" />
  </MyForm>
</template>
```

`MyComponent.spec.js:`

```js
const wrapper = mount(MyComponent);
wrapper.findByTestId("name-input"); // returns a VueWrapper or DOMWrapper
```

插件的实现:

```js
import { config } from "@vue/test-utils";

const DataTestIdPlugin = (wrapper) => {
  function findByTestId(selector) {
    const dataSelector = `[data-testid='${selector}']`;
    const element = wrapper.element.querySelector(dataSelector);
    return new DOMWrapper(element);
  }

  return {
    findByTestId,
  };
};

config.plugins.VueWrapper.install(DataTestIdPlugin);
```

## 截断插件

`config.plugins.createStubs`允许覆盖`VTU`提供的默认`sutb`创建。

一些用例是：

- 您希望在`stubs`中添加更多的逻辑(例如命名的插槽)
- 您希望对多个组件使用不同的`stubs`(例如来自库的`stubs`组件)

### 使用

```js
config.plugins.createStubs = ({ name, component }) => {
  return defineComponent({
    render: () => h(`custom-${name}-stub`),
  });
};
```

此函数将在每次`VTU`生成`stub`时调用

```js
const wrapper = mount(Component, {
  global: {
    stubs: {
      ChildComponent: true,
    },
  },
});
```

或

```js
const wrapper = shallowMount(Component);
```

但是，当显式设置`stub`时，将不会调用

```js
const wrapper = mount(Component, {
  global: {
    stubs: {
      ChildComponent: { template: "<child-stub/>" },
    },
  },
});
```

## 使用`TypeScript`插件

要在`TypeScript`中使用自定义包装器插件，你必须声明自定义包装器函数。因此，添加一个名为`vue-test-utils.d`的文件。包含以下内容:

```js
import { DOMWrapper } from '@vue/test-utils';

declare module '@vue/test-utils' {
  export class VueWrapper {
    findByTestId(testId: string): DOMWrapper[];
  }
}
```

## 展示你的插件

如果你缺少功能，考虑编写一个插件来扩展`Vue-Test-Utils`，并将其提交到`Vue`社区指南或`awesome-vue`。
