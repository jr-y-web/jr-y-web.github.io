# visibilitystate 检测页面是否处于焦点状态

## 前言

在刚入行前端的时候，我就发现多玩网（现已倒闭）的标题随着我离开这个标签页而切换不同的文本，当时奈何技术太垃了和思维固化不知道它如何实现，但一直记得，现在从各种大神博客中又遇到了这个效果，所以特意去留意了如何实现这个功能。
功能也很简单，是调用了`docuent.visibilitychange`方法，现在就可以快速实现一个：

```js
document.addEventListener("visibilitychange", () => {
  // 用户离开了当前页面
  if (document.visibilityState === "hidden") {
    document.title = "页面不可见";
  }
  // 用户打开或回到页面
  if (document.visibilityState === "visible") {
    document.title = "页面可见";
  }
});
```

当然，`document.addEventListener` 如果不清除的话，每次都会额外新增监听器，这个时候应该格外注意，要给予清除，比如在 vue 中：

```vue
<script>
import { onMounted, onBeforeUnmount } from "vue";

export default {
  setup() {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        document.title = "页面不可见";
      }

      if (document.visibilityState === "visible") {
        document.title = "页面可见";
      }
    };

    onMounted(() => {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });

    return {};
  },
};
</script>
```

### visibleState 属性返回文档的可见性。这是一个只读属性，它返回三个属性；

- `visible`：表示文档当前处于激活状态，即当前选项卡处于前台或当前窗口处于屏幕最上层。
- `hidden`：表示文档当前处于非激活状态，即当前选项卡处于后台或当前窗口被最小化或被其他窗口遮盖。
- `prerender`：表示文档处于预渲染状态，即当前页面正在被预先加载并渲染，但尚未成为当前活动页面。

## visibleState 的作用

`visibleState`的作用肯定不是简单用于改变标题这种小儿科的功能上，它的运用场面非常的广，比如：

- **暂停视频播放或动画效果**:这个在视频网站就非常的合适，当我点击某个视频链接后，如果在渲染结束前，我就已经切换到其他标签了，那么就可以暂停的视频播放（我就经常点 B 站点好几个订阅，然后一个个开，一个个点播放，他们并不会一股脑同时播放）。
- **限制页面资源消耗**: 可能你这个页面处于非激活状态时暂停某些操作，以节省资源。
- **保持页面流畅性和响应速度**: 在用户切换选项卡或最小化窗口时暂停某些操作，并在用户再次切换回来时恢复它们，以保持页面流畅性和响应速度。
