# 测试 Vue Router

本文将介绍使用`Vue Router`测试应用程序的两种方法：

1. 使用真正的`Vue`路由器，这更像生产，但在测试更大的应用程序时也可能导致复杂性。
2. 使用模拟路由器，允许对测试环境进行更细粒度的控制。

请注意，`Vue Test Utils`没有提供任何特殊功能来帮助测试依赖`Vue Router`的组件。

## 使用模拟路由

您可以使用模拟路由来避免在单元测试中关心`Vue-Router`的实现细节。

我们可以创建一个只实现我们感兴趣的功能的`mock`版本，而不是使用真正的`Vue Router`实例。我们可以使用`jest.mock`（如果您使用的是`jest`）和`global.components`的组合来实现这一点。

当我们模拟一个依赖关系时，通常是因为我们对测试它的行为不感兴趣。我们不想测试点击`＜router-link＞`导航到正确的页面——当然是这样！不过，我们可能有兴趣确保`<a>`具有正确的`to`属性。

让我们看一个更现实的例子!该组件显示了一个按钮，该按钮将把经过身份验证的用户重定向到编辑帖子页面(基于当前路由参数)。未经身份验证的用户应该被重定向到`/404`路由。

```js
const Component = {
  template: `<button @click="redirect">Click to Edit</button>`,
  props: ["isAuthenticated"],
  methods: {
    redirect() {
      if (this.isAuthenticated) {
        this.$router.push(`/posts/${this.$route.params.id}/edit`);
      } else {
        this.$router.push("/404");
      }
    },
  },
};
```

我们可以使用一个真正的路由器，然后导航到该组件的正确路由，然后在单击按钮后断言呈现了正确的页面。。。然而，对于一个相对简单的测试来说，这是一个很大的设置。在其核心，我们想要编写的测试是“如果经过身份验证，则重定向到 X，否则重定向到 Y”。让我们看看如何通过使用`global.mocks`属性模拟路由来实现这一点：

```js
import { mount } from "@vue/test-utils";

test("allows authenticated user to edit a post", async () => {
  const mockRoute = {
    params: {
      id: 1,
    },
  };
  const mockRouter = {
    push: jest.fn(),
  };

  const wrapper = mount(Component, {
    props: {
      isAuthenticated: true,
    },
    global: {
      mocks: {
        $route: mockRoute,
        $router: mockRouter,
      },
    },
  });

  await wrapper.find("button").trigger("click");

  expect(mockRouter.push).toHaveBeenCalledTimes(1);
  expect(mockRouter.push).toHaveBeenCalledWith("/posts/1/edit");
});

test("redirect an unauthenticated user to 404", async () => {
  const mockRoute = {
    params: {
      id: 1,
    },
  };
  const mockRouter = {
    push: jest.fn(),
  };

  const wrapper = mount(Component, {
    props: {
      isAuthenticated: false,
    },
    global: {
      mocks: {
        $route: mockRoute,
        $router: mockRouter,
      },
    },
  });

  await wrapper.find("button").trigger("click");

  expect(mockRouter.push).toHaveBeenCalledTimes(1);
  expect(mockRouter.push).toHaveBeenCalledWith("/404");
});
```

我们使用`global.mocks`来提供必要的依赖项（`this.$route和this.$router`），为每个测试设置理想状态。

然后，我们可以使用`jest.fn()`来监控有多少次，以及使用了哪些参数$使用调用了`router.push`。最棒的是，我们不必在测试中处理`Vue`路由器的复杂性或注意事项！我们只关心测试应用程序的逻辑。

:::tip 提示
您可能希望以端到端的方式测试整个系统。您可以考虑像 **Cypress** 这样的框架，使用真实的浏览器进行完整的系统测试。
:::

## 使用真实的路由器

现在我们已经看到了如何使用模拟路由器，让我们来看看使用真正的`Vue`路由器。

让我们创建一个使用 Vue 路由器的基本博客应用程序。帖子列在`/posts`路线上：

```js
const App = {
  template: `
    <router-link to="/posts">Go to posts</router-link>
    <router-view />
  `,
};

const Posts = {
  template: `
    <h1>Posts</h1>
    <ul>
      <li v-for="post in posts" :key="post.id">
        {{ post.name }}
      </li>
    </ul>
  `,
  data() {
    return {
      posts: [{ id: 1, name: "Testing Vue Router" }],
    };
  },
};
```

应用程序的根目录显示一个指向`/posts`的`<router-link>`，我们在其中列出了`posts`。

真正的路由器是这样的。请注意，我们导出的路由与路由是分开的，这样我们以后就可以为每个单独的测试实例化一个新的路由器。

```js
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: {
      template: "Welcome to the blogging app",
    },
  },
  {
    path: "/posts",
    component: Posts,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export { routes };

export default router;
```

说明如何使用`Vue Router`测试应用程序的最好方法是让警告指导我们。以下最低限度的测试足以让我们继续：

```js
import { mount } from "@vue/test-utils";

test("routing", () => {
  const wrapper = mount(App);
  expect(wrapper.html()).toContain("Welcome to the blogging app");
});
```

测试失败。它还打印两个警告：

```bash
console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Failed to resolve component: router-link

console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Failed to resolve component: router-view
```

未找到`<router-link>`和`<router-view>`组件。我们需要安装`Vue`路由器！由于`Vue`路由器是一个插件，我们使用`global.plugins`安装选项进行安装：

```js
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router"; // This import should point to your routes file declared above

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

test("routing", () => {
  const wrapper = mount(App, {
    global: {
      plugins: [router],
    },
  });
  expect(wrapper.html()).toContain("Welcome to the blogging app");
});
```

这两个警告现在已经消失了，但现在我们有了另一个警告：

```bash
console.warn node_modules/vue-router/dist/vue-router.cjs.js:225
  [Vue Router warn]: Unexpected error when starting the router: TypeError: Cannot read property '_history' of null
```
