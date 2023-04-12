<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import JsonEditorVue from 'json-editor-vue'
import * as bootstrap from 'bootstrap'

enum PayloadStatus {
  UNKNOWN, VALID, INVALID
}

const schemaRegistryUrlEl = ref<HTMLInputElement | null>(null)
const subjectsEl = ref<HTMLSelectElement | null>(null)
const brokersUrlEl = ref<HTMLInputElement | null>(null)

const topicsEl = ref<HTMLSelectElement | null>(null) // select
const topicEl = ref<HTMLInputElement | null>(null) // input

const subjectOptions: any[] = reactive([])
const topicOptions: any[] = reactive([])

const state: any = reactive({
  payloadStatus: PayloadStatus.UNKNOWN,
  payload: {},
  topicType: null,
  schema: null,
  modal: {
    title: null,
    content: null
  }
})

watch(() => state.payload, (payload, prevPayload) => {
  if (payload != prevPayload) state.payloadStatus = PayloadStatus.UNKNOWN
})

const openModal = (config: {title?: string, content?: string, id: string}) => {
  const modal = new bootstrap.Modal(config.id)
    state.modal.title = config.title
    state.modal.content = config.content
    modal.show()
}

const onSyncSubjects = async () => {
  subjectOptions.splice(0)
  const response = await window.api.fetchSchemaRegistry(schemaRegistryUrlEl.value?.value as string);
  subjectsEl.value?.removeAttribute('disabled');

  (JSON.parse(response) as Array<string>)
    .forEach((item: string) => {
      subjectOptions.push({ label: item, value: item })
    })
}

const onSyncTopics = async () => {
  topicOptions.splice(0)
  const brokersUrl = brokersUrlEl.value?.value as string
  const response = await window.api.listTopics(brokersUrl);

  topicsEl.value?.removeAttribute('disabled');

  (response as Array<string>)
    .forEach((item: string) => {
      topicOptions.push({ label: item, value: item })
    })
}

const onShowSchema = async () => {
  const subject = subjectsEl.value?.value as string
  if (!subject) {
    openModal({
      title: "Sync & choose Subject",
      content: "Before fetching the schema you must first run 'Sync' on Schema Registry",
      id: "#modal-1"
    })
    return
  }
  const schemaRegistryUrl = schemaRegistryUrlEl.value?.value as string
  const schemaId = await window.api.fetchLatestSchemaId(schemaRegistryUrl, subject);
  const response = await window.api.fetchSchema(schemaRegistryUrlEl.value?.value as string, schemaId);

  state.schema = JSON.parse(JSON.parse(response).schema)
  openModal({
    id: "#modal-schema"
  })
}

const onSend = async () => {
  const schemaRegistryUrl = schemaRegistryUrlEl.value?.value as string
  const brokersUrl = brokersUrlEl.value?.value as string
  const subject = subjectsEl.value?.value as string
  const topic = (state.topicType == 'manual' ? topicEl : topicsEl).value?.value as string
  const schemaId = await window.api.fetchLatestSchemaId(schemaRegistryUrl, subject);

  if (!topic) {
    openModal({
      title: "Error",
      content: "Topic cannot be empty",
      id: "#modal-1"
    })
    return
  }

  try {
    await window.api.sendMessage({
      schemaId, schemaRegistryUrl, brokersUrl, message: JSON.stringify(state.payload), topic
    })
    openModal({
      title: "Success",
      content: `Message was successfully sent to topic ${topic}`,
      id: "#modal-1"
    })
  } catch(e: any) {
    openModal({
      title: "Error",
      content: `Error occurred while sending message: ${e.message}`,
      id: "#modal-1"
    })
  }
}

const onValidate = async () => {
  const subject = subjectsEl.value?.value as string
  if (!subject) {
    openModal({
      title: "Sync & choose Subject",
      content: "Before validating the message you must first run 'Sync' on Schema Registry",
      id: "#modal-1"
    })

    return
  }

  const schemaRegistryUrl = schemaRegistryUrlEl.value?.value as string
  const schemaId = await window.api.fetchLatestSchemaId(schemaRegistryUrl, subject)
  const isValid = await window.api.validateMessage(schemaRegistryUrl, schemaId, JSON.stringify(state.payload))

  state.payloadStatus = isValid ? PayloadStatus.VALID : PayloadStatus.INVALID
}

</script>

