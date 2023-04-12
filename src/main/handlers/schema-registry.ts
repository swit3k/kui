import { IpcMainInvokeEvent } from 'electron';
import { http } from '../http/http';

import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

export const SchemaRegistryHandlers = {
  fetchSubjects: {
    channel: "schemaRegistry:fetchSubjects",
    handle: async (_event: IpcMainInvokeEvent, schemaRegistryUrl: string) => {
      return http({ url: `${schemaRegistryUrl}/subjects` })
    }
  },
  fetchSchema: {
    channel: "schemaRegistry:fetchSchema",
    handle: async (_event: IpcMainInvokeEvent, schemaRegistryUrl: string, schemaId: number) => {
      return http({ url: `${schemaRegistryUrl}/schemas/ids/${schemaId}` })
    }
  },
  fetchLatestSchemaId: {
    channel: "schemaRegistry:fetchLatestSchemaId",
    handle: async (_event: IpcMainInvokeEvent, schemaRegistryUrl: string, subject: string) => {

      const registry = new SchemaRegistry({ host: schemaRegistryUrl })
      const id = await registry.getLatestSchemaId(subject)
      return Promise.resolve(id)
    }
  },
  validateMessage: {
    channel: "schemaRegistry:validateMessage",
    handle: async (_event: IpcMainInvokeEvent, schemaRegistryUrl: string, schemaId: number, message: any) => {

      const registry = new SchemaRegistry({ host: schemaRegistryUrl })
      const schema = await registry.getSchema(schemaId)
      return Promise.resolve(schema.isValid(JSON.parse(message)))
    }
  },
}
