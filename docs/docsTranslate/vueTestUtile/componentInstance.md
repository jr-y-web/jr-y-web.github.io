# 组件实例

`mount`返回一个`Vue wrapper`，其中包含许多用于测试`Vue`组件的方便方法。有时您可能希望访问底层的`Vue`实例。可以通过`vm`属性访问。

## 一个简单的例子

下面是一个简单的组件，它结合了`props`和`data`来渲染问候：

```js
test("renders a greeting", () => {
  const Comp = {
    template: `<div>{{ msg1 }} {{ msg2 }}</div>`,
    props: ["msg1"],
    data() {
      return {
        msg2: "world",
      };
    },
  };

  const wrapper = mount(Comp, {
    props: {
      msg1: "hello",
    },
  });

  expect(wrapper.html()).toContain("hello world");
});
```

让我们通过`console.log(wrapper.vm)`查看一下`vm`上可用的内容:

```js
{
  msg1: [Getter/Setter],
  msg2: [Getter/Setter],
  hasOwnProperty: [Function]
}
```

我们可以同时看到`msg1`和`msg2`!方法和计算属性之类的东西也会显示出来，如果它们被定义的话。在编写测试时，虽然通常建议对`DOM`进行断言(使用`wrapper.html()`之类的东西)，但在某些罕见的情况下，您可能需要访问底层的`Vue`实例。

## 与`getComponent`和`findComponent`一起使用

`getComponent`和`findComponent`返回一个`VueWrapper`——很像从`mount`获取的那个。这意味着你还可以在`getComponent`或`findComponent`的结果上访问所有相同的属性，包括`vm`。

这里有一个简单的例子：

```js
test("asserts correct props are passed", () => {
  const Foo = {
    props: ["msg"],
    template: `<div>{{ msg }}</div>`,
  };

  const Comp = {
    components: { Foo },
    template: `<div><foo msg="hello world" /></div>`,
  };

  const wrapper = mount(Comp);

  expect(wrapper.getComponent(Foo).vm.msg).toBe("hello world");
  expect(wrapper.getComponent(Foo).props()).toEqual({ msg: "hello world" });
});
```

更彻底的测试方法是针对呈现的内容进行断言。这样做意味着您断言传递和渲染的是正确的道具。

:::warning 使用`CSS`选择器时的`WrapperLike`类型
当使用`wrapper.findComponent('.foo')`时，`VTU`将返回`WrapperLike`类型。这是因为功能组件需要`DOMWrapper`，否则需要`VueWrapper`。你可以通过提供正确的组件类型来强制返回一个`VueWrapper`:

```typescript
wrapper.findComponent(".foo"); // returns WrapperLike
wrapper.findComponent<typeof FooComponent>(".foo"); // returns VueWrapper
wrapper.findComponent<DefineComponent>(".foo"); // returns VueWrapper
```

:::

## 结论

- 使用`vm`访问内部`Vue`实例
- `getComponent`和`findComponent`返回一个`Vue`包装器。这些`Vue`实例也可以通过`vm`获得
