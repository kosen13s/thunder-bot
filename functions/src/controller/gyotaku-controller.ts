import { config } from 'firebase-functions'
import {
  Middleware,
  SlackActionMiddlewareArgs,
  MessageAction,
} from '@slack/bolt'

const tsToDateTimeString = (ts: string) => {
  const unixTime = Math.floor(Number(ts))
  const date = new Date(unixTime * 1000)
  return date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
}

const generateGyotakuMessage = (body: MessageAction) => `
\`\`\`
channel: <#${body.channel.id}>
user: ${body.message.username}
timestamp: ${tsToDateTimeString(body.message_ts)}
\`\`\`
${body.message.text}
`

export const takeGyotaku: Middleware<SlackActionMiddlewareArgs> = ({
  ack,
  body,
  say,
}) => {
  ack()
  if (body.type !== 'message_action') {
    return
  }
  say({
    channel: config().slack.gyotaku.channel,
    text: generateGyotakuMessage(body),
  })
}
