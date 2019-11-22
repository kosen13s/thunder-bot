import { MessageHandler } from '../types'
import { generateSayArgument } from '../wrapper/bolt'

export const ping: MessageHandler = ({ message, say }) => {
  say(generateSayArgument(message, 'pong'))
}
