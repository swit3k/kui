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
  fetchLatestSchemaId: {
    channel: "schemaRegistry:fetchLatestSchemaId",
    handle: async (_event: IpcMainInvokeEvent, schemaRegistryUrl: string, subject: string) => {

      const registry = new SchemaRegistry({ host: schemaRegistryUrl })
      const id = await registry.getLatestSchemaId(subject)
      return Promise.resolve(id)
    }
  }
}
