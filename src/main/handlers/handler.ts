import { BrowserWindow, ipcMain, IpcMain, IpcMainEvent, IpcMainInvokeEvent } from "electron"
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
const registerListener = (ipcMain: IpcMain, event: IpcEvent) => ipcMain.on(event.channel, event.listener)

export const registerHandlers = (mainWindow: BrowserWindow) => {
  registerHandler(ipcMain, SchemaRegistryHandlers().fetchSubjects)
  registerHandler(ipcMain, SchemaRegistryHandlers().fetchSchema)
  registerHandler(ipcMain, SchemaRegistryHandlers().fetchLatestSchemaId)
  registerHandler(ipcMain, SchemaRegistryHandlers().validateMessage)

  registerHandler(ipcMain, KafkaHandlers(mainWindow).sendMessage)
  registerListener(ipcMain, KafkaHandlers(mainWindow).onConsumeMessageRequest)
  registerListener(ipcMain, KafkaHandlers(mainWindow).onStopConsumingRequest)
  registerHandler(ipcMain, KafkaHandlers(mainWindow).listTopics)
}
