import { ipcMain, IpcMain, IpcMainInvokeEvent } from "electron"
import { KafkaHandlers } from "./kafka"
import { SchemaRegistryHandlers } from "./schema-registry"

export interface IpcHandler {
  channel: string
  handle: (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<void>) | (any)
}

const registerHandler = (ipcMain: IpcMain, handler: IpcHandler) => ipcMain.handle(handler.channel, handler.handle)

export const registerHandlers = () => {
  registerHandler(ipcMain, SchemaRegistryHandlers.fetchSubjects)
  registerHandler(ipcMain, SchemaRegistryHandlers.fetchLatestSchemaId)

  registerHandler(ipcMain, KafkaHandlers.sendMessage)
}
