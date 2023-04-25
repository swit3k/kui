import { ElectronAPI } from '@electron-toolkit/preload'
import { ConsumeRequestPayload, StopConsumingPayload } from '../shared/types';

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      fetchSchemaRegistry: (schemaRegistryUrl: string) => Promise<any>,
      fetchSchema: (schemaRegistryUrl: string, schemaId: number) => Promise<any>,
      fetchLatestSchemaId: (schemaRegistryUrl: string, subject: string) => Promise<number>,
      sendMessage: (messagePayload: MessagePayload) => Promise<any>,
      validateMessage: (schemaRegistryUrl: string, schemaId: number, message: string) => Promise<boolean>,
      listTopics: (schemaRegistryUrl: string) => Promise<any>,
      sendConsumeMessageRequest: (payload: ConsumeRequestPayload) => Promise<any>,
      sendStopConsumingRequest: (payload: StopConsumingPayload) => Promise<any>,
      onIncomingMessage: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => void
      onLastMessageMarker: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => void
    }
  }
}
