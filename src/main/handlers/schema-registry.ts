import { IpcMainInvokeEvent } from 'electron';
import { http } from '../http/http';
import { CHANNELS } from '../../shared/channels';

import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

export const SchemaRegistryHandlers = () => {
  const fetchSubjects = {
    channel: CHANNELS.SCHEMA_REGISTRY.FETCH_SUBJECTS,
    handle: async (_event: IpcMainInvokeEvent, schemaRegistryUrl: string) => {
      return http({ url: `${schemaRegistryUrl}/subjects` })
    }
  }

  const fetchSchema = {
    channel: CHANNELS.SCHEMA_REGISTRY.FETCH_SCHEMA,
    handle: async (_event: IpcMainInvokeEvent, schemaRegistryUrl: string, schemaId: number) => {
      return http({ url: `${schemaRegistryUrl}/schemas/ids/${schemaId}` })
    }
  }

  const fetchLatestSchemaId = {
    channel: CHANNELS.SCHEMA_REGISTRY.FETCH_LATEST_ID,
    handle: async (_event: IpcMainInvokeEvent, schemaRegistryUrl: string, subject: string) => {

      const registry = new SchemaRegistry({ host: schemaRegistryUrl })
      const id = await registry.getLatestSchemaId(subject)
      return Promise.resolve(id)
    }
  }

  const validateMessage = {
    channel: CHANNELS.SCHEMA_REGISTRY.VALIDATE_MESSAGE,
    handle: async (_event: IpcMainInvokeEvent, schemaRegistryUrl: string, schemaId: number, message: any) => {

      const registry = new SchemaRegistry({ host: schemaRegistryUrl })
      const schema = await registry.getSchema(schemaId)

      console.log('validating schema', schemaRegistryUrl, schemaId)
      return Promise.resolve(schema.isValid(JSON.parse(message)))
    }
  }

  return { fetchSubjects, fetchSchema, fetchLatestSchemaId, validateMessage }
}
