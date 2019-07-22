import * as functions from 'firebase-functions'
import { App, ExpressReceiver, directMention } from '@slack/bolt'
import { rollDice } from './controller/dice-controller'
import { ping } from './controller/ping-controller'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((_, response) => {
  response.send('Hello from Firebase!')
})

// ref: https://github.com/seratch/bolt-on-cloud-functions-for-firebase

const config = functions.config()

const expressReceiver = new ExpressReceiver({
  signingSecret: config.slack.secret,
  endpoints: '/events',
})

const app = new App({
  receiver: expressReceiver,
  token: config.slack.bot.token,
})

app.error(console.log)
app.message(/\b(\d+)D(\d+)\b/i, ({ context, say }) => {
  const diceCount = parseInt(context.matches[1], 10)
  const maxNumber = parseInt(context.matches[2], 10)

  const result = rollDice(diceCount, maxNumber)
  if (result) {
    say(result)
  }
})
app.message(directMention, ping, ({ say }) => {
  say('pong')
})

export const thunder = functions.https.onRequest(expressReceiver.app)
