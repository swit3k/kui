import { BrowserWindow, IpcMainInvokeEvent } from 'electron';

import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

import { CHANNELS } from '../../shared/channels'
import { ConsumeRequestPayload, OutgoingMessagePayload } from '../../shared/types';
import { finalize, take } from 'rxjs';
import { KafkaConsumer } from '../kafka/kafka-consumer';
import { Kafka, logLevel } from 'kafkajs';

export interface KafkaConsumerConfig {
  schemaRegistryUrl: string,
  topic: string,
  limit: number,
  type: string
}

class State {
  public consumer: KafkaConsumer | null = null
}

const state = new State()

export const KafkaHandlers = (mainWindow: BrowserWindow) => {
  const clientId = `kui-client-`

  const closeConsumer = async () => {
    const run = async () => {
      state.consumer!!.disconnect()
      console.log(`Consumer closed`)
    }

    run()
      .then(() => {
        mainWindow.webContents.send(CHANNELS.KAFKA.LAST_MESSAGE_MARKER, { topic: state.consumer?.getTopic() })
      })
      .catch(async e => { console.error(e) })
      .finally(() => { state.consumer = null })
  }

  const sendLastMessageMarker = () => {
    console.log(`Sending last message marker`)
    closeConsumer().then(() =>
      mainWindow.webContents.send(CHANNELS.KAFKA.LAST_MESSAGE_MARKER, { topic: state.consumer?.getTopic() })
    )
  }

  const onStopConsumingRequest = {
    channel: CHANNELS.KAFKA.STOP_CONSUMING,
    listener: (_event: IpcMainInvokeEvent) => {
      console.log(`Received stop request`)
      closeConsumer()
    }
  }

  const onConsumeMessageRequest = {
    channel: CHANNELS.KAFKA.CONSUME_REQUEST,
    listener: (_event: IpcMainInvokeEvent, consumePayload: ConsumeRequestPayload) => {
      const registry = new SchemaRegistry({ host: consumePayload.schemaRegistryUrl })
      const kafka = new Kafka({
        logLevel: logLevel.INFO,
        brokers: consumePayload.brokersUrl.split(','),
        clientId
      })

      state.consumer = new KafkaConsumer(kafka, registry)
      state.consumer
        .startConsumer({ ...consumePayload })
        .then(observable => {
          observable
            .pipe(
              take(consumePayload.limit),
              finalize(() => sendLastMessageMarker())
            )
            .subscribe(message => {
              mainWindow.webContents.send(CHANNELS.KAFKA.INCOMING_MESSAGE, message)
            })
        })
        .catch(e => console.error(`Error: ${e.message}`, e))
    }
  }

  const sendMessage = {
    channel: CHANNELS.KAFKA.SEND_REQUEST,
    handle: async (_event: IpcMainInvokeEvent, messagePayload: OutgoingMessagePayload) => {

      const kafka = new Kafka({
        brokers: messagePayload.brokersUrl.split(','),
        clientId,
      })

      const registry = new SchemaRegistry({ host: messagePayload.schemaRegistryUrl })
      const producer = kafka.producer()

      const run = async () => {
        const outgoingMessage = {
          value: await registry.encode(messagePayload.schemaId, JSON.parse(messagePayload.message))
        }
        await producer.connect()
        await producer.send({
          topic: messagePayload.topic,
          messages: [outgoingMessage]
        })
      }

      run().catch(async e => {
        console.error(e)
        producer && await producer.disconnect()
      })
    }
  }

  const listTopics = {
    channel: CHANNELS.KAFKA.LIST_TOPICS,
    handle: async (_event: IpcMainInvokeEvent, brokersUrl: string) => {
      const admin = new Kafka({
        brokers: brokersUrl.split(','),
        clientId,
      }).admin()

      const run = async () => {
        await admin.connect()
        return await admin.listTopics()
      }

      return run().catch(async e => {
        console.error(e)
        admin && admin.disconnect()
      })
    }
  }

  return {
    onConsumeMessageRequest,
    onStopConsumingRequest,
    sendMessage,
    listTopics
  }
}
