import { IpcMainInvokeEvent } from 'electron';

import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Kafka } from 'kafkajs';

interface MessagePayload {
  brokersUrl: string,
  schemaRegistryUrl: string,
  schemaId: number,
  topic: string,
  message: string
}

export const KafkaHandlers = {
  sendMessage: {
    channel: "kafka:sendMessage",
    handle: async (_event: IpcMainInvokeEvent, messagePayload: MessagePayload) => {

      console.log(`Received: ${JSON.stringify(messagePayload)}`)

      const kafka = new Kafka({
        brokers: messagePayload.brokersUrl.split(','),
        clientId: 'kui-consumer',
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
          messages: [ outgoingMessage ]
        })
      }

      run().catch(async e => {
        console.error(e)
        producer && await producer.disconnect()
      })






    }
  }
}
