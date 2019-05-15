class Mvvm {
  constructor(options) {
    // 一上来先把可用的东西挂载到实例上（方便原型方法上可使用）
    this.$el = options.el
    this.$data = options.data

    // 如果有要编译的模板就开始编译
    if (this.$el) {
      // 数据劫持，就是把对象的所有属性改成 get 和 set 方法
      new Observer(this.$data)

      this.proxyData(this.$data)

      // 用数据和元素进行编译
      new Compile(this.$el, this)
    }
  }
  proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key]
        },
        set(newVal) {
          data[key] = newVal
        }
      })
    })
  }
}