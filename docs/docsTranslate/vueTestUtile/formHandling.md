# 表单处理

`Vue`中的表单可以像普通`HTML`表单到自定义`Vue`组件表单元素的复杂嵌套树一样简单。我们将逐渐经历与形式元素互动、设定价值和触发事件的方式。

我们使用最多的方法是`setValue()`和`trigger()`。

## 与表单元素交互

让我们来看看一个非常基本的形式：

```vue
<template>
  <div>
    <input type="email" v-model="email" />

    <button @click="submit">Submit</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
    };
  },
  methods: {
    submit() {
      this.$emit("submit", this.email);
    },
  },
};
</script>
```

### 设置元素值

在`Vue`中，将输入绑定到数据的最常见方法是使用`v-model`。正如您现在可能知道的那样，它负责处理每个表单元素发出的事件，以及它接受的道具，使我们可以轻松地使用表单元素。

要在`VTU`中输入`input`的值，可以使用`setValue()`方法。它接受一个参数，通常是`String`或`Boolean`，并返回一个`Promise`，它在`Vue`更新`DOM`后解析。

```js
test("sets the value", async () => {
  const wrapper = mount(Component);
  const input = wrapper.find("input");

  await input.setValue("my@mail.com");

  expect(input.element.value).toBe("my@mail.com");
});
```

正如您所看到的，`setValue`将输入元素的`value`属性设置为我们传递给它的值。

在我们做出任何断言之前，我们使用`await`来确保`Vue`已经完成更新，并且更改已经反映在`DOM`中。

### 触发事件

在处理表单和操作元素时，触发事件是第二重要的操作。让我们从前面的例子中来看看我们的`button`。

```html
<button @click="submit">Submit</button>
```

要触发点击事件，我们可以使用触发器方法。

```js
test("trigger", async () => {
  const wrapper = mount(Component);

  // trigger the element
  await wrapper.find("button").trigger("click");

  // assert some action has been performed, like an emitted event.
  expect(wrapper.emitted()).toHaveProperty("submit");
});
```

> 如果你以前没有见过`emitted()`，不要担心。它用于断言组件的已发出事件。您可以在事件处理中了解[更多信息](./eventHandling.md)。

我们触发`click`事件侦听器，以便组件执行提交方法。正如我们对`setValue`所做的那样，我们使用`await`来确保`Vue`反映了操作。

然后我们可以断言已经采取了一些行动。在这种情况下，我们发出了正确的事件。

让我们将这两者结合起来测试我们的简单表单是否正在发出用户输入。

```js
test("emits the input to its parent", async () => {
  const wrapper = mount(Component);

  // set the value
  await wrapper.find("input").setValue("my@mail.com");

  // trigger the element
  await wrapper.find("button").trigger("click");

  // assert the `submit` event is emitted,
  expect(wrapper.emitted("submit")[0][0]).toBe("my@mail.com");
});
```

## 高级工作流

既然我们已经了解了基础知识，让我们深入研究更复杂的示例。

### 使用各种各样的元素

我们看到`setValue`可以处理输入`input`，但它的用途要广泛得多，因为它可以在各种类型的输入元素上设置值。

让我们来看一个更复杂的表单，它有更多类型的`inputs`。

```vue
<template>
  <form @submit.prevent="submit">
    <input type="email" v-model="form.email" />

    <textarea v-model="form.description" />

    <select v-model="form.city">
      <option value="new-york">New York</option>
      <option value="moscow">Moscow</option>
    </select>

    <input type="checkbox" v-model="form.subscribe" />

    <input type="radio" value="weekly" v-model="form.interval" />
    <input type="radio" value="monthly" v-model="form.interval" />

    <button type="submit">Submit</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        email: "",
        description: "",
        city: "",
        subscribe: false,
        interval: "",
      },
    };
  },
  methods: {
    async submit() {
      this.$emit("submit", this.form);
    },
  },
};
</script>
```

