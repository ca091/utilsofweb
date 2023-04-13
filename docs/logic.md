## Logic

- DBManager

- PageManager

```javascript
let pm = new Logic.PageManager()
let events = {
  pagename: {
    selector: {
      click: eventMixinInstance, // 点击
      immediate: eventMixinInstance, // 立即执行
    },
  },
  //...
}
pm.setPages(events).setDefaultPage('home').init()
```

- http

```javascript
import {Logic} from 'utilsofweb'
import apis from './apis.js'
let initConfig = {
  getData() {
    return {
      from: 'js'
    }
  },
  header: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}
let cFetch = Logic.generateFetch(apis, initConfig)
cFetch('getSensitiveWords', {page: 1}).then(res => {
  console.log('res: ', res)
}).catch(err => {
  console.warn('error: ', err)
})
```

- lazyImg

> 图片准备

- assets
  - loading.png (作为懒加载图片背景)
  - tm.png (作为懒加载图片src)

> html

```html
<img class="lazy" src="../assets/tm.png" :data-src="goods.iconUrl" alt="商品图片">
```

> js

```javascript
import {Logic} from 'utilsofweb'
Logic.lazyImg.init()
Logic.lazyImg.onScroll()
function scrollHandler() {
  if (Logic.lazyImg.imgs.length === 0) {
    window.removeEventListener('scroll', onScroll)
  }
  Logic.lazyImg.onScroll.call(Logic.lazyImg)
}

let onScroll = Logic.throttle(scrollHandler, 100)
window.addEventListener('scroll', onScroll)
```

> css
```css
img.lazy {
  background: url("data:image/png;base64,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") center / cover no-repeat;
}
@keyframes imgOpacity {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.img-opacity {
  animation: imgOpacity 300ms linear 0ms 1 normal both;
}
```

- screenfull
```javascript
await screenfull.toggle(fullElement)
```
