import {
  Middleware,
  SlackActionMiddlewareArgs,
  MessageAction,
} from '@slack/bolt'

const generateGyotakuMessage = (message: MessageAction) => `
\`\`\`
${message.user.id} [${message.message_ts}]
${message}
\`\`\`
`

export const takeGyotaku: Middleware<SlackActionMiddlewareArgs> = ({
  ack,
  body,
  say,
}) => {
  ack()
  console.log(body)
  if (body.type !== 'message_action') {
    return
  }
  say({
    channel: 'gyotaku',
    text: generateGyotakuMessage(body),
  })
}