我们的扩展`Vue`组件让它长了一点，有更多的`input`类型，现在已经将提交处理程序移到了`＜form/＞`元素中。

就像我们在`input`上设置值一样，我们也可以在表单中的所有其他输入上设置它。

```js
import { mount } from "@vue/test-utils";
import FormComponent from "./FormComponent.vue";

test("submits a form", async () => {
  const wrapper = mount(FormComponent);

  await wrapper.find("input[type=email]").setValue("name@mail.com");
  await wrapper.find("textarea").setValue("Lorem ipsum dolor sit amet");
  await wrapper.find("select").setValue("moscow");
  await wrapper.find("input[type=checkbox]").setValue();
  await wrapper.find("input[type=radio][value=monthly]").setValue();
});
```

正如您所看到的，`setValue`是一个非常通用的方法。它可以处理所有类型的表单元素。

我们在任何地方都使用`await`，以确保在触发下一个更改之前，每个更改都已应用。建议这样做，以确保在`DOM`更新时进行断言。

::: tip 提示
如果没有将参数传递给`OPTION`、`CHECKBOX`或`RADIO`的`setValue`，则它们将设置为`checked`。
:::

我们已经在表单中设置了值，现在是时候提交表单并进行一些断言了。

### 触发复杂事件侦听器

事件监听器并不总是简单的`click`事件。`Vue`允许您监听各种`DOM`事件，添加一些特殊的修饰符，如`.pruced`等。让我们看看如何测试这些。

在上面的表单中，我们将事件从`button`移动到表单元素。这是一个很好的做法，因为这允许您通过点击回车键提交表格，这是一种更为原生的方法。

为了触发提交处理程序，我们再次使用`trigger`方法。

```js
test("submits the form", async () => {
  const wrapper = mount(FormComponent);

  const email = "name@mail.com";
  const description = "Lorem ipsum dolor sit amet";
  const city = "moscow";

  await wrapper.find("input[type=email]").setValue(email);
  await wrapper.find("textarea").setValue(description);
  await wrapper.find("select").setValue(city);
  await wrapper.find("input[type=checkbox]").setValue();
  await wrapper.find("input[type=radio][value=monthly]").setValue();

  await wrapper.find("form").trigger("submit.prevent");

  expect(wrapper.emitted("submit")[0][0]).toStrictEqual({
    email,
    description,
    city,
    subscribe: true,
    interval: "monthly",
  });
});
```

为了测试事件修饰符，我们直接将事件字符串`submit.prevent`复制粘贴到`trigger`中。`trigger`可以读取传递的事件及其所有修饰符，并选择性地应用必要的内容。

::: tip 提示
本地事件修饰符，如`.prvent`和`.stop`是`Vue`特定的，因此我们不需要测试它们，`Vue`内部已经这样做了。
:::

然后，我们进行一个简单的断言，判断表单是否发出了正确的事件和有效负载。

#### 本地表单提交

在`<form>`元素上触发提交事件模拟了表单提交过程中的浏览器行为。如果我们想更自然地触发表单提交，我们可以在提交按钮上触发点击事件。由于无法提交未连接到文档的表单元素，根据 HTML 规范，我们需要使用 attachTo 来连接包装器的元素。

#### 同一事件上的多个修饰符

让我们假设您有一个非常详细和复杂的表单，具有特殊的交互处理。我们该如何进行测试？

```vue
<input @keydown.meta.c.exact.prevent="captureCopy" v-model="input" />
```

假设我们有一个处理用户单击`cmd+c`时的输入，并且我们希望拦截并阻止他进行复制。测试这一点就像将事件从 Component 复制粘贴到`trigger()`方法一样简单

```js
test("handles complex events", async () => {
  const wrapper = mount(Component);

  await wrapper.find(input).trigger("keydown.meta.c.exact.prevent");

  // run your assertions
});
```

