# Promise 全解

为什么会有这一篇文章？因为在一次面试中，我被面试官问到词穷了，对方来了一句：“这不是没做的问题，是会就能解出，加油吧”，我很沮丧，在历经了 N 个重点项目、试过各种灵巧解法的我居然连 Promise 都没有搞明白，为此贯彻哪里跌倒就从哪里爬起来，特意学习以及记录 Promise，防止下一次还在同一地方跌倒。

## 前置知识

`event loop`(事件循环)遵循下面规则：

1. 一开始整个脚本（逻辑）会作为一个宏任务执行一次。
2. 执行过程中如果遇到同步代码则马上执行，宏任务插入宏任务队列中，微任务插入微任务队列中。
3. 当宏任务执行完毕后，检测微任务队列，有则依次执行。
4. 执行浏览器 UI 线程的渲染工作。
5. 检查是否有 Web Worker 任务，有则执行
6. 执行完本轮的宏任务，回到 2，依此循环，直到宏任务和微任务队列都为空

微任务包括： `MutationObserver`、`Promise.then()或reject()`、`Promise为基础开发的其它技术，比如fetch API`、`V8的垃圾回收过程`、`Node独有的process.nextTick`。

宏任务包括：`script` 、`setTimeout`、`setInterval` 、`setImmediate` 、`I/O` 、`UI rendering`。

## 基础 （热身）

### 第一题

```ts
const promise1 = new Promise((resolve, reject) => {
  console.log("1");
});

console.log(2, promise1);
```

遵循从上至下阅读模式，因为`new Promise`，先执行它的构造函数的代码，既先执行`console.log("1")`,因为后续没有`resolve`以及`reject`则不存在微任务,它的状态是`pending`，跳出后执行后续的同步代码`console.log(2, promise1)`。

所以它的结果为

```ts
1
2 Promise{<pending>}
```

### 第二题

```ts
const promise = new Promise((resolve, reject) => {
  console.log(1);
  resolve("success");
  console.log(2);
});

promise.then(() => {
  console.log(3);
});

console.log(4);
```

一样遵循上至下，这里因为`new Promise`先执行它的构造函数，遇到`console.log(1)`执行，然后遇到`resolve()`则会把当前 Promise 的状态更改为`resolved`，继续执行同步代码中的`console.log(2)`完毕后跳出，遇到`Promise.then`微任务，进入到微任务队列中，先执行后续的`console.log(4)`，当整个脚本（也就是宏任务）完结后，依次执行队列中的微任务，所以这个时候执行了` console.log(3)`，因此最终的结果为：

```ts
1 2 4 3
```

### 第三题

```ts
const promise = new Promise((resolve, reject) => {
  console.log(1);
  console.log(2);
});

promise.then(() => {
  console.log(3);
});

console.log(4);
```

还是老样子，因为`new Promise`需要执行构造里面的东西，所以输出`1`、`2`,执行完毕后，遇到`Promise.then`，但是因为 promise 并没有`resolve`，所以这跳我们可以无视，不过从程序逻辑上来说，他会进入微任务队列，走下去遇到同步代码`console.log(4);`马上执行，任何到了微任务梯队，因为没有`resolve`，所以`then`并不执行，所以最终结果为：

```ts
1 2 4
```

### 第四题

```ts
const promise1 = new Promise((resolve, reject) => {
  console.log("promise1");
  resolve("resolve1");
});

const promise2 = promise1.then((res) => {
  console.log(res);
});

console.log("1", promise1);
console.log("2", promise2);
```

老方法从上至下，先遇到`new Promise`就先执行内部的构造函数`console.log("promise1")`,紧接着是`resolve()`所以状态就会变成`resolved`,下面遇到`then`，只要是`Promise.then`都是微任务，所以应该进入到微任务队列中，下面马上执行同步代码`console.log("1", promise1);`因为已经把 promise1 的状态改为了`resolved`，所以打印自然就是`Promise {<resolved>: 'resolve1'}`,下一个同步代码`console.log("2", promise2);`,但是因为 promise2 是一个微任务，它还在队列中未执行，所以它的状态是`pending`,宏任务执行执行完毕，执行微任务，因为这个`Promise.then`状态已经是`resolved`，所以执行它输出值 resolve1。因为结果为：

