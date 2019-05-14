class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el)
    this.vm = vm

    // 如果能获取到这个元素，才开始编译
    if (this.el) {
      // 1. 先把真实的 DOM 移入到内存中 fragment（避免直接操作真实 DOM）
      const fragment = this.node2fragment(this.el)

      // 2. 编译：提取想要的元素节点 v-model 和文本节点 {{ }}
      this.compile(fragment)

      // 3. 把编译好的 fragment 塞回到页面去
      this.el.appendChild(fragment)
    }
  }

  /****************** 辅助方法 *******************/
  isElementNode(node) {
    return node.nodeType === 1
  }
  isTextNode(node) {
    return node.nodeType === 3
  }
  // 是不是指令 例如 v-model
  isDirective(name) {
    return name.includes('v-')
  }

  /****************** 核心方法 *******************/
  // 将 el 中的全部内容放到内存中
  node2fragment(el) {
    const fragment = document.createDocumentFragment() // 文档碎片
    let firstChild

    while (firstChild = el.firstChild) {
      fragment.appendChild(firstChild)
    }

    return fragment // 内存中的节点
  }
  compile(fragment) {
    // 需要递归
    const childNodes = fragment.childNodes
    
    Array.from(childNodes).forEach(node => {
      if (this.isElementNode(node)) {
        // 这里需要编译元素
        this.compileElement(node)

        // 还需要继续深入编译
        this.compile(node)        
      } else if (this.isTextNode(node)) {
        // 这里需要编译文本节点
        this.compileText(node)
      }
    })
  }
  compileElement(node) {
    // 带 v-model
    const attrs = node.attributes // 取出当前节点的属性

    Array.from(attrs).forEach(attr => {
      const attrName = attr.name

      if (this.isDirective(attrName)) {
        // 获取到对应的值
        const expr = attr.value
        const [, type] = attrName.split('-')

        compileUtil[type](node, this.vm, expr)
      }
    })
  }
  compileText(node) {
    // 带 {{ }}
    const expr = node.textContent
    const reg = /\{\{([^}]+)\}\}/g // {{ a }} {{ b }} {{ c }}

    if (reg.test(expr)) {
      compileUtil['text'](node, this.vm, expr)
    }
  }
}

compileUtil = {
  // 表达式在实例上的对应数据 message.value => 'hello world.'
  getVal(vm, expr) {
    expr = expr.split('.') // [message, value]

    return expr.reduce((prev, next) => {
      return prev[next]
    }, vm.$data)
  },
  getTextVal(vm, expr) {
    return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
      return this.getVal(vm, arguments[1].trim())
    })
  },
  // 文本处理
  text(node, vm, expr) {
    const updateFn = this.updater['textUpdater']
    const value = this.getTextVal(vm, expr)

    updateFn && updateFn(node, value)
  },

  // 输入框处理
  model(node, vm, expr) {
    const updateFn = this.updater['modelUpdater']
    
    // message.value => [message, value] => vm.$data.message.a
    updateFn && updateFn(node, this.getVal(vm, expr))
  },
  updater: {
    // 文本更新
    textUpdater(node, value) {
      node.textContent = value
    },

    // 输入框更新
    modelUpdater(node, value) {
      node.value = value
    }
  }
}