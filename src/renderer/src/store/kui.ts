import { MessageStatus } from "@renderer/components/message";
import { defineStore } from "pinia";
import { reactive } from "vue";
import debounce from 'debounce'
import md5 from 'md5'

export enum ConsumerType {
  FROM_BEGINNING, FROM_END_FORWARD, FROM_END_BACKWARD
}
export type TopicType = 'MANUAL' | 'LIST'
export type ConsumerLimit = 1 | 5 | 10
export interface IncomingMessagePayload {
  partition: number,
  message: any
}

interface KuiConfig {
  broker: {
    hosts: string
  },
  schemaRegistry: {
    url: string
  },
  topic: {
    type: TopicType
  },
  consumer: {
    type: ConsumerType,
    offset?: number,
    limit: ConsumerLimit
  }
}

interface KuiState {
  schema: any,
  subject: string | null,
  topic: string | null,
  message: {
    content: any,
    checksum: string,
    status: MessageStatus
  },
  feed: IncomingMessagePayload[] | null
}

export const useKuiStore = defineStore('kui', () => {
  const config: KuiConfig = reactive({
    broker: {
      hosts: 'localhost:19092'
    },

    schemaRegistry: {
      url: 'http://localhost:8081'
    },

    topic: {
      type: 'LIST'
    },

    consumer: {
      type: ConsumerType.FROM_BEGINNING,
      limit: 1
    }
  })

  const state: KuiState = reactive({
    schema: {},
    subject: null,
    topic: null,
    message: {
      content: {},
      checksum: md5(JSON.stringify({})),
      status: MessageStatus.UNKNOWN
    },
    feed: []
  })

  const setMessageStatus = (status: MessageStatus) => state.message.status = status

  const setMessage = debounce((content: string, checksum?: string) => {
    state.message.content = content
    if (checksum) state.message.checksum = checksum
    else state.message.checksum = md5(JSON.stringify(content))
  }, 300)

  const clearFeed = () => state.feed = []

  return { config, state, setMessageStatus, setMessage, clearFeed }
})
