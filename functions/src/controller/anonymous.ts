import { CommandHandler } from '../types'

export const postAsAnonymous: CommandHandler = async ({
  ack,
  command,
  say,
}) => {
  ack()
  say({
    channel: command.channel_name,
    text: command.text,
  })
}
