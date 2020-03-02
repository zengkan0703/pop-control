export default class PopControl {
  /**
   * @param {Array} sortKeys 所有弹窗的 key，按照展示顺序排序
   * @param {Array} interfaces  弹窗依赖的所有接口 key
   */
  constructor(sortKeys, interfaces) {
    this._sortInit(sortKeys);
    this.reset(interfaces);
  }
  /**
   * 排序初始化，生成弹窗顺序映射，方便之后排序
   * @param {Array} sortKeys 所有弹窗的 key，按照展示顺序排序
   */
  _sortInit(sortKeys) {
    const popSortMap = {};
    sortKeys.forEach((item, idx) => {
      popSortMap[item] = idx;
    });
    this.popSortMap = popSortMap; 
  }
  /**
   * 弹窗按照展示顺序排序
   */
  _sort() {
    this.popList = this.popList.sort((a, b) => a.idx - b.idx);
  }
  _start() {
    this._sort();
    this.next();
  }
  /**
   * 重置依赖接口状态和弹窗数据
   * @param {Array} interfaces  弹窗依赖的所有接口 key
   */
  reset(interfaces) {
    this.popList = []; // 所有弹窗的配置和回调
    this.runing = false; // 标记弹窗是否已经开始展示
    this.currentItem = {}; // 当前执行的弹窗
    this.popKeys = [];
    this.interfaces = interfaces.reduce((p, n) => {
      p[n] = false;
      return p;
    }, {});
  }
  /**
   * 用来标记该接口已经请求完成
   * @param {String} key 依赖接口的 key
   */
  load(key) {
    if (Object.keys(this.interfaces).length === 0) {
      return;
    }
    delete this.interfaces[key];
    // 加延迟保证在接口 load 完成之后，所有弹窗都已经 push 进来
    if (Object.keys(this.interfaces).length === 0) {
      setTimeout(() => {
        console.log("开始展示弹窗");
        this._start();
        this.runing = true;
      }, 0);
    }
  }
  /**
   * 插入弹窗的方法
   * @param {String} key 弹窗的 key
   * @param {Function} callback 展示弹窗的处理函数
   * @param {Number} startDelay 弹窗展示前延迟
   * @param {Number} endDelay 弹窗消失后的延迟
   * @param {Boolean} repeatPushShow 对重复插入的弹窗的处理，true 表示直接执行 callback
   */
  push(key, callback, startDelay = 100, endDelay = 100, repeatPushShow = true) {
    // 依赖接口没有 load 完成且当前弹窗没有被插入进来
    if (!this.runing && !this.popKeys.some(d => d === key)) {
      this.popList.push({
        key,
        callback,
        idx: popSortMap[key],
        startDelay,
        endDelay
      });
      this.popKeys.push(key);
    } else if (this.runing && this.popKeys.some(d => d === key) && repeatPushShow) {
      // 依赖接口 load 完成之后，已经添加过的重复添加就直接执行
      console.log(`重复插入${key}, 直接执行`);
      callback();
    }
  }
  /**
   * 标记当前弹窗展示完成，开始展示下一个弹窗
   * @param {String} key 当前展示完成的弹窗
   */
  next(key) {
    // 判断当前完成的 key 是不是当前执行的弹窗，避免多次调用导致的问题
    if (key === this.currentItem.key) {
      const item = this.popList.shift();
      if (item) {
        const delay = this.currentItem.endDelay || 0 + item.startDelay;
        setTimeout(() => {
          item.callback();
          this.currentItem = item;
        }, delay);
      }
    }
  }
};