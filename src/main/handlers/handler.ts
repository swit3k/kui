import { ipcMain, IpcMain, IpcMainEvent, IpcMainInvokeEvent } from "electron"
import { KafkaHandlers } from "./kafka"
import { SchemaRegistryHandlers } from "./schema-registry"

export interface IpcHandler {
  channel: string
  handle: (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<void>) | (any)
}

export interface IpcEvent {
  channel: string
  listener: (event: IpcMainEvent, ...args: any[]) => (Promise<void>) | (any)
}

const registerHandler = (ipcMain: IpcMain, handler: IpcHandler) => ipcMain.handle(handler.channel, handler.handle)

export const registerHandlers = () => {
  registerHandler(ipcMain, SchemaRegistryHandlers.fetchSubjects)
  registerHandler(ipcMain, SchemaRegistryHandlers.fetchSchema)
  registerHandler(ipcMain, SchemaRegistryHandlers.fetchLatestSchemaId)
  registerHandler(ipcMain, SchemaRegistryHandlers.validateMessage)

  registerHandler(ipcMain, KafkaHandlers.sendMessage)
  registerHandler(ipcMain, KafkaHandlers.listTopics)
}
