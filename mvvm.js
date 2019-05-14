class Mvvm {
  constructor(options) {
    // 一上来先把可用的东西挂载到实例上（方便原型方法上可使用）
    this.$el = options.el
    this.$data = options.data

    // 如果有要编译的模板就开始编译
    if (this.$el) {
      // 用数据和元素进行编译
      new Compile(this.$el, this)
    }
  }
}