```ts
promise1
'1' Promise {<resolved>: 'resolve1'}
'2' Promise {<pending>}
resolve1
```

### 第五题

```ts
const fn = () =>
  new Promise((resolve, reject) => {
    console.log(1);
    resolve("success");
  });

fn().then((res) => {
  console.log(res);
});

console.log("start");
```

这里具有很强烈的陷阱味道，`start`是第一个输出吗？答案是否定的，因为后续的`fn().then()`实际上已经是调用了一次`fn`，为此这里应该需要先执行一次 fn 的构造函数（因为它返回了一次`Promise`），然后顺着下方同步的`console.log("start")`,然后再执行微任务队列中的`then`输出值 success,因此最终结果为：

```ts
1;
start;
success;
```

### 第六题

```ts
const fn = () =>
  new Promise((resolve, reject) => {
    console.log(1);
    resolve("success");
  });
console.log("start");
fn().then((res) => {
  console.log(res);
});
```

无非就是把第五题的 log 提前了，那么这个时候自然是先执行同步的`console.log("start");`，然后构造函数的 log 输出 1，最后就是微任务的`then`，自然结果就是：

```bash
start
1
success
```

## 上压力，结合 setTimeout

### 第七题

```ts
console.log("start");
setTimeout(() => {
  console.log("time");
});
Promise.resolve().then(() => {
  console.log("resolve");
});
console.log("end");
```

还是一样，首先我们整个事件应该是一个宏任务，从上至下，先输出了第一个 log 的 start，遇到`setTimeout`宏任务就插入到宏任务队列中，遇到`Promise.then`微任务则进入到微任务梯队中，输出同步代码 log 的 end，然后一开始的宏任务结束，开始检查第一轮的微任务，发生有`Primse.then`且状态已经是`resolved`所以输出 log 的 resolve，任务结束完毕，进入下一轮的宏任务，也就是`setTimeout`，输出对应的 log 的 time，因此最终结果就是:

```bash
start
end
resolve
time
```

### 第八题

```ts
const promise = new Promise((resolve, reject) => {
  console.log(1);
  setTimeout(() => {
    console.log("timerStart");
    resolve("success");
    console.log("timerEnd");
  }, 0);
  console.log(2);
});
promise.then((res) => {
  console.log(res);
});
console.log(4);
```

从上至下，先遇到 new Promise，执行该构造函数中的代码 1，然后碰到了定时器，将这个定时器中的函数放到下一个宏任务的延迟队列等待执行。，执行同步代码 2，跳出 promise 函数，遇到 promise.then，但其状态还是为 pending，这里理解为先不执行。执行同步代码 4，一轮循环过后，进入第二次宏任务，发现延迟队列中有 setTimeout 定时器，执行它，首先执行 timerStart，然后遇到了 resolve，promise 的状态改为 resolved 且保存结果并将之前的 promise.then 推入微任务队列继续执行同步代码 timerEnd，宏任务全部执行完毕，查找微任务队列，发现 promise.then 这个微任务，执行它。因此最终结果就是：

```bash
1
2
4
"timerStart"
"timerEnd"
"success"
```

### 第九题

```ts
setTimeout(() => {
  console.log("timer1");
  setTimeout(() => {
    console.log("timer3");
  }, 0);
}, 0);
setTimeout(() => {
  console.log("timer2");
}, 0);
console.log("start");
```

