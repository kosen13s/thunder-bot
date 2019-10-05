import { WebClient } from '@slack/web-api'
import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt'

type ReactionAddedEventItem =
  | {
      type: 'message'
      channel: string
      ts: string
    }
  | {
      type: '' // ファイルコメントなど、省略
    }

const botAlias = 'daisougen-slot'
const daisougenEmoji = (i: string | number): string => `daisougen-roulette-${i}`

interface MessageFetchResult {
  text: string
  username: string
}

const fetchMessage = async (
  client: WebClient,
  userToken: string,
  channel: string,
  ts: string
): Promise<MessageFetchResult | null> => {
  try {
    const result: {
      [key: string]: unknown
    } = await client.conversations.history({
      token: userToken,
      channel: channel,
      latest: ts,
      limit: 1,
      inclusive: true,
    })

    console.log(result.messages)
    if (!(result.messages instanceof Array)) {
      throw result
    }

    return result.messages[0]
  } catch (err) {
    console.log('history failed', err)

    return null
  }
}

export const startDaisougen = (
  client: WebClient
): Middleware<SlackEventMiddlewareArgs<'message'>> => {
  return async ({ message, context }) => {
    const result: { [key: string]: unknown } = await client.chat.postMessage({
      token: context.botToken,
      channel: message.channel,
      text: `:${daisougenEmoji(1)}::${daisougenEmoji(2)}::${daisougenEmoji(
        3
      )}:`,
      username: botAlias,
      icon_emoji: ':slot_machine:', // eslint-disable-line
    })

    console.log(result)

    for (const i of [1, 2, 3]) {
      await client.reactions.add({
        token: context.botToken,
        name: `push-${i}`,
        channel: message.channel,
        timestamp: result.ts as string,
      })
    }
  }
}

export const stopDaisougen = (
  client: WebClient,
  userToken: string
): Middleware<SlackEventMiddlewareArgs<'reaction_added'>> => {
  return async ({ event, context }) => {
    console.log('reaction', event)

    const match = event.reaction.match(/^push-([123])$/)
    const item = event.item as ReactionAddedEventItem

    if (match === null || item.type !== 'message') {
      return
    }

    console.log('reaction match', match)

    const message = await fetchMessage(client, userToken, item.channel, item.ts)
    console.log('history', message)

    if (message === null) {
      return
    }

    if (message.username !== botAlias) {
      console.log('username', message.username)
      return
    }

    const reactionTss = event.event_ts.match(/[^.]*/)
    if (reactionTss === null) {
      console.log('stopFailed')
      return
    }

    const newEmoji = ['dai', 'sou', 'gen'][
      parseInt(reactionTss[0] + match[1], 10) % 3
    ]
    const newText = (message.text as string).replace(
      daisougenEmoji(match[1]),
      newEmoji
    )

    console.log('new text', newText)

    const updated = await client.chat.update({
      token: context.botToken,
      channel: item.channel,
      ts: item.ts,
      text: newText,
    })

    console.log('updated', updated)

    if (newText === ':sou::sou::sou:') {
      // 草フィーバー
      await new Promise(resolve => setTimeout(resolve, 1000)) // 普通にsetTimeoutするとfunction実行終了で途切れる
      const grasses = ':kusa::kusa::kusa:'
      console.log('new text', grasses)

      const updated = await client.chat.update({
        token: context.botToken,
        channel: item.channel,
        ts: item.ts,
        text: grasses,
      })
      console.log('updated', updated)
    }
  }
}
