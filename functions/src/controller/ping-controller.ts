import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt'

export const ping: Middleware<SlackEventMiddlewareArgs<'message'>> = ({
  message,
  next,
}) => {
  if (message.text === undefined) {
    return
  }
  const pingPattern = /^ping$/i
  if (pingPattern.exec(message.text.trim())) {
    next()
  }
}
