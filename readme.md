### 弹窗控制
这是工作中抽象的一个弹窗控制组件，用来控制多个自动打开弹窗的显示顺序。
#### 需求和现状
用户进入应用时会展示一系列的弹窗，这些弹窗的展示内容和展示与否取决于进入应用时的一系列请求结果。由于接口请求返回数据的时间不确定，所以依赖不同接口的弹窗之间的展示顺序也不确定，且多个弹窗会出现叠加展示的问题，用户体验很不好。

产品需求就是希望弹窗的展示顺序可控，并且同时只展示一个弹窗。
#### 解决方案
解决思路是这样：

所有弹窗的显示代码不在请求完成之后立即执行，而是作为回调函数统一处理 ==> 确定所有弹窗依赖的接口已经请求完成 ==> 按照规定顺序依次执行弹窗展示的回调
#### 使用
```javascript
import PopControl from "popControl"

const popKeys = ["pop1", "pop2", "pop3"];
const interfaces = ["ajaxSignin", "ajaxUseInfo"];
const popControl = new PopControl(popKeys, interfaces);

request("/ajaxSignin").then(() => {
  // 把依赖这个接口的弹窗展示函数 push 进弹窗队列
  popControl.push("pop1", () => {
    // 展示 pop1 的操作
    this.showPop1 = true;
  })
  popControl.push("pop2", () => {
    // 展示 pop2 的操作
    this.showPop2 = true;
  })
  popControl.load("ajaxSignin);
})

request("/ajaxUseInfo").then(() => {
  // 把依赖这个接口的弹窗展示函数 push 进弹窗队列
  popControl.push("pop3", () => {
    // 展示 pop3 的操作
    this.showPop3 = true;
  })
  popControl.load("ajaxUseInfo);
})

function pop1Close() {
  this.showPop1 = false;
  // 标记 pop1 已经展示完成，可以展示下一个弹窗
  popControl.next("pop1");
}

function pop2Close() {
  this.showPop2 = false;
  // 标记 pop2 已经展示完成，可以展示下一个弹窗
  popControl.next("pop2");
}

function pop3Close() {
  this.showPop3 = false;
  // 标记 pop3 已经展示完成，可以展示下一个弹窗
  popControl.next("pop3");
}
```
如上面示例代码
- popControl.load(key)，用来标记该接口已经请求完成
- popControl.push(key, callback, startDelay = 100, endDelay = 100, repeatPushShow = true)，用来把弹窗插入到弹窗队列中
- popControl.next(key)，用来标记该弹窗已展示完成
- popControl.reset()，用来重置依赖接口状态和弹窗数据

所有依赖接口请求完成之后，弹窗队列就会按照既定顺序依次展示弹窗。