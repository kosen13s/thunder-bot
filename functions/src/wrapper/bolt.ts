import { SayFn, MessageEvent } from '@slack/bolt'

export const sayToSameChannel = (
  say: SayFn,
  messageEvent: MessageEvent,
  text: string
) => {
  say({
    channel: messageEvent.channel,
    thread_ts: messageEvent.thread_ts, // eslint-disable-line @typescript-eslint/camelcase
    text,
  })
}
