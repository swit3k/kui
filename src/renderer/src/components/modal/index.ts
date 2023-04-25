import { ROOT_EMITTER } from "@renderer/constants"
import mitt from "mitt"

export const MODAL_EMITTER_NAME = `${ROOT_EMITTER}.modal`

export type ShowModalEvent = {
  title: string
  content: string
}

export type ModalEvents = {
  show: ShowModalEvent
}

export const emitter = mitt<ModalEvents>()

export const showModal = (event: ShowModalEvent) => emitter.emit('show', event)

export const Modals = {
  info: {
    MESSAGE_SENT: (topic: string) => ({
      title: "Success",
      content: `Message was successfully sent to topic ${topic}`
    })
  },
  error: {
    TOPIC_IS_EMPTY: {
      title: "Error",
      content: "Topic cannot be empty"
    },
    SUBJECT_IS_EMPTY: {
      title: "Sync & choose Subject",
      content: "You must first run 'Sync' on Schema Registry and choose Subject"
    },
    UNABLE_TO_SEND_MESSAGE: (e: any) => ({
      title: "Error",
      content: `Error occurred while sending message: ${e.message}`,
    }),
    UNABLE_TO_CONSUME_MESSAGE: (e: any) => ({
      title: "Error",
      content: `Error occurred while consuming message(s): ${e.message}`,
    })
  }
}
