# API 参考

## mount

创建一个`wrapper`，其中包含要测试的挂载和呈现的 Vue 组件。注意，当使用`Vitest`模拟日期/计时器时，它必须在`vi.setSystemTime`之后调用。

**格式**

```ts
interface MountingOptions<Props, Data = {}> {
  attachTo?: HTMLElement | string;
  attrs?: Record<string, unknown>;
  data?: () => {} extends Data
    ? any
    : Data extends object
    ? Partial<Data>
    : any;
  props?: (RawProps & Props) | ({} extends Props ? null : never);
  slots?: { [key: string]: Slot } & { default?: Slot };
  global?: GlobalMountOptions;
  shallow?: boolean;
}

function mount(Component, options?: MountingOptions): VueWrapper;
```
