# 安装

```bash
npm install --save-dev @vue/test-utils

# or
yarn add --dev @vue/test-utils

```

## 用法

`Vue Test Utils`与框架无关，您可以将其用于任何您喜欢的测试运行程序。最简单的尝试方法是使用`Jest`，一个流行的测试运行程序。

要用`Jest`加载`.vue`文件，您需要`vue-Jest`。`vue-jest v5`是支持`vue 3`的版本。它仍然在 alpha 中，很像`Vue.js 3`生态系统的其他部分，所以如果你发现一个 bug，请在这里报告，并指定你使用的是 Vue jest v5。

您可以使用安装 `vue-jest@next`，然后，您需要使用 `Jest` 的 `transform` 选项对其进行配置。

如果你不想自己配置它，你可以在这里设置一个最小的存储库。

继续阅读以了解有关 `Vue Test Utils` 的更多信息。
