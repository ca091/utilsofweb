import qs from 'qs'
import {Lock} from './hleper/Lock'

interface Apis {
  [index: string]: Array<any>
}

interface Loading {
  start: Function,
  stop: Function
}

interface Configs {
  getData: () => Record<string, any>,
  header: Record<string, string>,
  loading?: Loading
}

function generateFetch(initApis: Apis = {}, initConfig: Configs, handler?: Function): Function {
  let apis: Apis = initApis
  let initHeader = initConfig.header || {}
  let apiLock = new Lock()

  function fetchData (apiName: string, data: object = {}, header: object = {}, opts = {mountElement: document.body, timeout: 0}) {
    if (!apis[apiName]) {
      if (/^https?:/.test(apiName)) {
        return fetch(apiName, data)
      } else {
        throw Error(`${apiName} is undefined`)
      }
    }
    let [url, method, domain] = apis[apiName]
    const dataSend = {...initConfig.getData(), ...data}
    const request: RequestInit = {
      // body: JSON.stringify(dataSend),
      method,
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...initHeader,
        ...header
      }
    }
    const channel = `${url}_${JSON.stringify(dataSend)}`

    // @ts-ignore
    if (request.headers['Content-Type'] === 'multipart/form-data') {
      let formData = new FormData()
      for (let key in dataSend) {
        formData.append(key, dataSend[key])
      }
      request.body = formData
    }
    // @ts-ignore
    else if (request.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      // TypeError: Failed to execute 'fetch' on 'Window': Request with GET/HEAD method cannot have body.
      // see => https://github.com/whatwg/fetch/issues/551
      // @ts-ignore
      if (request.method.toLowerCase() === 'get') {
        url += `?${qs.stringify(dataSend)}`
      } else {
        request.body = qs.stringify(dataSend)
      }
    } else {
      request.body = JSON.stringify(dataSend)
    }

    let fn = () => new Promise((resolve, reject) => {
      // loading
      if (opts.mountElement && initConfig.loading) {
        initConfig.loading.start(opts.mountElement)
      }
      // abort fetch
      let timerId: any
      if (opts && opts.timeout > 0) {
        let controller = new AbortController()
        request.signal = controller.signal
        timerId = setTimeout(() => controller.abort(), opts.timeout)
      }
      fetch(domain ? domain + url : url, request)
        .then(res => {
          if (res.ok) {
            clearTimeout(timerId)
            return res.json()
          } else {
            // HTTP 状态码是 404 或 500 ...
            handler && handler(null, {code: 500, message: 'network error'})
            reject('network error')
          }
        })
        .then(res => {
          if (res.code === 200) {
            resolve(res)
          } else {
            if (handler) {
              if (handler(res)) {
                resolve(res)
              } else {
                reject(res)
              }
            } else {
              reject(res)
            }
          }
        })
        .catch(error => {
          console.warn('fetch error occur:', error)
          // 网络故障 或 请求被阻止
          handler && handler(null, {code: 0, message: 'network error !'})
          reject('network error !')
        })
        .finally(() => {
          // loading over
          if (opts.mountElement && initConfig.loading) {
            initConfig.loading.stop()
          }
          setTimeout(apiLock.unlock.bind(apiLock), 300, channel)
        })
    })
    return apiLock.lock(channel, fn)
  }

  fetchData.addApi = (moreApis: Apis): void => {
    apis = Object.assign({}, apis, moreApis)
  }

  fetchData.updateInitConfig = (updatedConfig: Configs) => {
    // initData = updatedConfig.data || {}
    initHeader = updatedConfig.header || {}
  }

  return fetchData
}

export {
  generateFetch
}
