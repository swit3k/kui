<script setup lang="ts">
import { ConsumerLimit, ConsumerType, useKuiStore } from '../store/kui';

const store = useKuiStore()

const types = [
  { label: "From beginning", value: ConsumerType.FROM_BEGINNING },
  { label: "From end (forward)", value: ConsumerType.FROM_END_FORWARD },
  { label: "From end (backward) - TO BE IMPLEMENTED", value: ConsumerType.FROM_END_FORWARD },

]
const limits: Array<ConsumerLimit> = [1, 5, 10]

</script>
<template>
  <div>
    <div class="row">
      <div class="col">
        <div class="form-floating">
          <select class="form-select" id="types-list" aria-label="Types" ref="topicsEl"
            v-model="store.config.consumer.type">
            <option v-for="consumerType in types" :value="consumerType.value"
              >{{ consumerType.label }}</option>
          </select>
          <label for="types-list">Type</label>
        </div>
      </div>
      <div class="col">
        <div class="form-floating">
          <select class="form-select" id="limits-list" aria-label="Limits" ref="topicsEl"
            v-model="store.config.consumer.limit">
            <option v-for="consumerLimit in limits" :value="consumerLimit">{{ consumerLimit }}</option>
          </select>
          <label for="limits-list">Number of messages</label>
        </div>
      </div>
    </div>
  </div>
</template>
