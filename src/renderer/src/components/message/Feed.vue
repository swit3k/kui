<script setup lang="ts">
import { useKuiStore } from '@renderer/store/kui';
import Json from '../editor/Json.vue'

const store = useKuiStore()

const onClear = () => {
  store.clearFeed()
}

</script>
<template>
  <div class="card h-100">
    <div class="card-header">
      Message Feed
      <span class="float-end"><button class="btn btn-sm btn-secondary" @click="onClear">Clear</button></span>
    </div>
    <div class="card-body d-flex flex-column">
      <div class="row flex-grow-1">
        <div class="col">
          <Json :content="store.state.feed" :read-only="true" class="h-100" />
        </div>
      </div>
    </div>
  </div>
</template>
