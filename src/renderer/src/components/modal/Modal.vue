<script setup lang="ts">
import * as bootstrap from 'bootstrap'
import { inject, ref, useSlots, watchEffect } from 'vue'
import { MODAL_EMITTER_NAME, ModalEvents, ShowModalEvent } from '.';
import { Emitter } from 'mitt';

const props = defineProps<{
  title?: string,
  content?: string,
  show?: boolean
}>()

const emit = defineEmits(['hide'])

const modalRef = ref<HTMLDivElement | null>(null)
const title = ref(props.title || null)
const content = ref(props.content || null)

const showModal = (event: ShowModalEvent) => {
  modalRef.value!.addEventListener('hide.bs.modal', () => emit('hide'))

  const modal = new bootstrap.Modal(modalRef.value)
  title.value = event.title
  content.value = event.content
  modal.show()
}

const isUsingSlot = !!useSlots()['default']
if (!isUsingSlot) {
  inject<Emitter<ModalEvents>>(MODAL_EMITTER_NAME)?.on('show', showModal)
} else {
  watchEffect(() => {
    if (props.show) {
      showModal({ title: title.value!, content: content.value! })
    }
  })
}
</script>
<template>
  <div class="row">
    <div class="modal fade" id="modal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog" modal-xl>
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">{{ title }}</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <slot>
              {{ content }}
            </slot>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
