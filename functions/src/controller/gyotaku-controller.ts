import { config } from 'firebase-functions'
import {
  Middleware,
  SlackActionMiddlewareArgs,
  MessageAction,
} from '@slack/bolt'
import { WebClient } from '@slack/web-api'

const tsToDateTimeString = (ts: string) => {
  const unixTime = Math.floor(Number(ts))
  const date = new Date(unixTime * 1000)
  return date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
}

interface GenerateGyotakuMessageParams {
  channel: string
  user?: string
  timestamp: string
  text?: string
}

const generateGyotakuMessage = (params: GenerateGyotakuMessageParams) => {
  const threeBackQuotes = '```'
  return `
${threeBackQuotes}
channel: <#${params.channel}>
user: <@${params.user}>
timestamp: ${tsToDateTimeString(params.timestamp)}
${threeBackQuotes}
${params.text}
`
}

export const takeGyotaku = (
  client: WebClient
): Middleware<SlackActionMiddlewareArgs<MessageAction>> => {
  return async ({ ack, body, context }) => {
    ack()
    if (body.type !== 'message_action') {
      return
    }
    /* <@USER_ID> の形式のユーザ解決って確か非推奨だった気がするので、正規の手段で解決する方法をコメントで残しておく
      const usersInfoResult: any = await client.users.info({
        token: context.botToken,
        user: body.message.user!}).catch(() => {user: {}})
    */
    const text = generateGyotakuMessage({
      channel: body.channel.id,
      // user: usersInfoResult.user.name,
      user: body.message.user,
      timestamp: body.message_ts,
      text: body.message.text,
    })

    await client.chat.postMessage({
      token: context.botToken,
      channel: config().slack.gyotaku.channel,
      text,
    })
  }
}