首先遇到`setTimeout`都是宏任务插入到宏任务队列中，先执行后续的同步代码 log 输出 start，检查没有微任务，进入下一轮宏任务，输出第一个 setTimeout 的 log 的 timer1，发现还有`setTimeout`将其插入到下一轮宏任务中，紧接着执行这一轮宏任务的另一个 setTimeout 输出其 log 的 timer2，然后检查这一轮还是没有微任务，就进入下一轮宏任务，最后输出`timer3`。

### 第十题

```ts
setTimeout(() => {
  console.log("timer1");
  Promise.resolve().then(() => {
    console.log("promise");
  });
}, 0);
setTimeout(() => {
  console.log("timer2");
}, 0);
console.log("start");
```

和第九题类似的结构，这里要明确一下上面没有重点强调的一个事情，**_任何某个宏任务结束后，都会去检查微任务队列_**，所以上述当第二轮宏任务也就是执行第一个`setTimeout`的 log 后遇到微任务`Promise.resolve().then`则马上插入到微任务梯队，这个时候这个宏任务结束了，会马上检查微任务梯队，所以`Promise.resolve().then`就会被执行，才会到第二个`setTimeout`。

### 第十一题

```ts
Promise.resolve().then(() => {
  console.log("promise1");
  const timer2 = setTimeout(() => {
    console.log("timer2");
  }, 0);
});
const timer1 = setTimeout(() => {
  console.log("timer1");
  Promise.resolve().then(() => {
    console.log("promise2");
  });
}, 0);
console.log("start");
```

这里会稍微复杂很多，一步步来解析：

1. 首先遇到`Promise.resolve().then`，插入到微任务队列中，称呼为微 1。
2. timer1 是宏任务，则插入队列变成宏 2（整个脚本是宏 1）
3. 执行同步代码，输出 start
4. 后检查微任务梯队，既微 1，输出 log 的 promise1,又遇到一个 setTimeout 则插入队列微宏 3
5. 微任务执行完毕，执行宏 2，输出 timer1，遇到 Promise.resolve().then 插入到微任务列队中，也是微 2
6. 这条宏任务结束后发现有微任务且状态已经是 resolved，输出 promise2
7. 完成微任务，最后处理宏 3，输出 timer2

因此结果为：

```bash
 start
 promise1
 timer1
 promise2
 timer2
```

### 第十二题

```ts
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("success");
  }, 1000);
});
const promise2 = promise1.then(() => {
  throw new Error("error!!!");
});
console.log("promise1", promise1);
console.log("promise2", promise2);
setTimeout(() => {
  console.log("promise1", promise1);
  console.log("promise2", promise2);
}, 2000);
```

- 首先遇到`new Promise`就执行它的构造方法，遇到一个`setTimeout`，就进入宏任务队列，标记为宏 2
- 接下来遇到`then`微任务，插入到本次微任务梯队中
- 接下来是两个同步代码 log，因为 promise1 以及 promise2 的 promoise 并没有执行，固然状态都是 penging，输出
- 又遇到一个宏任务，标记为宏 3
- 这轮宏任务结束，找到当前的微任务`Promise.then`，但是因为状态不是`resolved`，所以暂时不执行
- 走宏 2，宏 2resolve，所以把 promise1 的状态改为`resolved`，同时把 then 插入到这次的微任务中，并且执行，结果抛异常了，所以报错
- 然后运行宏 3 的两个同步 log，因为 promise1 有了状态所以输出，promise2 因为 promis 已经执行了只是报错而已，所以输出`reject`，所以结果为：

```bash
promise1 Promise{<pending>}
promise2 Promise{<pending>}
test5.html:102 Uncaught (in promise) Error: error!!! at test.html:102
promise1 Promise{<resolve>: 'success'}
promise2 Promise{<reject>: Error: error!!!}
```

### 第十三题

```ts
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("success");
    console.log("timer1");
  }, 1000);
  console.log("promise1里的内容");
});
const promise2 = promise1.then(() => {
  throw new Error("error!!!");
});
console.log("promise1", promise1);
console.log("promise2", promise2);
setTimeout(() => {
  console.log("timer2");
  console.log("promise1", promise1);
  console.log("promise2", promise2);
}, 2000);
```

