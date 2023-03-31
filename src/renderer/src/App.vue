<script setup lang="ts">
import { ref, reactive } from 'vue';

const schemaRegistryUrlEl = ref<HTMLInputElement | null>(null)
const subjectsEl = ref<HTMLSelectElement | null>(null)
const brokersUrlEl = ref<HTMLInputElement | null>(null)
const topicEl = ref<HTMLInputElement | null>(null)
const messageEl = ref<HTMLInputElement | null>(null)

let options: any[] = reactive([])

const onSync = async () => {
  options.splice(0)
  const response = await window.api.fetchSchemaRegistry(schemaRegistryUrlEl.value?.value as string);
  subjectsEl.value?.removeAttribute('disabled');

  (JSON.parse(response) as Array<string>)
    .forEach((item: string) => {
      options.push({ label: item, value: item })
    })
}

const onSend = async () => {
  const schemaRegistryUrl = schemaRegistryUrlEl.value?.value as string
  const brokersUrl = brokersUrlEl.value?.value as string
  const subject = subjectsEl.value?.value as string
  const message = messageEl.value?.value as string
  const topic = topicEl.value?.value as string
  const schemaId = await window.api.fetchLatestSchemaId(schemaRegistryUrl, subject);

  await window.api.sendMessage({
    schemaId, schemaRegistryUrl, brokersUrl, message, topic
  })
}

</script>

<template>
  <div class="container-fluid">
    <div class="row mt-2">
      <div class="col">
        <h3>KUI - Kafka UI</h3>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="card">
          <div class="card-header">
            Brokers Configuration
          </div>
          <div class="card-body">
            <div class="row">
              <div class="row mb-3">
                <label for="brokers-url" class="col-sm-2 col-form-label">Url(s)</label>
                <div class="col-sm">
                  <input type="text" class="form-control" id="brokers-url" ref="brokersUrlEl" value="localhost:19092">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card mt-2">
          <div class="card-header">
            Schema Registry Configuration
          </div>
          <div class="card-body">
            <div class="row">
              <div class="row mb-3">
                <label for="schema-registry-url" class="col-sm-2 col-form-label">Url</label>
                <div class="col-sm-8">
                  <input type="text" class="form-control" id="schema-registry-url" ref="schemaRegistryUrlEl" value="http://localhost:8081">
                </div>
                <div class="col-2">
                  <button type="submit" class="btn btn-primary w-100" @click="onSync">Sync</button>
                </div>
              </div>


              <div class="row mb-3">
                <label for="schema-registry-url" class="col-sm-2 col-form-label">Subjects</label>
                <div class="col-sm-10">
                  <select class="form-select" aria-label="Subjects" ref="subjectsEl" disabled>
                    <option v-for="option in options" :value="option.value">{{ option.label }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card mt-2">
          <div class="card-header">
            Topic & Message
          </div>
          <div class="card-body">
            <div class="row mb-3">
                <label for="topic" class="col-sm-2 col-form-label">Topic</label>
                <div class="col-sm">
                  <input type="text" class="form-control" id="topic" ref="topicEl">
                </div>
              </div>

            <div class="row mb-3">
              <textarea ref="messageEl"/>
            </div>
            <div class="row">
              <button type="submit" class="btn btn-primary w-100" @click="onSend">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import 'bootstrap/dist/css/bootstrap.min.css';
</style>
