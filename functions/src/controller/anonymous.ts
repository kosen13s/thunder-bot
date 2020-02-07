import { WebClient } from '@slack/web-api'
import { CommandHandler } from '../types'

export const postAsAnonymous = (
  client: WebClient,
  token: string
): CommandHandler => {
  return async ({ ack, command }) => {
    ack()
    const result = await client.chat.postMessage({
      token,
      channel: command.channel_id,
      text: command.text,
      username: 'Anonymous',
      icon_emoji: ':bust_in_silhouette:',
    })
    console.log(result)
  }
}
