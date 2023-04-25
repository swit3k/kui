export const CHANNELS = {
  KAFKA: {
    OUTGOING_MESSAGE: "kafka:outgoingMessage",
    INCOMING_MESSAGE: "kafka:incomingMessage",
    CONSUME_REQUEST: "kafka:consumeRequest",
    SEND_REQUEST: "kafka:sendRequest",
    STOP_CONSUMING: "kafka:stopConsuming",
    LIST_TOPICS: "kafka:listTopics",
    LAST_MESSAGE_MARKER: "kafka:lastMessageMarker",
  },
  SCHEMA_REGISTRY: {
    FETCH_SUBJECTS: "schemaRegistry:fetchSubjects",
    FETCH_SCHEMA: "schemaRegistry:fetchSchema",
    FETCH_LATEST_ID: "schemaRegistry:fetchLatestSchemaId",
    VALIDATE_MESSAGE: "schemaRegistry:validateMessage"
  }
}
