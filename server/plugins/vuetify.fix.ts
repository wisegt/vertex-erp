export default defineNitroPlugin((nitroApp: any) => {
  nitroApp.hooks.hook('render:response', (response: any) => {
    // Guard: only touch string bodies to avoid throwing on streams/buffers
    if (typeof response.body === 'string')
      response.body = response.body.replaceAll('/_nuxt/\0', '/_nuxt/')
  })
})
