// 新手引导 --> 更新公告 --> 2.3 上线后提示用户已开启几个互动地块 --> 宝箱弹窗 --> 签到 --> 专属陌客 --> 好友地块打开或者过期弹窗 --> 被赠送房屋和背景弹窗 --> 被赠送营养液弹窗
// --> 除虫补偿弹窗 --> 游戏室导流弹窗 --> 荣誉称号弹窗  --> 任务奖励未领取弹窗
const sortBase = [
  "userGuide",
  "updatePop",
  "initRentPlot",
  "giftPop",
  "signPop",
  "openConsume",
  "receiveGift",
  "friendPlotPop",
  "equipmentGift",
  "nutrientGift",
  "wormReduce",
  "refusGame",
  "honorPop",
  "activityRewardPop"
];
const popSortMap = {};
sortBase.forEach((item, idx) => {
  popSortMap[item] = idx;
});

class PopControl {
  constructor() {
    this.reset(true);
  }
  reset(updatePop) {
    this.popList = [];
    this.runing = false;
    this.currentItem = {};
    this.popKeys = [];
    const interfaces = {
      ajaxCommon: false,
      ajaxGardenInfo: false,
      initPlant: false,
      ajaxGetReceiveGiftList: false
    };
    console.log("popControl reset", updatePop);
    if (updatePop) {
      this.interfaces = {
        ...interfaces,
        ajaxGetPopNotify: false
      };
    } else {
      this.interfaces = interfaces;
    }
  }
  // repeatPushShow 表示重复插入的处理
  push(key, callback, startDelay = 100, endDelay = 100, repeatPushShow = true) {
    // 三个接口都没有 load 完成且当前弹窗没有被插入进来
    if (!this.runing && !this.popKeys.some(d => d === key)) {
      console.log("插入 ==>", key);
      this.popList.push({
        key,
        callback,
        idx: popSortMap[key],
        startDelay,
        endDelay
      });
      this.popKeys.push(key);
    } else if (this.runing && this.popKeys.some(d => d === key) && repeatPushShow) {
      // 在三个接口 load 完成之后，已经添加过的重复添加就直接执行
      console.log(`重复插入${key}, 直接执行`);
      callback();
      // 新手直接进入他人庄园之后回来，点击去种植会重复请求更新公告，导致直接出现了更新公告
    }
  }
  load(key) {
    if (Object.keys(this.interfaces).length === 0) {
      return;
    }
    delete this.interfaces[key];
    console.log("load ==>", key);
    // 移动端 mm.storage.getItem 是异步的，而很多弹窗是在 mm.storage.getItem 回调中添加的，
    // 导致接口已经 load 但是弹窗还没有 push 进来，load 加延迟就是为了解决这个问题
    if (Object.keys(this.interfaces).length === 0) {
      setTimeout(() => {
        console.log("开始展示弹窗");
        this.start();
        this.runing = true;
      }, 500);
    }
  }
  sort() {
    this.popList = this.popList.sort((a, b) => a.idx - b.idx);
    console.log(JSON.parse(JSON.stringify(this.popList)), "this.popList");
  }
  start() {
    this.sort();
    this.next();
  }
  next(key) {
    // 判断当前完成的 key 是不是当前执行的弹窗，避免多次调用导致的问题
    // console.log("next", key, this.currentItem.key);
    if (key === this.currentItem.key) {
      const item = this.popList.shift();
      if (item) {
        console.log("当前执行 ==>", item, this.popList);
        const delay = this.currentItem.endDelay || 0 + item.startDelay;
        setTimeout(() => {
          item.callback();
          this.currentItem = item;
        }, delay);
      }
    }
  }
}

export default new PopControl();
