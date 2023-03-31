import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface MessagePayload {
  brokersUrl: string,
  schemaRegistryUrl: string,
  schemaId: number,
  topic: string,
  message: string
}

// Custom APIs for renderer
const api = {
  fetchSchemaRegistry: (url: string) => electronAPI.ipcRenderer.invoke("schemaRegistry:fetchSubjects", url),
  fetchLatestSchemaId: (url: string, subject: string) => electronAPI.ipcRenderer.invoke("schemaRegistry:fetchLatestSchemaId", url, subject),
  sendMessage: (messagePayload: MessagePayload) => electronAPI.ipcRenderer.invoke("kafka:sendMessage", messagePayload)
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
