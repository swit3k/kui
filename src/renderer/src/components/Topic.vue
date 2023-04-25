<script setup lang="ts">
import { useKuiStore } from '@renderer/store/kui';
import { reactive, ref } from 'vue';

const props = defineProps<{
  allowManual?: boolean
}>()

const store = useKuiStore()
const allowManual = !!props.allowManual

const topicOptions: any[] = reactive([])

const topicsEl = ref<HTMLSelectElement | null>(null) // select

const onSyncTopics = async () => {
  topicOptions.splice(0)
  const response = await window.api.listTopics(store.config.broker.hosts);

  topicsEl.value?.removeAttribute('disabled');

  (response as Array<string>)
    .sort()
    .filter(topic => !topic.startsWith('_'))
    .forEach((item: string) => {
      topicOptions.push({ label: item, value: item })
    })
}

</script>
<template>
  <div>
    <div class="row" v-if="allowManual">
      <div class="col">
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" v-model="store.config.topic.type" id="topic-list" value="LIST">
          <label class="form-check-label" for="topic-list">List</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" v-model="store.config.topic.type" id="topic-manual" value="MANUAL">
          <label class="form-check-label" for="topic-manual">Manual</label>
        </div>
      </div>
    </div>
    <div class="row mt-1" v-if="store.config.topic.type == 'LIST'">
      <div class="col-10">
        <div class="form-floating">
          <select class="form-select" id="topic-list" aria-label="Topics" ref="topicsEl"
            :disabled="topicOptions.length == 0" placeholder="topic_1" v-model="store.state.topic">
            <option v-for="option in topicOptions" :value="option.value">{{ option.label }}</option>
          </select>
          <label for="topic-list">Topic</label>
        </div>
      </div>
      <div class="col-2">
        <button type="submit" class="btn btn-primary w-100 h-100" @click="onSyncTopics">Sync</button>
      </div>
    </div>
    <div class="row mt-1" v-else-if="store.config.topic.type == 'MANUAL'">
      <div class="form-floating">
        <input type="text" class="form-control" placeholder="new_topic" id="topic-manual" v-model="store.state.topic">
        <label for="topic-manual" class="ms-2">Topic</label>
      </div>
    </div>
  </div>
</template>
