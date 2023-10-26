# 过渡 (`transition`)

通常，您可能希望在转换之后测试生成的 DOM，这就是为什么`Vue test Utils`默认模拟`<transition>`和`<transition-group>`。

下面是一个简单的组件，用于切换包装在渐变过渡中的内容:

```vue
<template>
  <button @click="show = !show">Toggle</button>

  <transition name="fade">
    <p v-if="show">hello</p>
  </transition>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const show = ref(false);

    return {
      show,
    };
  },
};
</script>

<style lang="css">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

由于`Vue Test Utils`存根了内置转换，你可以像测试其他组件一样测试上面的组件:

```js
import Component from "./Component.vue";
import { mount } from "@vue/test-utils";

test("works with transitions", async () => {
  const wrapper = mount(Component);

  expect(wrapper.find("hello").exists()).toBe(false);

  await wrapper.find("button").trigger("click");

  // After clicking the button, the <p> element exists and is visible
  expect(wrapper.get("p").text()).toEqual("hello");
});
```

由于`Vue Test Utils`存根了内置转换，你可以像测试其他组件一样测试上面的组件:

```js
import Component from "./Component.vue";
import { mount } from "@vue/test-utils";

test("works with transitions", async () => {
  const wrapper = mount(Component);

  expect(wrapper.find("hello").exists()).toBe(false);

  await wrapper.find("button").trigger("click");

  // After clicking the button, the <p> element exists and is visible
  expect(wrapper.get("p").text()).toEqual("hello");
});
```
