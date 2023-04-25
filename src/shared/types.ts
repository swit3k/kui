export interface OutgoingMessagePayload {
  brokersUrl: string,
  schemaRegistryUrl: string,
  schemaId: number,
  topic: string,
  message: string
}

export interface LastMessageMarker {
  topic: string
}

export enum ConsumerType {
  FROM_BEGINNING, FROM_END_FORWARD, FROM_END_BACKWARD
}

export interface IncomingMessagePayload {
  partition: number,
  message: any
}

export interface ConsumeRequestPayload {
  brokersUrl: string,
  schemaRegistryUrl: string,
  topic: string,
  limit: number,
  type: string
}

export interface StopConsumingPayload {
  topic: string
}
