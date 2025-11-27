declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '@/views/*' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'vue-prism-component' {
  import { ComponentOptions } from 'vue'
  const component: ComponentOptions
  export default component
}
declare module 'vue-shepherd';
