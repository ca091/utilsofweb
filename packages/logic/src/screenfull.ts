import fn from './hleper/prefix_fullscreen'

type eventKey = 'change' | 'error'

const fullscreen = {
  eventNameMap: {
    change: fn.fullscreenchange,
    error: fn.fullscreenerror,
  },
  async request(element: HTMLElement, options: FullscreenOptions = {navigationUI: 'auto'}) {
    element = element || document.documentElement
    if (this.isEnabled) {
      // @ts-ignore
      await element[fn.requestFullscreen](options)
    }
  },
  async exit() {
    // @ts-ignore
    await document[fn.exitFullscreen]()
  },
  async toggle(element: HTMLElement, options: FullscreenOptions = {navigationUI: 'auto'}) {
    if (this.isFullscreen) {
      await this.exit()
    } else {
      await this.request(element, options)
    }
  },
  onchange(cb: Function) {
    this.on('change', cb)
  },
  onerror(cb: Function) {
    this.on('error', cb)
  },
  on(ev: eventKey, cb: any) {
    if (this.eventNameMap[ev]) {
      document.addEventListener(this.eventNameMap[ev], cb, false)
    }
  },
  off(ev: eventKey, cb: any) {
    if (this.eventNameMap[ev]) {
      document.removeEventListener(this.eventNameMap[ev], cb, false)
    }
  },
  get isFullscreen(): boolean {
    // @ts-ignore
    return Boolean(document[fn.fullscreenElement])
  },
  get element() {
    // @ts-ignore
    return document[fn.fullscreenElement]
  },
  get isEnabled(): boolean {
    // @ts-ignore
    return Boolean(document[fn.fullscreenEnabled])
  }
}

const fullscreenIos = {
  // eventNameMap: {
  //   change: fn.fullscreenchange,
  //   error: fn.fullscreenerror,
  // },
  async request(video: HTMLVideoElement) {
    if (this.isEnabled(video)) {
      // @ts-ignore
      await video.webkitEnterFullscreen()
    }
  },
  async exit(video: HTMLVideoElement) {
    // @ts-ignore
    await video.webkitExitFullscreen()
  },
  async toggle(video: HTMLVideoElement) {
    if (this.isFullscreen) {
      await this.exit(video)
    } else {
      await this.request(video)
    }
  },
  get isFullscreen(): boolean {
    // @ts-ignore
    // return !!video.webkitDisplayingFullscreen()
    return document.fullScreen || document.webkitIsFullScreen || false
  },
  isEnabled(video: HTMLVideoElement): boolean {
    // @ts-ignore
    return !!video.webkitEnterFullscreen
  },
}

export {
  fullscreen,
  fullscreenIos
}
