// unused
import fn from '../../logic/src/hleper/prefix_fullscreen'

interface VideoPlayWith {
  request(element: Element): Promise<any>;
  exit(element?: Element): Promise<any>;
  toggle(element: Element): Promise<any>;
  onchange(cb: Function): void;
}

interface VideoPlayWithParams {
  video: HTMLVideoElement
  muted: boolean
  isPip: boolean
  isFullscreen: boolean
  isFullPage: boolean
}

class ScreenFull implements VideoPlayWith{
  private readonly eventNameMap: { change: string; error: string, [index: string]: string }
  constructor() {
    this.eventNameMap = {
      change: fn.fullscreenchange,
      error: fn.fullscreenerror,
    }
  }

  async request(element: Element = document.documentElement): Promise<any> {
    // @ts-ignore
    return await element[fn.requestFullscreen]()
  }

  async toggle(element: Element): Promise<any> {
    if (ScreenFull.isFullscreen()) {
      return await this.exit()
    } else {
      return await this.request(element)
    }
  }

  async exit(): Promise<any> {
    // @ts-ignore
    return await document[fn.exitFullscreen]()
  }

  onchange(cb: Function): void {
    this.on('change', cb)
  }

  onerror(cb: Function): void {
    this.on('error', cb)
  }

  on(ev: string, cb: any) {
    if (this.eventNameMap[ev]) {
      document.addEventListener(this.eventNameMap[ev], cb, false)
    }
  }

  off(ev: string, cb: any) {
    if (this.eventNameMap[ev]) {
      document.removeEventListener(this.eventNameMap[ev], cb, false)
    }
  }

  static isFullscreen(): boolean {
    // @ts-ignore
    return Boolean(document[fn.fullscreenElement])
  }

  static element() {
    // @ts-ignore
    return document[fn.fullscreenElement]
  }

  static isEnabled() {
    // @ts-ignore
    return Boolean(document[fn.fullscreenEnabled])
  }
}

class VideoPip implements VideoPlayWith{
  private readonly video: HTMLVideoElement | undefined
  private isPip: boolean | undefined
  private readonly eventNameMap: { enter: string; leave: string, [index: string]: string }
  constructor(params: Partial<VideoPlayWithParams>) {
    this.video = params.video
    this.isPip = params.isPip
    this.eventNameMap = {
      enter: 'enterpictureinpicture',
      leave: 'leavepictureinpicture',
    }
  }
  async exit(): Promise<any> {
    // @ts-ignore
    await document.exitPictureInPicture()
  }

  onchange(cb: Function): void {
    this.on(this.eventNameMap.enter, cb)
    this.on(this.eventNameMap.leave, cb)
  }

  on(ev: string, cb: any) {
    if (this.video && this.eventNameMap[ev]) {
      this.video.addEventListener(this.eventNameMap[ev], cb, false)
    }
  }

  off(ev: string, cb: any) {
    if (this.video && this.eventNameMap[ev]) {
      this.video.removeEventListener(this.eventNameMap[ev], cb, false)
    }
  }

  async request(element: HTMLVideoElement): Promise<any> {
    // @ts-ignore
    await element.requestPictureInPicture()
  }

  async toggle(element: HTMLVideoElement): Promise<any> {
    // @ts-ignore
    if (element !== document.pictureInPictureElement) {
      await this.request(element)
    } else {
      await this.exit()
    }
  }

  static isVideoPip(element: HTMLVideoElement): boolean {
    // @ts-ignore
    return element === document.pictureInPictureElement
  }
}

export {
  ScreenFull,
  VideoPip
}