这里和十二题类似，需要注意的是，只要记得在触发`resolve`后，需要把`then`的微任务插入到本轮的微任务队列中即可，所以最终结果为：

```bash
'promise1里的内容'
'promise1' Promise{<pending>}
'promise2' Promise{<pending>}
'timer1'
test5.html:102 Uncaught (in promise) Error: error!!! at test.html:102
'timer2'
'promise1' Promise{<resolved>: "success"}
'promise2' Promise{<rejected>: Error: error!!
```

## 继续上强度，结合 Promise 的 then、chtch、finally

在经历这些的时候，需要知晓下面的知识点：

1. `Promise`的状态一旦进行了更改，就不会再次改变
2. `then()`和`catch()`都会返回一个新的`Promise`。
3. `catch`不管被连接到哪里，都能获取上层都错误。
4. 在`Promise`中返回任意一个不是`Promise`的值都会被包裹成`Promise`对象，比如直接 return 1。
5. `Promise` 的 `.then` 或者 `.catch` 可以被调用多次, 当如果 Promise 内部的状态一经改变，并且有了一个值，那么后续每次调用`.then`或者`.catch`的时候都会直接拿到该值。
6. `then`或者`catch`中`return`一个`error`并不会报错，反正它无法被`catch` 捕获。
7. `then`或`catch`不能返回`Promise`本身，否则会陷入死循环
8. `then`或`catch`的参数期望是函数，传入非函数则会发生值穿透
9. `.then`方法是能接收两个参数的，第一个是处理成功的函数，第二个是处理失败的函数，再某些时候你可以认为`catch`是.`then`第二个参数的简便写法。
10. `.finally`方法也是返回一个`Promise`，他在`Promise`结束的时候，无论结果为`resolved`还是`rejected`，都会执行里面的回调函数。

### 第十四题

```ts
const promise = new Promise((resolve, reject) => {
  resolve("success1");
  reject("error");
  resolve("success2");
});
promise
  .then((res) => {
    console.log("then: ", res);
  })
  .catch((err) => {
    console.log("catch: ", err);
  });
```

遵循之前的规则，`new Promise`需要执行内部的构造函数，所以会执行`resolve`,又因为`Promise`的状态一旦进行了更改，就不会再次改变，所以后续的`reject`、下一个`resolve`都不会再执行，因此最终结果为：

```bash
then success1
```

### 第十五题

```ts
const promise = new Promise((resolve, reject) => {
  reject("error");
  resolve("success2");
});
promise
  .then((res) => {
    console.log("then: ", res);
  })
  .then((res) => {
    console.log("then: ", res);
  })
  .catch((err) => {
    console.log("catch: ", err);
  })
  .then((res) => {
    console.log("then: ", res);
  });
```

根据`catch`不管被连接到哪里，都能获取上层都错误，所以最终的结果为：

```bash
"catch: " "error"
"then: " undefined
```

### 第十五题

```ts
Promise.resolve(1)
  .then((res) => {
    console.log(res);
    return 2;
  })
  .catch((err) => {
    return 3;
  })
  .then((res) => {
    console.log(res);
  });
```

从上至下，这里一开始`Promise`的`resolve`为 1，获取会被`then`捕获到，这里因为`then`以及`catch`都会返回一个新的`Promise`，所以第二个`then`这里的 res 就是来自第一个 then 的返回，来就是输出 2。因此最终结果为：

```bash
1
2
```

### 第十六题

```ts
Promise.reject(1)
  .then((res) => {
    console.log(res);
    return 2;
  })
  .catch((err) => {
    console.log(err);
    return 3;
  })
  .then((res) => {
    console.log(res);
  });
```

和第十五题类似，不过这里走`reject`，固然一开始输出的 1，然后因为`catch`和`then`一样会生成一个新的`Promise`，因此第二个`then`就会接受来自`catch`的返回也就是输出 3，因此最终结果为：

