<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import { useKuiStore } from './store/kui';

import BrokerConfiguration from './components/BrokerConfiguration.vue';
import SchemaRegistryConfiguration from './components/SchemaRegistryConfiguration.vue';
import Topic from './components/Topic.vue';
import Consumer from './components/Consumer.vue';

import Message from './components/message/Message.vue';
import Feed from './components/message/Feed.vue';
import { MessageStatus } from './components/message';

import Modal from './components/modal/Modal.vue'
import { showModal, Modals } from './components/modal'
import Json from './components/editor/Json.vue';

const store = useKuiStore()

const showSchemaModal = ref(false)
const showSpinner = ref(false)
const stopDisabled = ref(true)
const consumeDisabled = ref(false)

watch(() => store.state.message.content, (content, prevContent) => {
  if (content != prevContent) store.state.message.status = MessageStatus.UNKNOWN
})

const onSend = async () => {
  const schemaRegistryUrl = store.config.schemaRegistry.url
  const topic = store.state.topic
  const schemaId = await window.api.fetchLatestSchemaId(schemaRegistryUrl, store.state.subject!);

  if (!topic) {
    showModal(Modals.error.TOPIC_IS_EMPTY)
    return
  }

  try {
    await window.api.sendMessage({
      schemaId, schemaRegistryUrl, topic,
      brokersUrl: store.config.broker.hosts,
      message: JSON.stringify(store.state.message.content)
    })
    showModal(Modals.info.MESSAGE_SENT(topic))
  } catch (e: any) {
    showModal(Modals.error.UNABLE_TO_SEND_MESSAGE(e))
  }
}

const onValidate = async () => {
  if (!store.state.subject) {
    showModal(Modals.error.SUBJECT_IS_EMPTY)
    return
  }

  const schemaId = await window.api.fetchLatestSchemaId(store.config.schemaRegistry.url, store.state.subject)
  const isValid = await window.api.validateMessage(store.config.schemaRegistry.url, schemaId, JSON.stringify(store.state.message.content))

  store.setMessageStatus(isValid ? MessageStatus.VALID : MessageStatus.INVALID)
}

const onConsume = async () => {
  const topic = store.state.topic
  if (!topic) {
    showModal(Modals.error.TOPIC_IS_EMPTY)
    return
  }

  showSpinner.value = true
  try {
    const payload = {
      brokersUrl: store.config.broker.hosts,
      schemaRegistryUrl: store.config.schemaRegistry.url,
      topic: store.state.topic!!,
      limit: store.config.consumer.limit,
      type: store.config.consumer.type.toString()
    };

    console.debug(`Sending consume request ${payload}`)
    await window.api.sendConsumeMessageRequest(payload)
    stopDisabled.value = false
    consumeDisabled.value = true
  } catch (e: any) {
    showModal(Modals.error.UNABLE_TO_CONSUME_MESSAGE(e))
  }
}

const onStop = async () => {
  await window.api.sendStopConsumingRequest({ topic: store.state.topic!! })
}

window.api.onIncomingMessage(async (_event: any, payload: any) => {
  console.debug('Received incoming message', payload)
  store.state.feed!!.push(payload)
})

window.api.onLastMessageMarker(async (_event: any, payload: any) => {
  console.debug(`Last message recieved, ${payload.topic}`)
  await nextTick(() => {
    showSpinner.value = false
    stopDisabled.value = true
    consumeDisabled.value = false
  })
})

</script>

