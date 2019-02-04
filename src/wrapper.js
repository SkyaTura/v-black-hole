import { VBlackHole, VWhiteHole } from './components'

export function install(Vue) {
  if (install.installed) return
  install.installed = true
  Vue.component('VBlackHole', VBlackHole)
  Vue.component('v-black-hole', VBlackHole)
  Vue.component('VWhiteHole', VWhiteHole)
  Vue.component('v-white-hole', VWhiteHole)
}

const plugin = { install }

let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(plugin)
}

export default {
  install,
  VBlackHole,
  VWhiteHole,
}