```bash
1
3
```

### 第十七题

```ts
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log("timer");
    resolve("success");
  }, 1000);
});
const start = Date.now();
promise.then((res) => {
  console.log(res, Date.now() - start);
});
promise.then((res) => {
  console.log(res, Date.now() - start);
});
```

结合之前的知识，就很容易判断这一题，因为没有`resolve`，所以两个`then`都将暂时不执行，然后进入宏任务，先执行 log，然后`resolve`后，两个微任务就执行，所以得出的结果就是：

```bash
'timer'
success 1001
success 1002
```

### 第十八题

```ts
Promise.resolve()
  .then(() => {
    return new Error("error!!!");
  })
  .then((res) => {
    console.log("then: ", res);
  })
  .catch((err) => {
    console.log("catch: ", err);
  });
```

根据上述的知识点**在`Promise`中 return 一个报错时，catch 是捕获不到的**。因此它是走`then`的路线，所以最终结果就是：

```bash
"then: " "Error: error!!!"
```

### 十九题

```ts
const promise = Promise.resolve().then(() => {
  return promise;
});
promise.catch(console.err);
```

这里很简单，`Promise`不能返回自身，不然会陷入死循环的。

### 第二十题

```ts
Promise.resolve(1).then(2).then(Promise.resolve(3)).then(console.log);
```

这里只要记住一点：.then 或者 .catch 的参数期望是函数，传入非函数则会发生值穿透。第一个 then 和第二个 then 中传入的都不是函数，一个是数字类型，一个是对象类型，因此发生了穿透，将 resolve(1) 的值直接传到最后一个 then 里。所以最终结构自然是：

```js
1;
```

### 第二十一题

```ts
Promise.reject("err!!!")
  .then(
    (res) => {
      console.log("success", res);
    },
    (err) => {
      console.log("error", err);
    }
  )
  .catch((err) => {
    console.log("catch", err);
  });
```

会打印` console.log("error", err);` 与 `console.log("catch", err);`吗？这里需要明确一点`then`后面的第二个参数，它是处理失败的函数，也就是说`resolve`会进入到成功的函数，`reject`会进入失败的函数，而 catch 这个时候也不能捕获。

很自然的，现在就需要有以下认知：

- 如果 return 一个报错，catch 是没办法捕获到
- 如果 then 有第二个参数，catch 也是没办法捕获

那么如果衍生出下面这样的格式呢？

```ts
Promise.resolve()
  .then(
    function success(res) {
      throw new Error("error!!!");
    },
    function fail1(err) {
      console.log("fail1", err);
    }
  )
  .catch(function fail2(err) {
    console.log("fail2", err);
  });
```

这里`Promise`的状态走的是`resolve`但这个时候 success 报错了，那么这个时候它反而会被`catch`捕获，因为并不是一开始就走了`reject`的。

### 第二十二题

其实你只要记住它三个很重要的知识点就可以了：

- .finally()方法不管 Promise 对象最后的状态如何都会执行
- .finally()方法的回调函数不接受任何的参数，也就是说你在.finally()函数中是没法知道 Promise 最终的状态是 resolved 还是 rejected 的
  它最终返回的默认会是一个原来的 Promise 对象值，不过如果抛出的是一个异常则返回异常的 Promise 对象。

```ts
Promise.resolve("1")
  .then((res) => {
    console.log(res);
  })
  .finally(() => {
    console.log("finally");
  });
Promise.resolve("2")
  .finally(() => {
    console.log("finally2");
    return "我是finally2返回的值";
  })
  .then((res) => {
    console.log("finally2后面的then函数", res);
  });
```

答案是：

```bash
1
finally2
finally
finally2后面的then函数 2
```

为什么 finally2 的打印要在 finally 前面？这里就是涉及到一个链式调用的概念了，后面的内容需要等前一个调用执行完才会执行。所以上述列子中`finally`会先行。