<template>
  <div class="container-fluid h-100 mt-3">
    <div class="row h-100 scroll">
      <div class="col d-flex flex-column">
        <div class="accordion not-grow" id="configurations">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button secondary" type="button" data-bs-toggle="collapse"
                data-bs-target="#broker-configuration" aria-expanded="true" aria-controls="collapseOne">
                Broker Configuration
              </button>
            </h2>
            <div id="broker-configuration" class="accordion-collapse collapse show">
              <div class="accordion-body">
                <BrokerConfiguration class="not-grow" />
              </div>
            </div>
          </div>
        </div>
        <ul class="nav nav-tabs mt-3 not-grow" id="tabs" role="tablist">
          <li class="nav-item" role="producer">
            <button class="nav-link active" id="producer-tab" data-bs-toggle="tab" data-bs-target="#producer-tab-pane"
              type="button" role="tab" aria-controls="producer-tab-pane" aria-selected="true">Producer</button>
          </li>
          <li class="nav-item" role="consumer">
            <button class="nav-link" id="consumer-tab" data-bs-toggle="tab" data-bs-target="#consumer-tab-pane"
              type="button" role="tab" aria-controls="consumer-tab-pane" aria-selected="false">Consumer</button>
          </li>
        </ul>
        <div class="tab-content grow" id="myTabContent">
          <div class="tab-pane fade show active h-100" id="producer-tab-pane" role="tabpanel"
            aria-labelledby="producer-tab" tabindex="0">
            <div class="d-flex flex-column h-100">
              <div class="accordion not-grow mt-2" id="producer-configurations">
                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse"
                      data-bs-target="#schema-registry-configuration">
                      Schema Registry Configuration
                    </button>
                  </h2>
                  <div id="schema-registry-configuration" class="accordion-collapse collapse">
                    <div class="accordion-body">
                      <SchemaRegistryConfiguration class="not-grow" @schema-loaded="showSchemaModal = true" />
                    </div>
                  </div>
                </div>
                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse"
                      data-bs-target="#producer-topic-configuration">
                      Topic Configuration
                    </button>
                  </h2>
                  <div id="producer-topic-configuration" class="accordion-collapse collapse">
                    <div class="accordion-body">
                      <Topic class="not-grow" :allow-manual="true" />
                    </div>
                  </div>
                </div>
              </div>
              <Message header="Message" class="grow" />
              <div class="row mt-3 mb-3 d-flex flex-row footer">
                <div class="col">
                  <button type="submit" class="btn btn-primary w-100" @click="onValidate">Validate</button>
                </div>
                <div class="col">
                  <button type="submit" class="btn btn-success w-100" @click="onSend"
                    :disabled="store.state.message.status != MessageStatus.VALID">Send</button>
                </div>
              </div>
            </div>
          </div>
          <div class="tab-pane fade h-100" id="consumer-tab-pane" role="tabpanel" aria-labelledby="consumer-tab"
            tabindex="0">
            <div class="d-flex flex-column h-100">
              <div class="row not-grow">
                <div class="col">
                  <div class="accordion not-grow mt-2" id="consumer-configurations">
                    <div class="accordion-item">
                      <h2 class="accordion-header">
                        <button class="accordion-button secondary" type="button" data-bs-toggle="collapse"
                          data-bs-target="#topic-configuration" aria-expanded="true" aria-controls="collapseOne">
                          Topic Configuration
                        </button>
                      </h2>
                      <div id="topic-configuration" class="accordion-collapse collapse show">
                        <div class="accordion-body">
                          <Topic class="not-grow" />
                        </div>
                      </div>
                    </div>
                    <div class="accordion-item">
                      <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse"
                          data-bs-target="#consumer-configuration">
                          Consumer Configuration
                        </button>
                      </h2>
                      <div id="consumer-configuration" class="accordion-collapse collapse">
                        <div class="accordion-body">
                          <Consumer class="not-grow" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row not-grow mt-2 mb-2">
                <div class="col">
                  <button type="submit" class="btn btn-success w-100" @click="onConsume" :disabled="consumeDisabled">
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" v-if="showSpinner" />
                    <span class="visually-hidden">Consume</span>
                    Consume
                  </button>
                </div>
                <div class="col">
                  <button type="submit" class="btn btn-danger w-100" :disabled="stopDisabled" @click="onStop">
                    Stop
                  </button>
                </div>
              </div>
              <div class="row grow mt-3 mb-2 h-100">
                <div class="col">
                  <Feed />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Modal title="Show Schema" :show="showSchemaModal" @hide="showSchemaModal = false">
      <Json :content="store.state.schema" :read-only="true" class="h-100" />
    </Modal>
    <Modal />
  </div>
</template>

<style lang="less">
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'vue-json-pretty/lib/styles.css';

body,
html {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.scroll {
  overflow-y: scroll;
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

.accordion-button,
.accordion-button:not(.collapsed) {
  background-color: rgba(33, 37, 41, 0.03);
}

.nav-tabs .nav-item.show .nav-link,
.nav-tabs .nav-link.active {
  background-color: #0d6efd !important;
  color: white;
}
</style>
