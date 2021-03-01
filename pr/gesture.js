import {AsyncParallelHook} from 'tapable'
//setHooks(new一个钩子) => tap || tapPromise(外部设置钩子) => .call || .promise(内部调用钩子)
import classie from '../dom/classie.js'

class LoadMore {
  constructor(el, options = {}) {
    if (typeof el === 'string')
      this.el = document.querySelector(el)
    else
      this.el = el
    if (typeof options === 'object') {
      this.options = Object.assign({
        loadingDistance: 50, //加载中的距离
        prepareLoadDistance: 70, //触发更新的距离
        maxDistance: 130, //最大拉动距离
        reloadTop: {
          text: '<span>释放更新</span>',
          hintText: '<span>下拉刷新</span>',
          loadText: '<span>正在更新</span>',
        },
        reloadBot: {
          text: '<span>释放更新</span>',
          hintText: '<span>上拉加载更多</span>',
          loadText: '<span>正在更新</span>',
        },
      }, options)
    }
    this.hooks = {
      loadingTop: new AsyncParallelHook(),
      loadingBot: new AsyncParallelHook(['page']),
    }

    this.initDom()

    this.move = 0
    this.start_point = {}
    this.end_point = {}
    this.loadTop = false
    this.loadBot = false
    this.statusEnum = {
      prepareLoadTop: 'prepareLoadTop',
      prepareLoadBot: 'prepareLoadBot',
      isLoadingTop: 'isLoadingTop',
      isLoadingBot: 'isLoadingBot',
    }
    this.status = ''
  }

  initDom() {
    let el_top = document.createElement('div')
    let el_bot = document.createElement('div')
    el_top.className = 'reload-top'
    el_bot.className = 'reload-bot'
    el_top.innerHTML = this.options.reloadTop.hintText
    el_bot.innerHTML = this.options.reloadBot.hintText
    this.el.insertBefore(el_top, this.el.childNodes[0])
    this.el.appendChild(el_bot)
    this.el_top = el_top
    this.el_bot = el_bot
  }

  loadingTop() {
    this.hooks.loadingTop.promise().then(() => {
      console.log('已刷新!')
      this.el.style.transform = `translate3d(0px, 0px, 0px)`
      this.el_top.innerHTML = this.options.reloadTop.hintText
      this.status = ''
    })
  }

  loadingBot() {
    this.hooks.loadingBot.promise(...arguments).then(() => {
      console.log('分页数据拉取完毕!')
      this.el.style.transform = `translate3d(0px, 0px, 0px)`
      this.el_bot.innerHTML = this.options.reloadTop.hintText
      this.status = ''
    })
  }

  initReload() {
    this.el.addEventListener('touchstart', e => {
      classie.remove(this.el, 'is-dropped')
      let t = e.currentTarget
      let p = t.parentNode.parentNode
      this.loadTop = p.scrollTop === 0
      this.loadBot = p.clientHeight + p.scrollTop === p.scrollHeight
      this.start_point = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        s: e.timeStamp,
      }
      // console.log(Object.getPrototypeOf(t));
      // console.log(t.getBoundingClientRect());
      // console.log({
      //     clientHeight: p.clientHeight,
      //     scrollHeight: p.scrollHeight,
      //     offsetHeight: p.offsetHeight,
      //     offsetTop: p.offsetTop,
      //     scrollTop: p.scrollTop,
      // });
      // console.log({
      //     clientHeight: t.clientHeight,
      //     scrollHeight: t.scrollHeight,
      //     offsetHeight: t.offsetHeight,
      //     offsetTop: t.offsetTop,
      //     scrollTop: t.scrollTop,
      // });
    })
    this.el.addEventListener('touchmove', e => {
      let t = e.currentTarget
      this.end_point = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
      if (this.loadBot) {
        this.move = this.start_point.y - this.end_point.y
        this.move = this.move > this.options.maxDistance ? this.options.maxDistance : this.move
        if (this.move > 0) {
          e.preventDefault()//阻止窗口滑动
          t.style.transform = `translate3d(0px, -${this.move}px, 0px)`
          if (this.move > this.options.prepareLoadDistance) {
            this.el_bot.innerHTML = this.options.reloadBot.text
            this.status = this.statusEnum.prepareLoadBot
          } else {
            this.el_bot.innerHTML = this.options.reloadBot.hintText
            this.status = ''
          }
        }
      } else if (this.loadTop) {
        this.move = this.end_point.y - this.start_point.y
        this.move = this.move > this.options.maxDistance ? this.options.maxDistance : this.move
        if (this.move > 0) {
          e.preventDefault()//阻止窗口滑动
          t.style.transform = `translate3d(0px, ${this.move}px, 0px)`
          if (this.move > this.options.prepareLoadDistance) {
            this.el_top.innerHTML = this.options.reloadTop.text
            this.status = this.statusEnum.prepareLoadTop
          } else {
            this.el_top.innerHTML = this.options.reloadTop.hintText
            this.status = ''
          }
        }
      }
    })
    this.el.addEventListener('touchend', e => {
      classie.add(this.el, 'is-dropped')
      let t = this.el
      if (this.status === '') {
        t.style.transform = `translate3d(0px, 0px, 0px)`
        this.el_bot.innerHTML = this.options.reloadBot.hintText
        this.el_top.innerHTML = this.options.reloadTop.hintText
      } else if (this.status === this.statusEnum.prepareLoadBot) {
        t.style.transform = `translate3d(0px, -${this.options.loadingDistance}px, 0px)`
        this.el_bot.innerHTML = this.options.reloadBot.loadText
        this.status = this.statusEnum.isLoadingBot
        this.loadingBot({page: 1, total: 99, limit: 10})
      } else if (this.status === this.statusEnum.prepareLoadTop) {
        t.style.transform = `translate3d(0px, ${this.options.loadingDistance}px, 0px)`
        this.el_top.innerHTML = this.options.reloadTop.loadText
        this.status = this.statusEnum.isLoadingTop
        this.loadingTop()
      }
    })
  }
}

let gesture = {
  LoadMore,
}

export default gesture