## 渐入佳境，结合 Promise 中的 all 和 race

先讲一下`Promise.all`与`Promise.race`：

- 简单的说`Promise.all`是接受一组异步任务，然后并行去执行异步任务，并且在素有异步操作执行完后才执行回调。
- `.race()`的作用也是接收一组异步任务，然后并行执行异步任务，只保留取第一个执行完成的异步操作的结果，其他的方法仍在执行，不过执行结果会被抛弃。

从一个例子中理解`Promise.all`：

```ts
const runAsync = (x) => {
  return new Promise((r) => {
    setTimeout(() => {
      r(x, console.log(x));
    }, 1000);
  });
};
Promise.all([runAsync(1), runAsync(2), runAsync(3)]).then((res) =>
  console.log(res)
);
```

它回在浏览器中间隔一秒后，控制台会同时打印出 1, 2, 3，还有一个数组[1, 2, 3]，所以你现在能理解这句话的意思了吗：有了 all，你就可以并行执行多个异步操作，并且在一个回调中处理所有的返回数据。

### 第二十三题

```ts
function runAsync(x) {
  const p = new Promise((r) => setTimeout(() => r(x, console.log(x)), 1000));
  return p;
}
function runReject(x) {
  const p = new Promise((res, rej) =>
    setTimeout(() => rej(`Error: ${x}`, console.log(x)), 1000 * x)
  );
  return p;
}
Promise.all([runAsync(1), runReject(4), runAsync(3), runReject(2)])
  .then((res) => console.log(res))
  .catch((err) => console.log(err, "err"));
```

没错，就像我之前说的，.catch 是会捕获最先的那个异常，在这道题目中最先的异常就是 runReject(2)的结果,这里需要额外的注意！

另外，如果一组异步操作中有一个异常都不会进入.then()的第一个回调函数参数中。

注意，为什么不说是不进入.then()中呢 ?️？

哈哈，大家别忘了.then()方法的第二个参数也是可以捕获错误的：

```bash
Promise.all([runAsync(1), runReject(4), runAsync(3), runReject(2)])
  .then(res => console.log(res),
  err => console.log(err))
```

### 第二十四题

race，比赛，赛跑的意思。

所以使用.race()方法，它只会获取最先执行完成的那个结果，其它的异步任务虽然也会继续进行下去，不过 race 已经不管那些任务的结果了。

```ts
function runAsync(x) {
  const p = new Promise((r) => setTimeout(() => r(x, console.log(x)), 1000));
  return p;
}
Promise.race([runAsync(1), runAsync(2), runAsync(3)])
  .then((res) => console.log("result: ", res))
  .catch((err) => console.log(err));
```

答案为:

```bash
1
'result: ' 1
2
3
```

需要核心记住：**获取最先执行完成的那个结果**。

### 第二十五题

```ts
function runAsync(x) {
  const p = new Promise((r) => setTimeout(() => r(x, console.log(x)), 1000));
  return p;
}
function runReject(x) {
  const p = new Promise((res, rej) =>
    setTimeout(() => rej(`Error: ${x}`, console.log(x)), 1000 * x)
  );
  return p;
}
Promise.race([runReject(0), runAsync(1), runAsync(2), runAsync(3)])
  .then((res) => console.log("result: ", res))
  .catch((err) => console.log(err));
```

理解了二十四那么这题就很简单了，因为 0 最先完成执行，然后走了 catch 处，紧接着它的宏任务，然后下方依次对应的宏任务输出：

```bash
0
'Error: 0'
1
2
3
```

总结：

- Promise.all()的作用是接收一组异步任务，然后并行执行异步任务，并且在所有异步操作执行完后才执行回调。
- .race()的作用也是接收一组异步任务，然后并行执行异步任务，只保留取第一个执行完成的异步操作的结果，其他的方法仍在执行，不过执行结果会被抛弃。
- Promise.all().then()结果中数组的顺序和 Promise.all()接收到的数组顺序一致。
  ``

