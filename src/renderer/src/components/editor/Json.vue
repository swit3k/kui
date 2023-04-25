<script setup lang="ts">
import JSONEditor from 'jsoneditor'
import { onMounted, ref, watchEffect } from 'vue';
import md5 from 'md5'

export interface Props {
  content: any,
  checksum?: string,
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false
})

const emit = defineEmits(['updated'])

// @ts-ignore
const container = ref<HTMLDivElement>(null)
const lastChecksum = ref(props.checksum)

onMounted(() => {
  let editor: JSONEditor | null = null;
  editor = new JSONEditor(container.value, {
    mode: props.readOnly ? 'view' : 'tree',
    modes: ['text', props.readOnly ? 'view' : 'tree'],
    onChange() {
      try {
        const object = JSON.parse(editor!!.getText())
        lastChecksum.value = md5(object)
        emit('updated', { checksum: lastChecksum.value, content: object})
      } catch(e: any) {
        console.debug("Syntax error. Skipping component update.")
      }
    }
  })

  watchEffect(() => {
    if (props.readOnly || (lastChecksum.value != props.checksum)) {
      editor!!.set(props.content)
    }
  })
})
</script>
<template>
  <div>
    <div ref="container" style="height: 100%"></div>
  </div>
</template>
<style>
@import 'jsoneditor/dist/jsoneditor.min.css';
</style>
