class Observer {
  constructor(data) {
    this.observe(data)
  }
  observe(data) {
    // console.log(data)
    // 将 data 原有的属性改成 get 和 set 的形式
    if (!data || typeof data !== 'object') {
      return
    }

    // 将数据一一劫持，先获取 data 的 key 和 value
    Object.keys(data).forEach(key => {
      // 劫持
      this.defineReactive(data, key, data[key])
      this.observe(data[key])
    })
  }
  // 定义响应式
  defineReactive(obj, key, value) {
    const that = this
    const dep = new Dep()

    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        Dep.target && dep.addSub(Dep.target)

        return value
      },
      set(newValue) {
        if (newValue !== value) {
          // 这里的 this 不是实例
          that.observe(newValue)
          value = newValue
          dep.notify()
        }
      }
    })
  }
}

class Dep {
  constructor() {
    // 订阅的数组
    this.subs = []
  }
  addSub(watcher) {
    this.subs.push(watcher)
  }
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}