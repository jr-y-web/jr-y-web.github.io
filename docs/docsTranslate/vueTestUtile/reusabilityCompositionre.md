# 可重用性 & 组合性

主要是：

- `global.mixins`
- `global.directives`

## 组合性测试

在使用组合 API 并创建可组合物时，您通常只想测试可组合物。让我们从一个简单的例子开始:

```typescript
export function useCounter() {
  const counter = ref(0);

  function increase() {
    counter.value += 1;
  }

  return { counter, increase };
}
```

在这种情况下，实际上不需要`@vue/test-utils`。下面是相应的测试:

```typescript
test("increase counter on call", () => {
  const { counter, increase } = useCounter();

  expect(counter.value).toBe(0);

  increase();

  expect(counter.value).toBe(1);
});
```

对于使用生命周期钩子(如`onMounted`或`provide`/`inject`处理)的更复杂的可组合组件，您可以创建一个简单的测试助手组件。下面的可组合函数从`onMounted`钩子中获取用户数据。

```typescript
export function useUser(userId) {
  const user = ref();

  function fetchUser(id) {
    axios.get(`users/${id}`).then((response) => (user.value = response.data));
  }

  onMounted(() => fetchUser(userId));

  return { user };
}
```

为了测试这个可组合，您可以在测试中创建一个简单的`TestComponent`。`TestComponent`应该以与实际组件完全相同的方式使用可组合组件。

```typescript
// Mock API request
jest.spyOn(axios, "get").mockResolvedValue({ data: { id: 1, name: "User" } });

test("fetch user on mount", async () => {
  const TestComponent = defineComponent({
    props: {
      // Define props, to test the composable with different input arguments
      userId: {
        type: Number,
        required: true,
      },
    },
    setup(props) {
      return {
        // Call the composable and expose all return values into our
        // component instance so we can access them with wrapper.vm
        ...useUser(props.userId),
      };
    },
  });

  const wrapper = mount(TestComponent, {
    props: {
      userId: 1,
    },
  });

  expect(wrapper.vm.user).toBeUndefined();

  await flushPromises();

  expect(wrapper.vm.user).toEqual({ id: 1, name: "User" });
});
```

## provide / inject

`Vue`提供了一种通过`provide`和`inject`将`props`传递给所有子组件的方法。测试这种行为的最好方法是测试整个树(父树+子树)。但有时这是不可能的，因为树太复杂，或者您只想测试单个可组合对象。

### 测试 `provide`

让我们假设你要测试以下组件:

```vue
<template>
  <div>
    <slot />
  </div>
</template>

<script setup>
provide("my-key", "some-data");
</script>
```

在这种情况下，您可以呈现一个实际的子组件并测试提供的正确用法，或者您可以创建一个简单的测试助手组件并将其`provide`到默认插槽中。

```typescript
test("provides correct data", () => {
  const TestComponent = defineComponent({
    template: '<span id="provide-test">{{value}}</span>',
    setup() {
      const value = inject("my-key");
      return { value };
    },
  });

  const wrapper = mount(ParentComponent, {
    slots: {
      default: () => h(TestComponent),
    },
  });

  expect(wrapper.find("#provide-test").text()).toBe("some-data");
});
```

如果您的组件不包含插槽，您可以使用`stub`并用测试助手替换子组件：

```vue
<template>
  <div>
    <SomeChild />
  </div>
</template>

<script setup>
import SomeChild from "./SomeChild.vue";

provide("my-key", "some-data");
</script>
```

测试：

```js
test("provides correct data", () => {
  const TestComponent = defineComponent({
    template: '<span id="provide-test">{{value}}</span>',
    setup() {
      const value = inject("my-key");
      return { value };
    },
  });

  const wrapper = mount(ParentComponent, {
    global: {
      stubs: {
        SomeChild: TestComponent,
      },
    },
  });

  expect(wrapper.find("#provide-test").text()).toBe("some-data");
});
```

## 测试 `inject`

当您的组件使用 inject 并且您需要使用 provide 传递数据时，您可以使用 global.provide 选项。

```vue
<template>
  <div>
    {{ value }}
  </div>
</template>

<script setup>
const value = inject("my-key");
</script>
```

单元测试可以简单地看起来像：

```js
test("renders correct data", () => {
  const wrapper = mount(MyComponent, {
    global: {
      provide: {
        "my-key": "some-data",
      },
    },
  });

  expect(wrapper.text()).toBe("some-data");
});
```

## 结论

- 测试简单的组件,实际上不需要`@vue/test-utils`
- 创建一个测试助手组件来测试更复杂的可组合物
- 创建一个测试助手组件来测试您的组件是否提供了正确的`provide`
- 使用全局。提供将数据传递给使用 `inject` 的组件
