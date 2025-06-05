const components = import.meta.glob('./*/**.vue', {
  eager: true,
  import: 'default'
})

export default {
  install(app) {
    Object.entries(components).forEach(([path, component]) => {
      // Extract component name from path
      const componentName = path.split('/').pop().replace('.vue', '')
      app.component(componentName, component)
    })
  }
} 