### 实战，加入 async/await

### 第二十六题

```ts
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
async1();
console.log("start");
```

简单的说，就是从上至下，遇到 async1 调用，去执行它的同步代码，然后遇到 await 它阻塞后面的代码先去执行 async2，然后执行完后跳出函数，再输出 start，宏任务结束走被阻塞后的微任务输出 async1 end，因此结果为：

```bash
'async start'
'promise'
'async1 end'
'start'
```

### 第二十七题

```ts
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  setTimeout(() => {
    console.log("timer");
  }, 0);
  console.log("async2");
}
async1();
console.log("start");
```

需要牢记上述的前置知识点，首先 async1 调用，自然而然的触发他的同步方法，紧接着因为 await 阻塞后面代码，先去执行 async2，遇到 setTime 宏任务让他进入到下一轮宏，执行后续的 log 输出 asnyc2，跳出函数，把后续阻塞的代码当成微任务插入到本轮微任务队列中，执行最末尾的 start，宏任务结束输出被阻塞的微任务，然后再把下一轮宏任务队列中的宏任务执行，因此最终的结果就是：

```bash
async1 start
async2
start
async1 end
timer
```

### 第二十八题

```ts
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
  setTimeout(() => {
    console.log("timer1");
  }, 0);
}
async function async2() {
  setTimeout(() => {
    console.log("timer2");
  }, 0);
  console.log("async2");
}
async1();
setTimeout(() => {
  console.log("timer3");
}, 0);
console.log("start");
```

与二十七题类似，万变不离其宗，核心难点只需要标记住对应宏梯队的执行顺序即可（需要看时间，并不是顺序，上述都是 0，所以才是顺序），因此结果为：

```bash
async1 start
async2
start
async1 end
timer2
timer3
timer1
```

### 第二十九题

```ts
async function async1() {
  console.log("async1 start");
  await new Promise((resolve) => {
    console.log("promise1");
  });
  console.log("async1 success");
  return "async1 end";
}
console.log("srcipt start");
async1().then((res) => console.log(res));
console.log("srcipt end");
```

这题有一个极其明显的陷阱，那就是`then`,必须谨记 await 并不会让`then`进入到微任务队列中，相当于这个 Promise 的状态一直都是 penging，如果想要`then`执行，必然只能 resolve,所以结果为：

```bash
'script start'
'async1 start'
'promise1'
'script end'
```

### 第三十题

```ts
async function async1() {
  console.log("async1 start");
  await new Promise((resolve) => {
    console.log("promise1");
    resolve("promise1 resolve");
  }).then((res) => console.log(res));
  console.log("async1 success");
  return "async1 end";
}
console.log("srcipt start");
async1().then((res) => console.log(res));
console.log("srcipt end");
```

现在 Promise 有了返回值了，因此 await 后面的内容将会被执行：

```bash
srcipt start
async1 start
promise1
srcipt end

promise1 resolve
async1 success
async1 end
```

### 第三十一题

```ts
async function async1() {
  console.log("async1 start");
  await new Promise((resolve) => {
    console.log("promise1");
    resolve("promise resolve");
  });
  console.log("async1 success");
  return "async1 end";
}
console.log("srcipt start");
async1().then((res) => {
  console.log(res);
});
new Promise((resolve) => {
  console.log("promise2");
  setTimeout(() => {
    console.log("timer");
  });
});
```

这一题最为关键是在` resolve("promise resolve")` 容易误以为会让`async1().then`执行，这是错误的，谨记一点，async/await 相当于一个 Promise，里面的 Promise 和它并没有关系，这是两个 Promise 了，因此结果为：

```bash
srcipt start
async1 start
promise1
promise2
async1 success
async1 end
timer
```

### 第三十二题

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(function () {
  console.log("setTimeout");
}, 0);

async1();

