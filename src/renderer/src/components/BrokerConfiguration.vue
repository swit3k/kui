<script setup lang="ts">
import { useKuiStore } from '../store/kui';

const store = useKuiStore()

</script>
<template>
  <div class="form-floating">
    <input type="email" class="form-control" placeholder="localhost:19092" id="brokers-url"
      v-model="store.config.broker.hosts">
    <label for="brokers-url" class="ms-2">Broker URL(s)</label>
  </div>
</template>
