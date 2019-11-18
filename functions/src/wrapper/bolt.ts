import { MessageEvent } from '@slack/bolt'

export const generateSayArgument = (
  messageEvent: MessageEvent,
  text: string
) => ({
  channel: messageEvent.channel,
  thread_ts: messageEvent.thread_ts,
  text,
})