new Promise(function (resolve) {
  console.log("promise1");
  resolve();
}).then(function () {
  console.log("promise2");
});
console.log("script end");
```

注意顺序即可，结合上面的知识点，基本不难。

```bash
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
```

## 实战混合

### 第三十三题

```ts
async function testSometing() {
  console.log("执行testSometing");
  return "testSometing";
}

async function testAsync() {
  console.log("执行testAsync");
  return Promise.resolve("hello async");
}

async function test() {
  console.log("test start...");
  const v1 = await testSometing();
  console.log(v1);
  const v2 = await testAsync();
  console.log(v2);
  console.log(v1, v2);
}

test();

var promise = new Promise((resolve) => {
  console.log("promise start...");
  resolve("promise");
});
promise.then((val) => console.log(val));

console.log("test end...");
```

难点在于需要谨记 await 返回的相当于已经 then 后的内容，所以上述 v1 以及 v2 都是对应的字符串，因此结果为：

```bash
test start...
执行 testSometing
promise start...
test end...
testSometing
执行 testAsync
promise
hello async
testSometing hello async
```

### 第三十四题

```ts
async function async1() {
  await async2();
  console.log("async1");
  return "async1 success";
}
async function async2() {
  return new Promise((resolve, reject) => {
    console.log("async2");
    reject("error");
  });
}
async1().then((res) => console.log(res));
```

这里 await 接了一个 reject 的 promise，这里只需要谨记一点，在 async 如何出现了报错，将直接中断当前逻辑，所以结果为

```bash
async2
报错
```

### 第三十五题

```ts
async function async1() {
  try {
    await Promise.reject("error!!!");
  } catch (e) {
    console.log(e);
  }
  console.log("async1");
  return Promise.resolve("async1 success");
}
async1().then((res) => console.log(res));
console.log("script start");
```

这一题非常的有意思，这里很多陷阱，首先当 asnyc 调用时，实行了一个 reject，但这里特别注意，await 会阻塞下面的函数，包括这个时候 catch，所以应该这里是跳出来，走外层的同步代码，然后才到 catch 微任务，然后因为再同步代码，紧接着这个返回了一个 Promise 对象，能触发 then 让其进入本轮微任务队列，所以最终的结果就是：

```bash
'script start'
'error!!!'
'async1'
'async1 success'
```

## 高难度

### 第三十六题

```ts
const first = () =>
  new Promise((resolve, reject) => {
    console.log(3);
    let p = new Promise((resolve, reject) => {
      console.log(7);
      setTimeout(() => {
        console.log(5);
        resolve(6);
        console.log(p);
      }, 0);
      resolve(1);
    });
    resolve(2);
    p.then((arg) => {
      console.log(arg);
    });
  });

first().then((arg) => {
  console.log(arg);
});
console.log(4);
```

3 7 4 1 2 5 p1

### 第三十七题

```ts
const async1 = async () => {
  console.log("async1");
  setTimeout(() => {
    console.log("timer1");
  }, 2000);
  await new Promise((resolve) => {
    console.log("promise1");
  });
  console.log("async1 end");
  return "async1 success";
};
console.log("script start");
async1().then((res) => console.log(res));
console.log("script end");
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .catch(4)
  .then((res) => console.log(res));
setTimeout(() => {
  console.log("timer2");
}, 1000);
```

这题难点有两处，第一就是之前需要谨记的，如果 then 中不是函数的情况下，则会发现值穿透，另外如果 await 在处理一个永远不会解决的 Promise（没有返回值），那么后续的代码将不会被执行下去。所以结果为：

```bash
script start
async1
promise1
script end
1
timer2
timer1
```

### 第三十八

```ts
const p1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve("resolve3");
    console.log("timer1");
  }, 0);
  resolve("resovle1");
  resolve("resolve2");
})
  .then((res) => {
    console.log(res);
    setTimeout(() => {
      console.log(p1);
    }, 1000);
  })
  .finally((res) => {
    console.log("finally", res);
  });
```

resovle1
finally undefined
timer1
p undefined
