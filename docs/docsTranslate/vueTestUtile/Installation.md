# 前言

> 该文档翻译是不准确的翻译，目的是为了让英语差劲的我，也能快速通过该翻译后的文档快速查找对应的知识，以及平常尽可能贴进知识面进行学习。本质上，英语属实是能提高一个程序员技术的上限，所以学好英语才是解决问题的核心，但碍于目前时间关系，短时内还是无法达到那种水平，故此有了这篇翻译。
>
> 官方文档： https://test-utils.vuejs.org/installation/

## 安装

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
