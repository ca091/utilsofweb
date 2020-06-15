import {$$, classie} from '../../dom/src'

let LazyImg = {
  imgs: [],
  unLoad: [],
  loadAll: false,
  timer: null,
  init(selector = '.lazy') {
    this.imgs = [...$$(selector) as NodeList]
    for (let img of this.imgs) {
      img.onload = (e: Event) => {
        let tar = e.target as HTMLImageElement
        if (!/tm.png/.test(tar.src)) {
          classie.add(tar, 'img-opacity')
        }
      }
    }
  },
  onScroll() {
    this.imgs = this.imgs.filter((img: HTMLImageElement) => {
      let imgClientRect = img.getBoundingClientRect()
      if (img.dataset.src && imgClientRect.top < window.innerHeight) {
        if (imgClientRect.bottom > 0) {
          img.src = img.dataset.src
        } else {
          this.unLoad.unshift(img)
        }
        return false
      }
      return true
    })
    //延迟加载屏幕以上的
    if (!this.loadAll) {
      this.loadAll = true
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.unLoad = this.unLoad.filter((img: HTMLImageElement) => {
          if (img.dataset.src) {
            img.src = img.dataset.src
          }
          return false
        })
      }, 3000)
    }
  },
}

export {
  LazyImg,
}