<template>
  <div class="container-fluid h-100 mt-3">
    <div class="row h-100">
      <div class="col d-flex flex-column">
        <div class="card not-grow">
          <div class="card-header">
            Brokers Configuration
          </div>
          <div class="card-body">
            <div class="row">
              <div class="form-floating">
                <input type="email" class="form-control" placeholder="localhost:9092" id="brokers-url" ref="brokersUrlEl"
                  value="localhost:19092">
                <label for="brokers-url" class="ms-2">Broker URL(s)</label>
              </div>
            </div>
          </div>
        </div>
        <div class="card mt-2 not-grow">
          <div class="card-header">
            Schema Registry Configuration
          </div>
          <div class="card-body d-flex flex-column">
            <div class="row">
              <div class="col">
                <div class="row mb-2">
                  <div class="col-10">
                    <div class="form-floating">
                      <input type="email" class="form-control" placeholder="http://localhost:8081"
                        id="schema-registry-url" ref="schemaRegistryUrlEl" value="http://localhost:8081">
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
                      <select class="form-select" id="subjects" aria-label="Subjects" ref="subjectsEl" disabled placeholder="Subject 1">
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
          </div>
        </div>
        <div class="card mt-2 not-grow">
          <div class="card-header">
            Topic
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col">
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" v-model="state.topicType" id="topic-manual" value="manual">
                  <label class="form-check-label" for="topic-manual">Manual</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" v-model="state.topicType" id="topic-list" value="list">
                  <label class="form-check-label" for="topic-list">List</label>
                </div>
              </div>
            </div>
            <div class="row mt-1" v-if="state.topicType == 'list'">
              <div class="col-10">
                <div class="form-floating">
                  <select class="form-select" id="topic-list" aria-label="Topics" ref="topicsEl" :disabled="topicOptions.length == 0" placeholder="topic_1">
                    <option v-for="option in topicOptions" :value="option.value">{{ option.label }}</option>
                  </select>
                  <label for="topic-list" class="ms-2">Topic</label>
                </div>
              </div>
              <div class="col-2">
                <button type="submit" class="btn btn-primary w-100 h-100" @click="onSyncTopics">Sync</button>
              </div>
            </div>
            <div class="row mt-1" v-else-if="state.topicType == 'manual'">
              <div class="form-floating">
                <input type="text" class="form-control" placeholder="new_topic"
                  id="topic-manual" ref="topicEl" value="new_topic">
                <label for="topic-manual" class="ms-2">Topic</label>
              </div>
            </div>
          </div>
        </div>
        <div class="card mt-2 grow">
          <div class="card-header">
            Message
          </div>
          <div class="card-body d-flex flex-column">
            <div class="row mb-3 flex-grow-1">
              <div class="col">
                <JsonEditorVue v-model="state.payload" style="height: 100%" />
              </div>
            </div>
            <div class="row flex-grow-0">
              <div class="col">
                <label class="col-sm-2 col-form-label">Status</label>
                <span v-if="state.payloadStatus == PayloadStatus.UNKNOWN">
                  <span class="badge text-bg-secondary">NOT VALIDATED</span>
                </span>
                <span v-else-if="state.payloadStatus == PayloadStatus.VALID">
                  <span class="badge text-bg-success">VALID</span>
                </span>
                <span v-else>
                  <span class="badge text-bg-danger">INVALID</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="row mt-3 mb-3 d-flex flex-row footer">
          <div class="col">
            <button type="submit" class="btn btn-primary w-100" @click="onValidate">Validate</button>
          </div>
          <div class="col">
            <!-- <button type="submit" class="btn btn-success w-100" @click="onSend"
              :disabled="state.payloadStatus != PayloadStatus.VALID">Send</button> -->
            <button type="submit" class="btn btn-success w-100" @click="onSend">Send</button>
          </div>
        </div>
        <div class="row">
          <!-- Modal -->
          <div class="modal fade" id="modal-1" tabindex="-1">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h1 class="modal-title fs-5">{{ state.modal.title }}</h1>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  {{ state.modal.content }}
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal fade" id="modal-schema" tabindex="-1">
            <div class="modal-dialog" modal-xl>
              <div class="modal-content">
                <div class="modal-header">
                  <h1 class="modal-title fs-5">Schema</h1>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <JsonEditorVue v-model="state.schema" style="height: 100%" :read-only="true" />
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import 'vue-json-pretty/lib/styles.css';
@import 'bootstrap/dist/css/bootstrap.min.css';

body,
html {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.not-grow {
  flex: 0 1 auto;
}

.grow {
  flex: 1 1 auto;
}

.footer {
  flex: 0 1 50px;
}

.form-floating::before {
  width: 0 !important
}
</style>
