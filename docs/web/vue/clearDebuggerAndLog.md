# Vue 项目中如何在打包时清除 console 和 debugger

## Vue-cli

与 vue-cli2.0 使用了`uglifyjs-webpack-plugin` 或 `babel-plugin-transform-remove-console` 插件进行优化配置不同，vue-cli3.0 在打包过程中就使用了`terser-webpack-plugin`插件进行优化。

## vue-cli2.0

1. 安装 `babel-plugin-transform-remove-console` 我们在开发过程中，肯定会用到 console 打印信息。但是呢，我们上线就要把 console 这些打印的信息给去掉吧，那时我们项目那么多打印，难道要一个个去掉吗，显然是不可能的；以下是解决方法

```js
npm install babel-plugin-transform-remove-console
```

2. 修改 `babel.config.js`（如果没有自己创建）

```js
let plugins = [];
if (process.env.NODE_ENV === "production") {
  // todo  if判断是否打包,打包环境下控制台去掉console.log,也可去掉if判断，整个项目不会出现console.log(不建议)
  plugins.push("transform-remove-console");
}
module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  plugins: plugins,
};
```

## vue-cli 3.0

在 `vue.config.js` 中的 `configureWebpack` 选项提供一个对象会被 webpack-merge 合并入最终的 webpack 配置，`vue.config.js` 配置如下：

```js
configureWebpack: (config) => {
  if (process.env.NODE_ENV === "production") {
    config.optimization.minimizer[0].options.terserOptions.compress.warnings = false;
    config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
    config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true;
    config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs =
      ["console.log"];
  }
};
```

::: warning 注意
terser-webpack-plugin 是@vue/cli-service 的依赖包之一，所以不需要再次安装；
:::

## vite

在 vite 中已经内置了移除 console 的设置了，只需要配置一下就行了

```js
//vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        /*
         * command 用来判断环境
         */
        compress: {
          //warnings: false,
          drop_console: command !== "serve",
          drop_debugger: command !== "serve",
          //pure_funcs:['console.log'] // 移除console
        },
      },
    },
  },
});
```
