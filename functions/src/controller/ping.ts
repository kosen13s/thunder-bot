import { MessageHandler } from '../types'
import { generateSayArgument } from '../wrapper/bolt'

export const PING_MESSAGE = /\bping\b/i

export const ping: MessageHandler = ({ message, say }) => {
  say(generateSayArgument(message, 'pong'))
}