`Vue Test Utils`读取事件并将适当的属性应用于事件对象。在这种情况下，它将匹配如下内容：

```json
{
  // ... other properties
  "key": "c",
  "metaKey": true
}
```

#### 向事件添加额外数据

假设您的代码需要来自`event`对象内部的内容。您可以通过传递额外的数据作为第二个参数来测试这样的场景。

```vue
<template>
  <form>
    <input type="text" v-model="value" @blur="handleBlur" />
    <button>Submit</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      value: "",
    };
  },
  methods: {
    handleBlur(event) {
      if (event.relatedTarget.tagName === "BUTTON") {
        this.$emit("focus-lost");
      }
    },
  },
};
</script>
```

```js
import Form from "./Form.vue";

test("emits an event only if you lose focus to a button", () => {
  const wrapper = mount(Form);

  const componentToGetFocus = wrapper.find("button");

  wrapper.find("input").trigger("blur", {
    relatedTarget: componentToGetFocus.element,
  });

  expect(wrapper.emitted("focus-lost")).toBeTruthy();
});
```

在这里，我们假设我们的代码在`event`对象内部进行检查，不管`relatedTarget`是否是`button`。我们可以简单地传递对这样一个元素的引用，模拟用户在`input`中键入内容后点击`button`会发生什么。

## 与 Vue 组件输入交互

`inputs`不仅仅是简单的元素。我们经常使用行为类似于输入的`Vue`组件。它们可以以易于使用的格式添加标记、样式和许多功能。

起初，测试使用此类输入的表格可能会让人望而却步，但只要有一些简单的规则，它很快就会变成公园里的散步。

以下是包装`label`和`input`元素的组件：

```vue
<template>
  <label>
    {{ label }}
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </label>
</template>

<script>
export default {
  name: "CustomInput",

  props: ["modelValue", "label"],
};
</script>
```

这个`Vue`组件也会发射回您键入的任何内容。要使用它，请执行以下操作：

```vue
<custom-input v-model="input" label="Text Input" class="text-input" />
```

如上所述，大多数`Vue`供电的输入都有一个真正的`button`或`inputs`。你可以很容易地找到这个元素并采取行动：

```js
test("fills in the form", async () => {
  const wrapper = mount(CustomInput);

  await wrapper.find(".text-input input").setValue("text");

  // continue with assertions or actions like submit the form, assert the DOM…
});
```

### 测试复杂的输入组件

如果输入组件不是那么简单，会发生什么？您可能正在使用一个 UI 库，如`Vuetify`。如果您依赖于在标记内部挖掘来找到正确的元素，那么如果外部库决定更改其内部，则测试可能会中断。

在这种情况下，可以使用组件实例和`setValue`直接设置值。

假设我们有一个使用`Vuetify`文本区域的表单：

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <v-textarea v-model="description" ref="description" />
    <button type="submit">Send</button>
  </form>
</template>

<script>
export default {
  name: "CustomTextarea",
  data() {
    return {
      description: "",
    };
  },
  methods: {
    handleSubmit() {
      this.$emit("submitted", this.description);
    },
  },
};
</script>
```

我们可以使用`findComponent`来查找组件实例，然后设置其值。

```js
test("emits textarea value on submit", async () => {
  const wrapper = mount(CustomTextarea);
  const description = "Some very long text...";

  await wrapper.findComponent({ ref: "description" }).setValue(description);

  wrapper.find("form").trigger("submit");

  expect(wrapper.emitted("submitted")[0][0]).toEqual(description);
});
```

## 结论

- 使用`setValue`设置`DOM`输入和`Vue`组件的值。
- 使用`trigger`来触发`DOM`事件，可以使用修饰符也可以不使用修饰符。
- 使用第二个参数添加要`trigger`的额外事件数据。
- 断言`DOM`发生了更改，并发出了正确的事件。尽量不要断言`Component`实例上的数据。
