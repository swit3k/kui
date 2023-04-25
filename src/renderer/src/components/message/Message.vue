<script setup lang="ts">
import { useKuiStore } from '../../store/kui';
import { MessageStatus } from '.';
import Json from '../editor/Json.vue'

const store = useKuiStore()

const onUpdated = (payload: any) => {
  console.log(`updating ${payload}`)
  store.setMessage(payload.content, payload.checksum)
}
</script>
<template>
  <div class="card mt-2 grow">
    <div class="card-header">Message</div>
    <div class="card-body d-flex flex-column">
      <div class="row mb-3 flex-grow-1">
        <div class="col">
          <Json
            :content="store.state.message.content"
            :checksum="store.state.message.checksum"
            @updated="onUpdated" class="h-100"/>
        </div>
      </div>
      <div class="row flex-grow-0">
        <div class="col">
          <label class="col-sm-2 col-form-label">Status</label>
          <span v-if="store.state.message.status == MessageStatus.UNKNOWN">
            <span class="badge text-bg-secondary">NOT VALIDATED</span>
          </span>
          <span v-else-if="store.state.message.status == MessageStatus.VALID">
            <span class="badge text-bg-success">VALID</span>
          </span>
          <span v-else>
            <span class="badge text-bg-danger">INVALID</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
