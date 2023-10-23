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
