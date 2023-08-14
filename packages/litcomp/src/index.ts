const Components: Record<string, string> = {
  Message: 'Message'
}

function registerComponent(c: string) {
  if (Components[c] !== undefined) {
    import(`./litcomp/${c}.es.js`)
  }
}

export {
  Components,
  registerComponent
}
