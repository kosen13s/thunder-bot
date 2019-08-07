import { WebClient } from '@slack/web-api'
import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt'

const botAlias = 'daisougen-slot'
const daisougenEmoji = (i: string | number): string => `daisougen-roulette-${i}`

export const startDaisougen = (
  client: WebClient
): Middleware<SlackEventMiddlewareArgs<'message'>> => {
  return async ({ message, context }) => {
    const result: any = await client.chat.postMessage({
      token: context.botToken,
      channel: message.channel,
      text: `:${daisougenEmoji(1)}::${daisougenEmoji(2)}::${daisougenEmoji(
        3
      )}:`,
      username: botAlias,
    })

    console.log(result)

    for (const i of [1, 2, 3]) {
      await client.reactions.add({
        token: context.botToken,
        name: `push-${i}`,
        channel: message.channel,
        timestamp: result.ts,
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
    if (match === null || (event.item as any).type !== 'message') {
      return
    }

    console.log('reaction match', match)
    const item = event.item as { channel: string; ts: string }

    let result: any
    try {
      result = await client.conversations.history({
        token: userToken,
        channel: item.channel,
        latest: item.ts,
        limit: 1,
        inclusive: true,
      })
    } catch (err) {
      console.log('history failed', err)
      console.log('response metadata')
      console.log(' S:', err.data.response_metadata.scopes)
      console.log('AS:', err.data.response_metadata.acceptedScopes)

      return
    }

    const message = result.messages[0]
    console.log('history', message)

    if (message.username !== botAlias) {
      console.log('username', message.username)
      return
    }

    const reactionTs = event.event_ts.match(/[^.]*/)![0]
    const newEmoji = ['dai', 'sou', 'gen'][
      parseInt(reactionTs + match[1], 10) % 3
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
  }
}
