import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import Modal from './components/modal/Modal.vue'
import { MODAL_EMITTER_NAME, emitter } from './components/modal'
import JsonEditorVue from 'json-editor-vue'

createApp(App)
  .component('Modal', Modal)
  .provide(MODAL_EMITTER_NAME, emitter)
  .component('JsonEditorVue', JsonEditorVue)
  .use(createPinia())
  .mount('#app')
