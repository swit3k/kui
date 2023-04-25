import { Consumer, ConsumerSubscribeTopics, EachMessagePayload, Kafka } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Observable, Subscriber } from 'rxjs';
import { ConsumerType, IncomingMessagePayload } from '../../shared/types';
import { randomUUID } from 'crypto';
import { KafkaConsumerConfig } from '../handlers/kafka';

export class KafkaConsumer {
  private readonly kafkaConsumer: Consumer
  private topic: string = ""

  public constructor(private kafka: Kafka, private schemaRegistry: SchemaRegistry) {
    this.kafkaConsumer = this.createKafkaConsumer()
    this.bindErrorHandlers(this.kafkaConsumer)
  }

  public async startConsumer(config: KafkaConsumerConfig): Promise<Observable<IncomingMessagePayload>> {
    this.topic = config.topic

    const topic: ConsumerSubscribeTopics = {
      topics: [this.topic],
      fromBeginning: config.type == ConsumerType.FROM_BEGINNING.toString()
    }

    try {
      await this.kafkaConsumer.connect()
      await this.kafkaConsumer.subscribe(topic)

      return Promise.resolve(
        new Observable((subscriber: Subscriber<IncomingMessagePayload>) => {
          this.kafkaConsumer.run({
            eachMessage: async (messagePayload: EachMessagePayload) => {
              const decodedMessage = {
                ...messagePayload.message,
                value: await this.schemaRegistry.decode(messagePayload.message.value as Buffer)
              }

              subscriber.next({ partition: messagePayload.partition, message: decodedMessage })
            }
          })
        })
      )
    } catch (error) {
      console.log('Error: ', error)
      return Promise.reject(error)
    }
  }

  public async disconnect() {
    await this.kafkaConsumer.disconnect()
  }

  public getTopic() {
    return this.topic
  }

  private createKafkaConsumer(): Consumer {
    return this.kafka.consumer({ groupId: `kui-group-${randomUUID()}` })
  }

  private bindErrorHandlers(consumer: Consumer) {
    const errorTypes = ['unhandledRejection', 'uncaughtException']
    const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

    errorTypes.forEach(type => {
      process.removeAllListeners(type)
      process.on(type, async e => {
        try {
          console.log(`Process.on ${type}`)
          console.error(e)
          await consumer.disconnect()
          process.exit(0)
        } catch (_) {
          process.exit(1)
        }
      })
    })

    signalTraps.forEach(type => {
      process.once(type, async () => {
        try {
          await consumer.disconnect()
        } finally {
          process.kill(process.pid, type)
        }
      })
    })
  }
}
