# 发送 HTTP 请求

在测试 HTTP 请求时，当前测试运行程序已经提供了许多出色的功能。因此，`Vue Test Utils`没有任何独特的工具来做到这一点。

然而，这是一个需要测试的重要特性，并且有一些我们想要强调的陷阱。

在本节中，我们将探讨执行、模拟和断言 HTTP 请求的一些模式。

## 博客文章列表

让我们从一个基本用例开始。下面的`PostList`组件呈现从外部 API 获取的博客文章列表。为了获取这些帖子，该组件提供了一个`button`元素来触发请求:

```vue
<template>
  <button @click="getPosts">Get posts</button>
  <ul>
    <li v-for="post in posts" :key="post.id" data-test="post">
      {{ post.title }}
    </li>
  </ul>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      posts: null,
    };
  },
  methods: {
    async getPosts() {
      this.posts = await axios.get("/api/posts");
    },
  },
};
</script>
```

要正确地测试这个组件，我们需要做几件事。

我们的第一个目标是在不实际访问 API 的情况下测试该组件。这将造成一个脆弱且可能缓慢的测试。

其次，我们需要断言组件使用适当的参数进行了正确的调用。我们不会从 API 获得结果，但我们仍然需要确保我们请求了正确的资源。

此外，我们需要确保 DOM 已相应地更新并显示数据。我们通过使用`@vue/test-utils`中的`flushPromises()`函数来实现这一点。

```js
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import PostList from "./PostList.vue";

const mockPostList = [
  { id: 1, title: "title1" },
  { id: 2, title: "title2" },
];

// Following lines tell Jest to mock any call to `axios.get`
// and to return `mockPostList` instead
jest.spyOn(axios, "get").mockResolvedValue(mockPostList);

test("loads posts on button click", async () => {
  const wrapper = mount(PostList);

  await wrapper.get("button").trigger("click");

  // Let's assert that we've called axios.get the right amount of times and
  // with the right parameters.
  expect(axios.get).toHaveBeenCalledTimes(1);
  expect(axios.get).toHaveBeenCalledWith("/api/posts");

  // Wait until the DOM updates.
  await flushPromises();

  // Finally, we make sure we've rendered the content from the API.
  const posts = wrapper.findAll('[data-test="post"]');

  expect(posts).toHaveLength(2);
  expect(posts[0].text()).toContain("title1");
  expect(posts[1].text()).toContain("title2");
});
```

注意，我们向变量`mockPostList`添加了前缀`mock`。如果没有，我们将得到错误:“不允许`jest.mock()`的模块工厂引用任何超出作用域的变量。”这是特定于`jest`的，您可以在他们的文档中阅读有关此行为的更多信息。

还要注意我们是如何等待`flushPromises`，然后与组件交互的。这样做是为了确保在断言运行之前已经更新了`DOM`。

:::tip jest.mock()的替代品
在`Jest`中设置`mock`有几种方法。上面的例子中使用的是最简单的。对于更强大的替代方案，您可能想要查看`axios-mock-adapter`或`msw`等。
:::

### 断言加载状态

现在，这个`PostList`组件非常有用，但它缺少一些其他很棒的功能。让我们扩展它，使其在加载我们的帖子时显示一条奇特的消息！

此外，让我们在加载时也禁用`＜button＞`元素。我们不希望用户在获取时不断发送请求！

```vue {2,4}
<template>
  <button :disabled="loading" @click="getPosts">Get posts</button>

  <p v-if="loading" role="alert">Loading your posts…</p>
  <ul v-else>
    <li v-for="post in posts" :key="post.id" data-test="post">
      {{ post.title }}
    </li>
  </ul>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      posts: null,
      loading: null,
    };
  },
  methods: {
    async getPosts() {
      this.loading = true;

      this.posts = await axios.get("/api/posts");

      this.loading = null;
    },
  },
};
</script>
```

让我们编写一个测试来断言所有与加载相关的元素都按时呈现。

```js
test("displays loading state on button click", async () => {
  const wrapper = mount(PostList);

  // Notice that we run the following assertions before clicking on the button
  // Here, the component should be in a "not loading" state.
  expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  expect(wrapper.get("button").attributes()).not.toHaveProperty("disabled");

  // Now let's trigger it as usual.
  await wrapper.get("button").trigger("click");

  // We assert for "Loading state" before flushing all promises.
  expect(wrapper.find('[role="alert"]').exists()).toBe(true);
  expect(wrapper.get("button").attributes()).toHaveProperty("disabled");

  // As we did before, wait until the DOM updates.
  await flushPromises();

  // After that, we're back at a "not loading" state.
  expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  expect(wrapper.get("button").attributes()).not.toHaveProperty("disabled");
});
```

## 来自 Vuex 的 HTTP 请求

更复杂的应用程序的典型场景是触发执行 HTTP 请求的`Vuex`操作。

这与上面概述的例子没有什么不同。我们可能希望按原样加载存储并模拟`axios`等服务。通过这种方式，我们模拟了系统的边界，从而在测试中获得了更高程度的信心。

您可以查看测试`Vuex`文档，了解使用`Vue`测试工具测试`Vuex`的更多信息。

## 结论

- `Vue Test Utils`不需要特殊的工具来测试 HTTP 请求。唯一需要考虑的是，我们正在测试异步行为。
- 测试不能依赖于外部服务。使用`mock`工具，比如`jest.mock`避免它。
- `flushPromises()`是确保`DOM`在异步操作后更新的有用工具。
- 通过与组件交互直接触发 HTTP 请求使您的测试更具弹性。
