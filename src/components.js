const ensureBlackHole = (instance, name) => {
  const { $root } = instance
  if (!$root.$_blackHole) {
    $root.$_blackHole = {}
  }
  const blackHole = $root.$_blackHole
  return (
    blackHole[name] ||
    (blackHole[name] = {
      _parents: [],
      _content: null,
      ensureParent(parent) {
        if (this._parents.includes(parent)) return
        this._parents.push(parent)
      },
      render() {
        for (let parent of this._parents) parent.$forceUpdate()
      },
      get content() {
        return this._content
      },
      set content(content) {
        this._content = content
        this.render()
      },
    })
  )
}

export const VWhiteHole = {
  functional: true,
  name: 'v-white-hole',
  props: {
    name: { type: String, required: true },
  },
  render(h, { parent, children, props }) {
    const blackHole = ensureBlackHole(parent, props.name)
    blackHole.ensureParent(parent)
    return blackHole.content || children
  },
}

export const VBlackHole = {
  name: 'v-black-hole',
  data: () => ({ freeze: false, blackHole: null }),
  props: {
    mirror: { type: Boolean, default: false },
    name: { type: String, required: true },
    tag: { type: String, default: 'div' },
  },
  watch: { name: 'nameChanged', mirror: '$forceUpdate', tag: '$forceUpdate' },
  created() {
    this.ensureBlackHole()
    this.sync()
  },
  beforeUpdate() {
    this.sync()
  },
  beforeDestroy() {
    this.blackHole.content = null
  },
  methods: {
    children() {
      const slots = Object.values(this.$slots)
      return slots.reduce((acc, cur) => [...acc, ...cur], [])
    },
    ensureBlackHole() {
      const { name } = this
      this.blackHole = ensureBlackHole(this, name)
    },
    sync() {
      const { blackHole } = this
      const sameParent = blackHole._parents.includes(this.$parent)
      if (sameParent && this.freeze) {
        this.freeze = false
        return
      }
      this.freeze = true
      this.blackHole.content = this.children()
    },
    nameChanged() {
      this.blackHole.content = null
      this.ensureBlackHole()
      this.sync()
    },
  },
  render(h) {
    const { mirror, tag } = this
    return !mirror ? null : h(tag, { slot: true }, this.children())
  },
}
