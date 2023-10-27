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

虽然从警告中还不完全清楚，但这与`Vue Router 4`异步处理路由有关。

`Vue-Router`提供了一个`isReady`功能，告诉我们路由器何时准备就绪。然后我们可以`await`它，以确保最初的导航已经完成。

```js
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router";

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

test("routing", async () => {
  router.push("/");

  // After this line, router is ready
  await router.isReady();

  const wrapper = mount(App, {
    global: {
      plugins: [router],
    },
  });
  expect(wrapper.html()).toContain("Welcome to the blogging app");
});
```

现在测试通过了！这是一项相当艰巨的工作，但现在我们确保应用程序正确地导航到初始路线。

现在，让我们导航到`/posts`，并确保路由按预期工作：

```js
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router";

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

test("routing", async () => {
  router.push("/");
  await router.isReady();

  const wrapper = mount(App, {
    global: {
      plugins: [router],
    },
  });
  expect(wrapper.html()).toContain("Welcome to the blogging app");

  await wrapper.find("a").trigger("click");
  expect(wrapper.html()).toContain("Testing Vue Router");
});
```

再一次，出现有点神秘的错误：

```bash
console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Unhandled error during execution of native event handler
    at <RouterLink to="/posts" >

console.error node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:211
  TypeError: Cannot read property '_history' of null
```

同样，由于 `Vue Router 4` 的新异步特性，我们需要`await`路由完成后再进行任何断言。

然而，在这种情况下，我们没有可以等待的 `hasNavigated` 挂钩。一种选择是使用从 `Vue Test Utils` 导出的 `flushPromises` 函数：

```js
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router";

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

test("routing", async () => {
  router.push("/");
  await router.isReady();

  const wrapper = mount(App, {
    global: {
      plugins: [router],
    },
  });
  expect(wrapper.html()).toContain("Welcome to the blogging app");

  await wrapper.find("a").trigger("click");
  await flushPromises();
  expect(wrapper.html()).toContain("Testing Vue Router");
});
```

它终于过去了。太棒了然而，这一切都是非常手动的——这是为一个微小而琐碎的应用程序准备的。这就是为什么在使用`Vue Test Utils`测试`Vue`组件时，使用模拟路由器是一种常见的方法。如果你喜欢继续使用真正的路由器，请记住，每个测试都应该使用自己的路由器实例，如下所示:

```js
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router";

let router;
beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });
});

test("routing", async () => {
  router.push("/");
  await router.isReady();

  const wrapper = mount(App, {
    global: {
      plugins: [router],
    },
  });
  expect(wrapper.html()).toContain("Welcome to the blogging app");

  await wrapper.find("a").trigger("click");
  await flushPromises();
  expect(wrapper.html()).toContain("Testing Vue Router");
});
```

## 使用具有`Composition API`的模拟路由器

`Vue-router4`允许在具有`Composition API`的`setup`函数内部使用`router`和`route`。

考虑使用`Composition API`重写的相同演示组件。

```js
import { useRouter, useRoute } from 'vue-router'

jest.mock('vue-router', () => ({
  useRoute: jest.fn(),
  useRouter: jest.fn(() => ({
    push: () => {}
  }))
}))

test('allows authenticated user to edit a post', () => {
  useRoute.mockImplementationOnce(() => ({
    params: {
      id: 1
    }
  }))

  const push = jest.fn()
  useRouter.mockImplementationOnce(() => ({
    push
  }))

  const wrapper = mount(Component, {
    props: {
      isAuthenticated: true
    },
    global: {
      stubs: ["router-link", "router-view"], // Stubs for router-link and router-view in case they're rendered in your template
    }
  })

  await wrapper.find('button').trigger('click')

  expect(push).toHaveBeenCalledTimes(1)
  expect(push).toHaveBeenCalledWith('/posts/1/edit')
})

test('redirect an unauthenticated user to 404', () => {
  useRoute.mockImplementationOnce(() => ({
    params: {
      id: 1
    }
  }))

  const push = jest.fn()
  useRouter.mockImplementationOnce(() => ({
    push
  }))

  const wrapper = mount(Component, {
    props: {
      isAuthenticated: false
    }
    global: {
      stubs: ["router-link", "router-view"], // Stubs for router-link and router-view in case they're rendered in your template
    }
  })

  await wrapper.find('button').trigger('click')

  expect(push).toHaveBeenCalledTimes(1)
  expect(push).toHaveBeenCalledWith('/404')
})
```

## 使用具有`Composition API`的真实路由器

使用具有`Composition API`的真实路由与使用具有`Options API`的真实路由器的工作原理相同。请记住，就像`Options API`的情况一样，为每个测试实例化一个新的路由器对象被认为是一种很好的做法，而不是直接从应用程序导入路由器。

```js
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router";

let router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  router.push("/");
  await router.isReady();
});

test("allows authenticated user to edit a post", async () => {
  const wrapper = mount(Component, {
    props: {
      isAuthenticated: true,
    },
    global: {
      plugins: [router],
    },
  });

  const push = jest.spyOn(router, "push");
  await wrapper.find("button").trigger("click");

  expect(push).toHaveBeenCalledTimes(1);
  expect(push).toHaveBeenCalledWith("/posts/1/edit");
});
```

对于那些喜欢非手动方法的人，Posva 创建的库`vue-router-mock`也可以作为替代方案。

## 结论

- 您可以在测试中使用真实的路由器实例。
- 不过，也有一些注意事项：`Vue Router 4`是异步的，我们在编写测试时需要将其考虑在内。
- 对于更复杂的应用程序，可以考虑模拟`router`依赖关系，并专注于测试底层逻辑。
- 尽可能利用测试运行程序的`stubbing/mocking`功能。
- 使用`global.mocks`模拟全局依赖关系，例如`this.$route`路线和`this.$router`。
