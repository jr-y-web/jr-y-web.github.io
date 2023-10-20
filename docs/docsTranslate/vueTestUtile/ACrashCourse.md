# 快速入门

让我们直接入门进去吧！让我们通过构建一个简单的 Todo 应用程序并边写测试来学习`Vue Test Utils（VTU）`。本指南将介绍如何：

- 安装组件
- 查找元素
- 填写表格
- 触发器事件

## 入门

我们将从一个简单的 `TodoApp` 组件开始，该组件只有一个 todo：

```vue
<template>
  <div></div>
</template>

<script>
export default {
  name: "TodoApp",

  data() {
    return {
      todos: [
        {
          id: 1,
          text: "Learn Vue.js 3",
          completed: false,
        },
      ],
    };
  },
};
</script>
```

## 第一个测试 - todo 的显示

我们将编写的第一个测试验证 todo 是否已呈现。让我们先看测试，然后讨论每个部分：

```js
import { mount } from "@vue/test-utils";
import TodoApp from "./TodoApp.vue";

test("renders a todo", () => {
  const wrapper = mount(TodoApp);

  const todo = wrapper.get('[data-test="todo"]');

  expect(todo.text()).toBe("Learn Vue.js 3");
});
```

我们从导入 `mount` 开始——这是在 VTU 中渲染组件的主要方式。通过使用带有测试简短描述的测试函数来声明测试。测试和期望函数在大多数测试运行程序中都是全局可用的（本例使用`Jest`）。如果测试和预期看起来令人困惑，那么[Jest 文档](https://jestjs.io/docs/getting-started)提供了一个更简单的示例，说明如何使用它们以及它们是如何工作的。

接下来，我们调用`mount`并将组件作为第一个参数传递-这几乎是您编写的每个测试都会做的事情。按照惯例，我们将结果分配给一个名为`wrapper`的变量，因为`mount`为应用程序提供了一个简单的“wrapper”，并提供了一些方便的测试方法。

最后，我们使用了另一个通用于许多测试运行程序的全局函数——包括 Jest——`expect`。我们的想法是断言或期望实际输出与我们认为应该匹配的结果相匹配。在这种情况下，我们在 DOM 中找到一个选择器`datatest=“todo”`的元素，这看起来像`<div datatest=”todo“></div>`。然后我们调用`text`方法来获取内容，我们希望它是`“Learn Vue.js 3”`。

> 不需要使用数据测试选择器，但它可以降低测试的脆弱性。类和 id 往往会随着应用程序的增长而变化或移动——通过使用数据测试，其他开发人员可以清楚地知道哪些元素在测试中使用，不应该更改。

## 让测试通过

如果我们现在运行此测试，它将失败，并显示以下错误消息：`Unable to get[data test=“todo”]`。这是因为我们没有呈现任何 todo 项，所以`get()`调用无法返回包装器（请记住，VTU 使用一些方便的方法将所有组件和 DOM 元素包装在“包装器”中）。让我们更新`TodoApp.vue`中的`＜template＞`来渲染 todos 数组：

```vue
<template>
  <div>
    <div v-for="todo in todos" :key="todo.id" data-test="todo">
      {{ todo.text }}
    </div>
  </div>
</template>
```

有了这个变化，测试就通过了。祝贺您编写了第一个组件测试。

## 添加新的 todo

我们将添加的下一个功能是让用户能够创建一个新的 todo。为此，我们需要一个带有输入的表单，以便用户键入一些文本。当用户提交表单时，我们期望呈现新的 todo。让我们来看看测试：

```js
import { mount } from "@vue/test-utils";
import TodoApp from "./TodoApp.vue";

test("creates a todo", () => {
  const wrapper = mount(TodoApp);
  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(1);

  wrapper.get('[data-test="new-todo"]').setValue("New todo");
  wrapper.get('[data-test="form"]').trigger("submit");

  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2);
});
```

和往常一样，我们首先使用`mount`来渲染元素。我们还断言只呈现了 1 个 todo——这表明我们正在添加一个额外的 todo，正如测试的最后一行所示。

为了更新`＜input＞`，我们使用`setValue`-这允许我们设置输入的值。

在更新`＜input＞`后，我们使用`触发器`方法来模拟用户提交表单。最后，我们断言 todo 项目的数量已从 1 增加到 2。

如果我们运行这个测试，它显然会失败。让我们更新`TodoApp.vue`，使其具有`<form>`和`<input>`元素，并使测试通过：

```vue
<template>
  <div>
    <div v-for="todo in todos" :key="todo.id" data-test="todo">
      {{ todo.text }}
    </div>

    <form data-test="form" @submit.prevent="createTodo">
      <input data-test="new-todo" v-model="newTodo" />
    </form>
  </div>
</template>

<script>
export default {
  name: "TodoApp",

  data() {
    return {
      newTodo: "",
      todos: [
        {
          id: 1,
          text: "Learn Vue.js 3",
          completed: false,
        },
      ],
    };
  },

  methods: {
    createTodo() {
      this.todos.push({
        id: 2,
        text: this.newTodo,
        completed: false,
      });
    },
  },
};
</script>
```

我们使用 `v-model` 绑定到`＜input＞`和`@submit`来侦听表单提交。提交表单时，将调用`createTodo`，并在`todo`数组中插入一个新的`todo`。

虽然这看起来不错，但运行测试会显示一个错误：

```js
expect(received).toHaveLength(expected)

    Expected length: 2
    Received length: 1
    Received array:  [{"element": <div data-test="todo">Learn Vue.js 3</div>}]
```

todo 的数量没有增加。问题是`Jest`以同步的方式执行测试，在调用最终函数后立即结束测试。然而，`Vue`异步更新`DOM`。我们需要将测试标记为`async`，并对任何可能导致`DOM`更改的方法调用`await`。`trigger`就是这样的方法之一，`setValue`也是如此——我们可以简单地预先结束等待，测试应该按预期工作：

```js
import { mount } from "@vue/test-utils";
import TodoApp from "./TodoApp.vue";

test("creates a todo", async () => {
  const wrapper = mount(TodoApp);

  await wrapper.get('[data-test="new-todo"]').setValue("New todo");
  await wrapper.get('[data-test="form"]').trigger("submit");

  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2);
});
```

现在测试终于通过了！

## 完成待办事项

现在我们可以创建 todo 了，让用户能够使用复选框将 todo 项目标记为已完成/未完成。如前所述，让我们从失败的测试开始：

```js
import { mount } from "@vue/test-utils";
import TodoApp from "./TodoApp.vue";

test("completes a todo", async () => {
  const wrapper = mount(TodoApp);

  await wrapper.get('[data-test="todo-checkbox"]').setValue(true);

  expect(wrapper.get('[data-test="todo"]').classes()).toContain("completed");
});
```

此测试与前两个测试类似；我们找到一个元素并以同样的方式与它交互（我们再次使用`setValue`，因为我们正在与`<input>`交互）。

最后，我们提出一个主张。我们将把一个已完成的类应用于已完成的 `todo`，然后我们可以使用它来添加一些样式，以直观地指示 `todo` 的状态。

我们可以通过更新`＜template＞`以包含`＜input type=“checkbox”＞`和 `todo` 元素上的类绑定来通过此测试：

```vue
<template>
  <div>
    <div
      v-for="todo in todos"
      :key="todo.id"
      data-test="todo"
      :class="[todo.completed ? 'completed' : '']"
    >
      {{ todo.text }}
      <input
        type="checkbox"
        v-model="todo.completed"
        data-test="todo-checkbox"
      />
    </div>

    <form data-test="form" @submit.prevent="createTodo">
      <input data-test="new-todo" v-model="newTodo" />
    </form>
  </div>
</template>
```

祝贺您编写了第一个组件测试。

## 安排、行动、断言

您可能已经注意到每个测试中代码之间存在行隔开。让我们再次详细查看第二个测试：

```js
import { mount } from "@vue/test-utils";
import TodoApp from "./TodoApp.vue";

test("creates a todo", async () => {
  const wrapper = mount(TodoApp);

  await wrapper.get('[data-test="new-todo"]').setValue("New todo");
  await wrapper.get('[data-test="form"]').trigger("submit");

  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2);
});
```

测试分为三个不同的阶段，用新的行隔开。这三个阶段代表了测试的三个阶段：`安排`、`行动`和`断言`。

- 在安排阶段，我们正在为测试设置场景。更复杂的示例可能需要创建`Vuex`存储或填充数据库。
- 在动作阶段，我们执行场景，模拟用户如何与组件或应用程序交互。
- 在断言阶段，我们断言组件的当前状态。

几乎所有的测试都将遵循这三个阶段。你不需要像本指南那样用新行将它们分开，但在编写测试时，最好记住这三个阶段。

## 结论

- 使用`mount()`渲染组件。
- 使用`get()`和`findAll()`查询`DOM`。
- `trigger()`和`setValue()`是模拟用户输入的助手。
- 更新`DOM`是一个异步操作，因此请确保使用异步和等待。
- 测试通常由 3 个阶段组成；安排、行动和主张。
