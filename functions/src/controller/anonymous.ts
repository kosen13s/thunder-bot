import { WebClient } from '@slack/web-api'
import { CommandHandler } from '../types'

export const postAsAnonymous = (token: string): CommandHandler => {
  return async ({ ack, command, context }) => {
    ack()
    const client = new WebClient(context.token)
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
