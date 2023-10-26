# 测试 `v-model`

当编写依赖于`v-model`交互的组件时(更新:`modelValue`事件)，你需要处理事件和`props`。

查看一些社区解决方案的“[vmodel 集成](https://github.com/vuejs/test-utils/discussions/279)”讨论。

检查[VueJS VModel](https://vuejs.org/guide/components/v-model.html)事件文档

## 简单的例子

这里有一个简单的 Editor 组件:

```js
const Editor = {
  props: {
    label: String,
    modelValue: String,
  },
  emits: ["update:modelValue"],
  template: `<div>
    <label>{{label}}</label>
    <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)">
  </div>`,
};
```

这个组件的行为就像一个`input`组件:

```js
const App {
  components: {
    Editor
  },
  template: `<editor v-model="text" label="test" />`,
  data(){
    return {
      text: 'test'
    }
  }
}
```

现在，当我们输入`input`时，它将更新组件上的文本。

要测试此行为:

```js
test("modelValue should be updated", async () => {
  const wrapper = mount(Editor, {
    props: {
      modelValue: "initialText",
      "onUpdate:modelValue": (e) => wrapper.setProps({ modelValue: e }),
    },
  });

  await wrapper.find("input").setValue("test");
  expect(wrapper.props("modelValue")).toBe("test");
});
```

## 多个 `v-model`

在某些情况下，我们可以有多个针对特定属性的`v-model`。

例如`Money Editor`，我们可以有`currency`和`modelValue`属性。

```js
const MoneyEditor = {
  template: `<div> 
    <input :value="currency" @input="$emit('update:currency', $event.target.value)"/>
    <input :value="modelValue" type="number" @input="$emit('update:modelValue', $event.target.value)"/>
  </div>`,
  props: ["currency", "modelValue"],
  emits: ["update:currency", "update:modelValue"],
};
```

我们可以通过以下方式进行测试:

```js
test("modelValue and currency should be updated", async () => {
  const wrapper = mount(MoneyEditor, {
    props: {
      modelValue: "initialText",
      "onUpdate:modelValue": (e) => wrapper.setProps({ modelValue: e }),
      currency: "$",
      "onUpdate:currency": (e) => wrapper.setProps({ currency: e }),
    },
  });

  const [currencyInput, modelValueInput] = wrapper.findAll("input");
  await modelValueInput.setValue("test");
  await currencyInput.setValue("£");

  expect(wrapper.props("modelValue")).toBe("test");
  expect(wrapper.props("currency")).toBe("£");
});
```
