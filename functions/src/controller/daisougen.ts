import { WebClient } from '@slack/web-api'
import { MessageHandler, ReactionHandler } from '../types'

interface MessageReactionAddedEvent {
  type: 'message'
  channel: string
  ts: string
}

interface OtherReactionAddedEvent {
  type: '' // ファイルコメントなど、省略
}

type ReactionAddedEventItem =
  | MessageReactionAddedEvent
  | OtherReactionAddedEvent

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
    } = await client.conversations.replies({
      token: userToken,
      channel: channel,
      ts,
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

export const startDaisougen = (userToken: string): MessageHandler => {
  return async ({ message, context }) => {
    const client = new WebClient(context.token)
    const result: { [key: string]: unknown } = await client.chat.postMessage({
      token: userToken,
      channel: message.channel,
      thread_ts: message.thread_ts,
      text: `:${daisougenEmoji(1)}::${daisougenEmoji(2)}::${daisougenEmoji(
        3
      )}:`,
      username: botAlias,
      icon_emoji: ':slot_machine:',
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

export const stopDaisougen = (userToken: string): ReactionHandler => {
  return async ({ event, context }) => {
    console.log('reaction', event)

    const match = event.reaction.match(/^push-([123])$/)
    const item = event.item as ReactionAddedEventItem

    if (match === null || item.type !== 'message') {
      return
    }

    console.log('reaction match', match)

    const client = new WebClient(context.token)
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

    const newEmoji = ['dai', 'sou', 'gen'][Math.floor(Math.random() * 3)]
    const newText = (message.text as string).replace(
      daisougenEmoji(match[1]),
      newEmoji
    )

    console.log('new text', newText)

    const updated = await client.chat.update({
      token: userToken,
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
        token: userToken,
        channel: item.channel,
        ts: item.ts,
        text: grasses,
      })
      console.log('updated', updated)
    }
  }
}
