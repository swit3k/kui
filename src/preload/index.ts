import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { ConsumeRequestPayload, OutgoingMessagePayload, StopConsumingPayload } from '../shared/types'
import { IpcRendererEvent } from '@electron-toolkit/preload'
import { CHANNELS } from '../shared/channels'

// Custom APIs for renderer
const api = {
  fetchSchemaRegistry: (url: string) =>
    electronAPI.ipcRenderer.invoke(CHANNELS.SCHEMA_REGISTRY.FETCH_SUBJECTS, url),
  fetchSchema: (url: string, schemaId: number) =>
    electronAPI.ipcRenderer.invoke(CHANNELS.SCHEMA_REGISTRY.FETCH_SCHEMA, url, schemaId),
  fetchLatestSchemaId: (url: string, subject: string) =>
    electronAPI.ipcRenderer.invoke(CHANNELS.SCHEMA_REGISTRY.FETCH_LATEST_ID, url, subject),
  validateMessage: (url: string, schemaId: number, message: string) =>
    electronAPI.ipcRenderer.invoke(CHANNELS.SCHEMA_REGISTRY.VALIDATE_MESSAGE, url, schemaId, message),
  sendMessage: (messagePayload: OutgoingMessagePayload) =>
    electronAPI.ipcRenderer.invoke(CHANNELS.KAFKA.SEND_REQUEST, messagePayload),
  listTopics: (url: string) =>
    electronAPI.ipcRenderer.invoke(CHANNELS.KAFKA.LIST_TOPICS, url),
  sendConsumeMessageRequest: (payload: ConsumeRequestPayload) =>
    electronAPI.ipcRenderer.send(CHANNELS.KAFKA.CONSUME_REQUEST, payload),
  sendStopConsumingRequest: (payload: StopConsumingPayload) =>
    electronAPI.ipcRenderer.send(CHANNELS.KAFKA.STOP_CONSUMING, payload),
  onIncomingMessage: (callback: (event: IpcRendererEvent, ...args: any[]) => void) =>
    electronAPI.ipcRenderer.on(CHANNELS.KAFKA.INCOMING_MESSAGE, callback),
  onLastMessageMarker: (callback: (event: IpcRendererEvent, ...args: any[]) => void) =>
    electronAPI.ipcRenderer.on(CHANNELS.KAFKA.LAST_MESSAGE_MARKER, callback),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
