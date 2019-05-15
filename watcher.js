// 观察者的目的，就是给需要变化的那个元素注册为观察者，当数据变化后执行对应的方法
class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm
    this.expr = expr
    this.cb = cb

    // 先获取旧的值存起来，update 方法时使用
    this.value = this.get()
  }
  getVal(vm, expr) {
    expr = expr.split('.') // [message, value]

    return expr.reduce((prev, next) => {
      return prev[next]
    }, vm.$data)
  }
  get() {
    Dep.target = this
    const value =  this.getVal(this.vm, this.expr)
    Dep.target = null

    return value
  }
  // 对外暴露的方法
  update() {
    const newVal = this.getVal(this.vm, this.expr)
    const oldVal = this.value

    if (newVal !== oldVal) {
      this.cb(newVal)
    }
  }
} 