# 条件呈现

`Vue Test Utils`具有一系列功能，用于呈现和断言组件的状态，目的是验证组件的行为是否正确。本文将探讨如何呈现组件，以及验证它们是否正确地呈现了内容。

你也可以观看这个[短视频](https://www.youtube.com/watch?v=T3CHtGgEFTs&list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA&index=15)。

## 查找元素

`Vue`最基本的功能之一是能够使用`v-if`动态插入和删除元素。让我们看看如何测试使用`v-if`的组件。

```js
const Nav = {
  template: `
    <nav>
      <a id="profile" href="/profile">My Profile</a>
      <a v-if="admin" id="admin" href="/admin">Admin</a>
    </nav>
`,
  data() {
    return { admin: false };
  },
};
```

在`<Nav>`组件中，会显示到用户配置文件的链接。此外，如果`admin`值为`true`，我们将显示到`admin`部分的链接。我们应该验证以下三种情况是否正确：

1. 应显示`/profile`链接。
2. 当用户是管理员时，应该显示`/admin`链接。
3. 如果用户不是管理员，则不应显示`/admin`链接。

## 使用 `get()`

`wrapper`有一个用于搜索现有元素的`get()`方法。它使用[querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)语法。

我们可以使用`get()`断言概要文件链接内容：

```js
test("renders a profile link", () => {
  const wrapper = mount(Nav);

  // Here we are implicitly asserting that the
  // element #profile exists.
  const profileLink = wrapper.get("#profile");

  expect(profileLink.text()).toEqual("My Profile");
});
```

如果`get()`没有返回与选择器匹配的元素，它将引发一个错误，并且您的测试将失败。如果找到元素，则`get()`返回一个`DOMWrapper`。`DOMWrapper`是实现`wrapper` `API`的`DOM`元素的包装器-这就是为什么我们能够执行`profileLink.text()`并访问文本。可以使用图元属性访问原始图元。

还有另一种类型的包装器——`VueWrapper`——它是从以相同方式工作的`getComponent`返回的。

## 使用 `find()` 和 `exists()`

`get()`的工作原理是假设元素确实存在，并在不存在时抛出错误。但是不建议使用它来断言存在。

为此，我们使用`find()`和`exists()`。下面的测试断言，如果`admin`为`false`（默认情况下为`false`），则不存在`admin`链接：

```js
test("does not render an admin link", () => {
  const wrapper = mount(Nav);

  // Using `wrapper.get` would throw and make the test fail.
  expect(wrapper.find("#admin").exists()).toBe(false);
});
```

请注意，我们正在对`.find()`返回的值调用`exists()`。`find()`和`mount()`一样，也返回一个包装器。`mount()`有一些额外的方法，因为它包装了`Vue`组件，`find()`只返回一个常规 DOM 节点，但许多方法在两者之间共享。其他一些方法包括`classes()`，它获取`DOM`节点所具有的类，以及`trigger()`，用于模拟用户交互。您可以在此处找到支持的方法列表。

## 使用 data

最后一个测试是断言当`admin`为`true`时会呈现 admin 链接。默认情况下它是`false`，但我们可以使用`mount()`的第二个参数，即 mounting 选项来覆盖它。

对于数据，我们使用适当命名的数据选项：

```js
test("renders an admin link", () => {
  const wrapper = mount(Nav, {
    data() {
      return {
        admin: true,
      };
    },
  });

  // Again, by using `get()` we are implicitly asserting that
  // the element exists.
  expect(wrapper.get("#admin").text()).toEqual("Admin");
});
```

如果你在数据中有其他属性，不要担心-Vue Test Utils 会将两者合并在一起。装载选项中的数据将优先于任何默认值。

要了解还存在哪些装载选项，请参阅传递数据或参阅装载选项。

## 检查元素可见性

有时，您只想隐藏/显示一个元素，同时将其保留在`DOM`中。Vue 为这样的场景提供了`v-show`。（您可以在此处查看`v-if`和`v-show`之间的差异）。

以下是带有`v-show`的组件的外观：

```js
const Nav = {
  template: `
    <nav>
      <a id="user" href="/profile">My Profile</a>
      <ul v-show="shouldShowDropdown" id="user-dropdown">
        <!-- dropdown content -->
      </ul>
    </nav>
  `,
  data() {
    return {
      shouldShowDropdown: false,
    };
  },
};
```

在这种情况下，元素不可见，但始终呈现。`get()`或`find()`将始终返回一个`Wrapper()`–`find()`with`.exists()`始终返回`true`,因为元素仍在 DOM 中。

## 使用 d `isVisiBle()`

`isVisible()`提供了检查隐藏元素的能力。特别是`isVisible()`将检查是否：

- 元素或其祖先具有 `display: none`, `visibility: hidden`, `opacity :0` 的样式
- 元素或其祖先位于折叠的＜ details ＞标记内
- 元素或其祖先具有隐藏属性

对于这些情况中的任何一种，`isVisible()`都返回`false`。

使用 `v-show` 的测试场景如下所示：

```js
test("does not show the user dropdown", () => {
  const wrapper = mount(Nav);

  expect(wrapper.get("#user-dropdown").isVisible()).toBe(false);
});
```

## 结论

- 使用`find()`和`exists()`来验证元素是否在 DOM 中。
- 如果希望元素在`DOM`中，请使用`get()`。
- 数据装载选项可用于设置零部件的默认值。
- 使用`get()`和`isVisible()`来验证 DOM 中元素的可见性
