# 向组件传递数据

`Vue Test Utils`提供了几种在组件上设置`data`和`props`的方法，使您能够在不同的场景中全面测试组件的行为。

在本节中，我们将探讨`data`和`props`注入`options`，以及`VueWrapper.setProps()`来动态更新组件接收到的`props`。

## 密码组件

我们将通过构建`＜Password＞`组件来演示上述功能。该组件验证密码是否符合某些标准，例如长度和复杂性。我们将从以下内容开始，添加功能以及测试，以确保功能正常工作：

```js
const Password = {
  template: `
    <div>
      <input v-model="password">
    </div>
  `,
  data() {
    return {
      password: "",
    };
  },
};
```

我们将添加的第一个要求是最小长度。

## 使用`props`设置最小长度

我们希望在所有的项目中复用这个组件，每个项目可能都有不同的需求。因此，我们将使`minLength`成为一个道具，并将其传递给`＜Password＞`：

如果密码小于`minLength`，我们将显示一个`error`。我们可以通过创建一个错误计算属性，并使用`v-if`有条件地渲染它来实现这一点：

```js
const Password = {
  template: `
    <div>
      <input v-model="password">
      <div v-if="error">{{ error }}</div>
    </div>
  `,
  props: {
    minLength: {
      type: Number,
    },
  },
  computed: {
    error() {
      if (this.password.length < this.minLength) {
        return `Password must be at least ${this.minLength} characters.`;
      }
      return;
    },
  },
};
```

为了测试这一点，我们需要设置`minLength`，以及一个小于该数字的`password`。我们可以使用`data`和`props`注入`options`来实现这一点。最后，我们将断言呈现了正确的错误消息：

```js
test("renders an error if length is too short", () => {
  const wrapper = mount(Password, {
    props: {
      minLength: 10,
    },
    data() {
      return {
        password: "short",
      };
    },
  });

  expect(wrapper.html()).toContain("Password must be at least 10 characters");
});
```

为`maxLength`规则编写测试留给读者练习！另一种编写方法是使用`setValue`用太短的密码更新输入。您可以在[Forms](./formHandling.md)中了解更多信息。

## 使用 `setProps`

有时你可能需要写一个测试道具变化的副作用。如果`props`中的`show`为`true`，这个简单的`＜Show＞`组件将呈现一个问候语。

```vue
<template>
  <div v-if="show">{{ greeting }}</div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      greeting: "Hello",
    };
  },
};
</script>
```

为了全面测试这一点，我们可能需要验证是否默认呈现了`greeting`。我们可以使用`setProps()`更新`show`参数，这会导致隐藏`greeting`：

```js
import { mount } from "@vue/test-utils";
import Show from "./Show.vue";

test("renders a greeting when show is true", async () => {
  const wrapper = mount(Show);
  expect(wrapper.html()).toContain("Hello");

  await wrapper.setProps({ show: false });

  expect(wrapper.html()).not.toContain("Hello");
});
```

在调用`setProps()`时，我们还使用了`await`关键字，以确保在断言运行之前已经更新了`DOM`。

## 结论

- 使用`props`和`data`挂载选项来预设组件的状态。
- 在测试期间使用`setProps()`更新道具。
- 在`setProps()`之前使用 await 关键字，以确保`Vue`将在测试继续之前更新`DOM`。
- 直接与组件交互可以为您提供更大的覆盖范围。考虑将`setValue`或触发器与数据结合使用，以确保一切正常工作。
