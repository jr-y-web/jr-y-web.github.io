# FAQ

- 设置日期与计时器与`vitest`
- `Vue` 警告： 设置`Props`失败

## 设置日期与计时器与`vitest`

`Vue`的调度器取决于系统时间。确保在调用`vi.setSystemTime`之后挂载组件，因为`Vue`取决于它的副作用。在调用`vi.setSystemTime`之前安装组件可能会导致反应中断。

看到[vuejs / test-utils # 2074](https://github.com/vuejs/test-utils/issues/2074)。

## `Vue` 警告： 设置`Props`失败

```bash
[Vue warn]: Failed setting prop "prefix" on <component-stub>: value foo is invalid.
TypeError: Cannot set property prefix of #<Element> which has only a getter
```

如果您使用的是与`Element`共享属性名的`shallowMount`或`stub`，则会显示此警告。

与`Element`共享的通用属性名:

- `attributes`
- `children`
- `prefix`

查看 [https://developer.mozilla.org/en-US/docs/Web/API/Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)

**可能的解决方案**

- 使用`mount`而不是`shallowMount`来渲染无存根
- 通过模拟`console.warn`来忽略警告
- 重命名该道具以避免与元素属性冲突
