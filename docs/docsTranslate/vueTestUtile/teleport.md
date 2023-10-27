# 测试 `Teleport`

`Vue 3`配备了一个新的内置组件：`＜Teleport＞`，它允许组件在自己的`＜template＞`之外“`teleport`”其内容。大多数使用`Vue Test Utils`编写的测试的范围都是传递到`mount`的组件，这在测试在最初呈现组件的组件外部传输的组件时引入了一些复杂性。

以下是使用`<Teleport>`测试组件的一些策略和技术。

:::tip 提示
如果你想测试你的组件的其余部分，忽略`teleport`，你可以通过在全局存根选项中传递`teleport：true`来存根传送。
:::

## 例子

在本例中，我们正在测试`<Navbar>`组件。它在`<Teleport>`内部呈现`<Signup>`组件。`<Teleport>`的`target`道具是位于`<Navbar>`组件外部的元素。

这是`Navbar.vue`组件：

```vue
<template>
  <Teleport to="#modal">
    <Signup />
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Signup from "./Signup.vue";

export default defineComponent({
  components: {
    Signup,
  },
});
</script>
```

它只是将`＜Signup＞`传送到其他地方。对于这个例子来说，它很简单。

`Signup.vue`是一个验证`username`是否大于 8 个字符的表单。如果是，则在提交时，它会发出一个以`username`作为有效负载的注册事件。测试将是我们的目标。

```vue
<template>
  <div>
    <form @submit.prevent="submit">
      <input v-model="username" />
    </form>
  </div>
</template>

<script>
export default {
  emits: ["signup"],
  data() {
    return {
      username: "",
    };
  },
  computed: {
    error() {
      return this.username.length < 8;
    },
  },
  methods: {
    submit() {
      if (!this.error) {
        this.$emit("signup", this.username);
      }
    },
  },
};
</script>
```

## 拼接组件

从最低限度的测试开始：

```js
import { mount } from "@vue/test-utils";
import Navbar from "./Navbar.vue";
import Signup from "./Signup.vue";

test("emits a signup event when valid", async () => {
  const wrapper = mount(Navbar);
});
```

运行此测试将向您发出警告： `[Vue warn]: Failed to locate Teleport target with selector "#modal".`，让我们创建它：

```js
import { mount } from "@vue/test-utils";
import Navbar from "./Navbar.vue";
import Signup from "./Signup.vue";

beforeEach(() => {
  // create teleport target
  const el = document.createElement("div");
  el.id = "modal";
  document.body.appendChild(el);
});

afterEach(() => {
  // clean up
  document.body.outerHTML = "";
});

test("teleport", async () => {
  const wrapper = mount(Navbar);
});
```

我们在这个例子中使用了`Jest`，它不会在每次测试时重置`DOM`。因此，每次测试后用`afterEach`进行清理是很好的。

## 与 `Teleported` 组件交互

接下来要做的就是填写用户名输入。很遗憾，我们无法使用`wrapper.find（'input'）`。为什么不呢？一个快速的`console.log（wrapper.html（））`向我们展示：

```html
<!--teleport start-->
<!--teleport end-->
```

我们看到`Vue`在处理`＜Teleport＞`时使用了一些注释，但没有`＜input＞`。这是因为`<Signup>`组件（及其`HTML`）不再在`<Navbar>`内部呈现，而是在外部传送。

尽管实际的`HTML`被传送到外部，但事实证明，与`＜Navbar＞`相关联的虚拟`DOM`保留了对原始组件的引用。这意味着您可以使用`getComponent`和`findComponent`，它们在虚拟`DOM`上操作，而不是在常规`DOM`上操作:

```js
beforeEach(() => {
  // ...
});

afterEach(() => {
  // ...
});

test("teleport", async () => {
  const wrapper = mount(Navbar);

  wrapper.getComponent(Signup); // got it!
});
```

`getComponent`返回一个`VueWrapper`。现在您可以使用`get`、`find`和`trigger`等方法。

让我们完成测试：

```js
test("teleport", async () => {
  const wrapper = mount(Navbar);

  const signup = wrapper.getComponent(Signup);
  await signup.get("input").setValue("valid_username");
  await signup.get("form").trigger("submit.prevent");

  expect(signup.emitted().signup[0]).toEqual(["valid_username"]);
});
```

它通过了！

完整测试：

```js
import { mount } from "@vue/test-utils";
import Navbar from "./Navbar.vue";
import Signup from "./Signup.vue";

beforeEach(() => {
  // create teleport target
  const el = document.createElement("div");
  el.id = "modal";
  document.body.appendChild(el);
});

afterEach(() => {
  // clean up
  document.body.outerHTML = "";
});

test("teleport", async () => {
  const wrapper = mount(Navbar);

  const signup = wrapper.getComponent(Signup);
  await signup.get("input").setValue("valid_username");
  await signup.get("form").trigger("submit.prevent");

  expect(signup.emitted().signup[0]).toEqual(["valid_username"]);
});
```

## 结论

- 使用`document.createElement`创建传送目标。
- 使用在虚拟`DOM`级别上操作的`getComponent`或`findComponent`查找传送的组件。
