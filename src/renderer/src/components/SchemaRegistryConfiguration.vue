<script setup lang="ts">
import { useKuiStore } from '../store/kui';
import { reactive, ref } from 'vue';
import { Modals, showModal } from './modal'

const store = useKuiStore()

const emit = defineEmits(['schema-loaded'])

const subjectOptions: any[] = reactive([])
const subjectsEl = ref<HTMLSelectElement | null>(null)

const onSyncSubjects = async () => {
  subjectOptions.splice(0)
  const response = await window.api.fetchSchemaRegistry(store.config.schemaRegistry.url);
  subjectsEl.value?.removeAttribute('disabled');

  (JSON.parse(response) as Array<string>)
    .sort()
    .forEach((item: string) => {
      subjectOptions.push({ label: item, value: item })
    })
}

const onShowSchema = async () => {
  const subject = subjectsEl.value?.value as string
  if (!subject) {
    showModal(Modals.error.SUBJECT_IS_EMPTY)
    return
  }
  const schemaRegistryUrl = store.config.schemaRegistry.url
  const schemaId = await window.api.fetchLatestSchemaId(schemaRegistryUrl, subject);
  const response = await window.api.fetchSchema(schemaRegistryUrl, schemaId);

  store.state.schema = JSON.parse(JSON.parse(response).schema)
  emit('schema-loaded')
}
</script>
<template>
  <div class="row">
    <div class="col">
      <div class="row mb-2">
        <div class="col-10">
          <div class="form-floating">
            <input type="email" class="form-control" placeholder="http://localhost:8081" id="schema-registry-url"
              v-model="store.config.schemaRegistry.url">
            <label for="schema-registry-url" class="ms-2">URL</label>
          </div>
        </div>
        <div class="col-2">
          <button type="submit" class="btn btn-primary w-100 h-100" @click="onSyncSubjects">Sync</button>
        </div>
      </div>

      <div class="row">
        <div class="col-10">
          <div class="form-floating">
            <select class="form-select" id="subjects" aria-label="Subjects" ref="subjectsEl" disabled
              placeholder="Subject 1" v-model="store.state.subject">
              <option v-for="option in subjectOptions" :value="option.value">{{ option.label }}</option>
            </select>
            <label for="subjects" class="ms-2">Subject</label>
          </div>
        </div>
        <div class="col-2">
          <button type="submit" class="btn btn-primary w-100 h-100" @click="onShowSchema">Show schema</button>
        </div>
      </div>
    </div>
  </div>
</template>
